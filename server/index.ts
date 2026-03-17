import * as dotenv from 'dotenv';
import path from 'path';
// Ensure environment variables are loaded before any other imports
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
// Environment and startup logs removed to reduce noise

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { db } from '../src/db/index';
import { issues, users, notifications } from '../src/db/schema';
import { eq, desc, and, isNotNull } from 'drizzle-orm';
import { clerkMiddleware, clerkClient, getAuth, authenticateRequest } from '@clerk/express';
import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
app.set('trust proxy', true);
// 1. Clerk Middleware MUST be first to handle auth consistency
app.use(clerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
}));

app.use(cors());
app.use(express.json());

// JSON-friendly requireAuthApi middleware
const requireAuthApi = async (req: Request, res: Response, next: NextFunction) => {
  const auth = getAuth(req);
  const userId = auth.userId;

  // Manual fallback if standard middleware missed it (common in dev/proxy)
  if (!userId && req.headers.authorization) {
    try {
      const result = await authenticateRequest({
        request: req,
        clerkClient,
        options: {
          publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
          secretKey: process.env.CLERK_SECRET_KEY,
        }
      });
      if (result.status === 'signed-in') {
        const authData = result.toAuth();
        Object.defineProperty(req, 'auth', {
          get: () => authData,
          configurable: true,
        });
        return next();
      }
    } catch { /* fallback ignored if error */ }
  }

  const finalUserId = userId; // getAuth(req) is the source of truth now

  if (!finalUserId) {
    return res.status(401).json({ error: 'Unauthorized: Session expired or missing' });
  }

  // --- JUST-IN-TIME (JIT) USER SYNC ---
  // Ensure user exists in DB before proceeding to prevent FK violations
  try {
    const clerkUser = await clerkClient.users.getUser(finalUserId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';
    
    await db.insert(users).values({
      id: finalUserId,
      name,
      email: email || `${finalUserId}@example.com`,
      role: 'citizen',
      avatar: clerkUser.imageUrl,
      createdAt: new Date(),
    }).onConflictDoNothing();
  } catch (syncError) {
    // If we fail here, the next DB operation will likely fail too, but we continue for resiliency
    console.error('[User Sync Error]', (syncError as Error).message);
  }

  next();
};

// Log API requests for debugging (disabled to reduce noise)
app.use('/api', (req, res, next) => {
  // const authHeader = req.headers.authorization;
  // console.log(`[API TRACE] ${req.method} ${req.url} | Auth: ${authHeader ? 'Present' : 'Missing'}`);
  
  // Enforce JSON Content-Type for all /api responses
  const originalJson = res.json;
  res.json = function(body) {
    res.setHeader('Content-Type', 'application/json');
    return originalJson.call(this, body);
  };
  
  next();
});

// ─── Cloudflare R2 Client (S3-Compatible) ─────────────────── //
const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET = process.env.R2_BUCKET_NAME || 'prajaconnect';
// Public URL base — set R2_PUBLIC_URL in .env if you have a custom domain/public bucket
const R2_PUBLIC_BASE = process.env.R2_PUBLIC_URL ||
  `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET}`;

// multer: store upload in memory (max 10 MB)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Basic health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ─── Image Upload → Cloudflare R2 ──────────────────────────── //
app.post('/api/upload-image', requireAuthApi, upload.single('image'), async (req: Request, res: Response) => {
  try {
    const multerReq = req as Express.Request;
    if (!multerReq.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const ext = multerReq.file.mimetype.split('/')[1] || 'jpg';
    const key = `issues/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    await r2.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: multerReq.file.buffer,
      ContentType: multerReq.file.mimetype,
      // Remove ACL — Cloudflare R2 uses bucket-level public access settings
    }));

    const publicUrl = `${R2_PUBLIC_BASE}/${key}`;
    res.json({ url: publicUrl });
  } catch (error) {
    console.error('R2 upload error:', error);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

// AI Analysis Endpoint with Multi-Model Fallback
app.post('/api/analyze-issue', async (req: Request, res: Response) => {
  const { title, description } = req.body;
  
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  const systemPrompt = "You are a civic issue analyzer for PrajaConnect. Analyze the given title and description of a civic issue. Categorize it into one of: 'Infrastructure', 'Sanitation', 'Safety', or 'General'. Assign a priority: 'Low', 'Medium', 'High', or 'Critical'. Provide a confidence score (0-100). Return ONLY a JSON object with keys: category, priority, confidence.";
  const userPrompt = `Title: ${title}\nDescription: ${description}`;

  // Try Groq first
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    return res.json({ ...parsed, model: "Groq Llama-3.3-70B" });
  } catch (groqError) {
    console.error('Groq Primary failed, falling back to Gemini:', groqError);
    
    // Fallback to Gemini
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });
      
      const prompt = `${systemPrompt}\n\nUser Issue:\n${userPrompt}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const parsed = JSON.parse(text);
      return res.json({ ...parsed, model: "Gemini 1.5-Flash" });
    } catch (geminiError) {
      console.error('Gemini Secondary failed:', geminiError);
      res.status(500).json({ error: 'All AI models failed' });
    }
  }
});

// Platform Stats
app.get('/api/stats', async (req: Request, res: Response) => {
  try {
    const [userCount] = await db.select({ count: db.$count(users) }).from(users);
    const [issueCount] = await db.select({ count: db.$count(issues) }).from(issues);
    const [resolvedCount] = await db.select({ count: db.$count(issues) }).from(issues).where(eq(issues.status, 'Resolved'));

    // Calculate real Average Resolution Time
    const resolvedIssues = await db.select({
      createdAt: issues.createdAt,
      resolvedAt: issues.resolvedAt
    }).from(issues).where(and(eq(issues.status, 'Resolved'), isNotNull(issues.resolvedAt)));

    let avgResponseTime = '0'; // Default if no data
    if (resolvedIssues.length > 0) {
      const totalHours = resolvedIssues.reduce((acc, iss) => {
        const resolutionTimeMs = new Date(iss.resolvedAt!).getTime() - new Date(iss.createdAt).getTime();
        return acc + (resolutionTimeMs / (1000 * 60 * 60));
      }, 0);
      const avgHours = Math.round(totalHours / resolvedIssues.length);
      avgResponseTime = `${avgHours}h`;
    }

    res.json({
      citizens: userCount?.count || 0,
      issues: issueCount?.count || 0,
      resolved: resolvedCount?.count || 0,
      avgResponseTime
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// ───────────────── ISSUES API ───────────────── //

// Get all issues
app.get('/api/issues', async (req: Request, res: Response) => {
  try {
    const allIssues = await db.select().from(issues).orderBy(desc(issues.createdAt));
    res.json(allIssues);
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

// Create a new issue (Requires Authentication)
app.post('/api/issues', requireAuthApi, async (req: Request, res: Response) => {
  try {
    const { title, description, category, priority, location, isPetition, aiCategoryConfidence, imageUrl, lat, lng } = req.body;
    const userId = getAuth(req).userId!; // Guaranteed by requireAuthApi

    // console.log(`[ISSUE] New report from ${userId}: ${title} | Priority: ${priority}`);

    // Calculate SLA Deadline based on priority
    // Critical: 12h, High: 24h, Medium: 48h, Low: 72h
    let slaHours = 48;
    switch (priority) {
      case 'Critical': slaHours = 12; break;
      case 'High': slaHours = 24; break;
      case 'Medium': slaHours = 48; break;
      case 'Low': slaHours = 72; break;
    }
    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    const newIssue = await db.insert(issues).values({
      id: `ISS-${Math.floor(2500 + Math.random() * 7500)}`,
      title,
      description,
      reporterId: userId, // The authenticated user
      category,
      aiCategoryConfidence, // Optional field from the AI analysis
      priority,
      status: 'Pending',
      location,
      slaDeadline,
      escalationLevel: 'Normal',
      isPetition: isPetition || false,
      imageUrl: imageUrl || null,
      lat: lat || null,
      lng: lng || null,
      upvotes: 0,
    }).returning();

    if (!newIssue || newIssue.length === 0) {
      throw new Error('Failed to insert issue into database');
    }

    // console.log(`[ISSUE] Successfully saved: ${newIssue[0].id} (SLA: ${slaHours}h)`);

    // Create a notification for the user
    await db.insert(notifications).values({
      id: `NOTIF-${Date.now()}`,
      userId: userId,
      type: 'STATUS_CHANGE',
      title: 'Issue Reported Successfully',
      message: `Your report "${title}" has been submitted and is being reviewed.`,
      linkToIssueId: newIssue[0].id,
      isRead: false,
    });

    res.status(201).json(newIssue[0]);
  } catch (error) {
    console.error('CRITICAL ERROR creating issue:', error);
    res.status(500).json({ 
      error: 'Failed to create issue',
      message: error instanceof Error ? error.message : 'Unknown database error'
    });
  }
});

// Upvote an issue (Requires Auth)
app.post('/api/issues/:id/upvote', requireAuthApi, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    
    // In a real app, you'd check a separate upvotes table to prevent double voting.
    // For now, we'll incrementally update the count.
    const [updated] = await db.select().from(issues).where(eq(issues.id, id));
    
    if (!updated) {
       return res.status(404).json({ error: 'Issue not found' });
    }

    const result = await db.update(issues)
      .set({ upvotes: updated.upvotes + 1 })
      .where(eq(issues.id, id))
      .returning();
      
    res.json(result[0]);
  } catch (error) {
    console.error('Error upvoting issue:', error);
    res.status(500).json({ error: 'Failed to upvote' });
  }
});

// Update issue status (Politician / Admin)
app.patch('/api/issues/:id/status', requireAuthApi, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const id = req.params.id as string;
    const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Escalated'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const [updated] = await db.update(issues)
      .set({ 
        status,
        resolvedAt: status === 'Resolved' ? new Date() : null 
      })
      .where(eq(issues.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: 'Issue not found' });

    // Notify issue reporter
    await db.insert(notifications).values({
      id: `NOTIF-${Date.now()}`,
      userId: updated.reporterId,
      type: 'STATUS_CHANGE',
      title: `Issue Status Updated`,
      message: `Your report "${updated.title}" is now "${status}".`,
      linkToIssueId: updated.id,
      isRead: false,
    }).catch(() => {/* best-effort */});

    res.json(updated);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Politician respond to issue
app.patch('/api/issues/:id/respond', requireAuthApi, async (req: Request, res: Response) => {
  try {
    const { response } = req.body;
    const id = req.params.id as string;
    if (!response?.trim()) return res.status(400).json({ error: 'Response text required' });

    const [updated] = await db.update(issues).set({ response }).where(eq(issues.id, id)).returning();
    if (!updated) return res.status(404).json({ error: 'Issue not found' });

    // Notify reporter
    await db.insert(notifications).values({
      id: `NOTIF-${Date.now()}`,
      userId: updated.reporterId,
      type: 'REPLY',
      title: 'Official Response Received',
      message: `An official has responded to your report "${updated.title}".`,
      linkToIssueId: updated.id,
      isRead: false,
    }).catch(() => {/* best-effort */});

    res.json(updated);
  } catch (error) {
    console.error('Error saving response:', error);
    res.status(500).json({ error: 'Failed to save response' });
  }
});

// Moderator — flag / unflag issue
app.patch('/api/issues/:id/flag', requireAuthApi, async (req: Request, res: Response) => {
  try {
    const { flagged, flagReason } = req.body;
    const id = req.params.id as string;
    const [updated] = await db.update(issues)
      .set({ flagged: !!flagged, flagReason: flagReason || null })
      .where(eq(issues.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: 'Issue not found' });
    res.json(updated);
  } catch (error) {
    console.error('Error flagging issue:', error);
    res.status(500).json({ error: 'Failed to flag issue' });
  }
});

// ───────────────── ADMIN ENDPOINTS ───────────────── //

// Get all users (admin only — checked via role in Clerk metadata)
app.get('/api/users', requireAuthApi, async (req: Request, res: Response) => {
  try {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    res.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Change user role (admin only)
app.patch('/api/users/:id/role', requireAuthApi, async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const targetId = req.params.id as string;
    const validRoles = ['citizen', 'politician', 'moderator', 'admin'];
    if (!validRoles.includes(role)) return res.status(400).json({ error: 'Invalid role' });

    const [updated] = await db.update(users).set({ role }).where(eq(users.id, targetId)).returning();
    if (!updated) return res.status(404).json({ error: 'User not found' });

    // Sync role to Clerk metadata
    await clerkClient.users.updateUserMetadata(targetId, { publicMetadata: { role } }).catch(() => {/* best-effort */});

    res.json(updated);
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// ───────────────── USERS/NOTIFICATIONS API ───────────────── //

app.get('/api/users/me', requireAuthApi, async (req: Request, res: Response) => {
    try {
        const userId = (req as unknown as { auth: { userId: string } }).auth.userId;
        const [user] = await db.select().from(users).where(eq(users.id, userId));
        
        if (!user) {
            // If user doesn't exist in our DB yet, but exists in Clerk, we might want to create them here
            // using data from Clerk, or wait for a webhook to do it.
            return res.status(404).json({ error: 'User profile not synchronized yet' });
        }
        res.json(user);
    } catch(error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

app.get('/api/notifications', requireAuthApi, async (req: Request, res: Response) => {
  try {
    const userId = (req as unknown as { auth: { userId: string } }).auth.userId;
    const userNotifications = await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
    res.json(userNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// User Synchronization Endpoint
app.post('/api/sync-user', async (req: Request, res: Response) => {
  const { userId, email, name, role, avatar } = req.body;
  
  if (!userId || !role) {
    return res.status(400).json({ error: 'User ID and Role are required' });
  }

  try {
    // console.log(`[SYNC] Processing user: ${userId} (${email}) | Role: ${role}`);

    // 1. Sync to Database
    const [existingUser] = await db.select().from(users).where(eq(users.id, userId));
    
    if (existingUser) {
      console.log(`Updating existing user: ${userId}`);
      await db.update(users)
        .set({ name: name || existingUser.name, email: email || existingUser.email, role, avatar: avatar || existingUser.avatar })
        .where(eq(users.id, userId));
    } else {
      console.log(`Inserting new user: ${userId}`);
      if (!name || !email) {
        throw new Error('Name and Email are required for new user creation');
      }
      await db.insert(users).values({
        id: userId,
        name,
        email,
        role: role as 'citizen' | 'politician' | 'admin' | 'moderator',
        avatar,
        createdAt: new Date(),
      });
    }

    // 2. Update Clerk Metadata
    try {
      console.log(`Updating Clerk metadata for: ${userId}`);
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          role: role
        }
      });
      // console.log('Clerk metadata updated successfully');
    } catch (metadataError) {
      const msg = metadataError instanceof Error ? metadataError.message : String(metadataError);
      console.warn('Failed to update Clerk metadata:', msg);
      // We continue because the DB is synchronized
    }
    
    res.json({ success: true, role });
  } catch (error) {
    console.error('CRITICAL: Sync User Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : undefined;
    res.status(500).json({ 
      error: 'Failed to sync user data', 
      details: message,
      stack: process.env.NODE_ENV === 'development' ? stack : undefined
    });
  }
});

// Serve Frontend in Production
app.use(express.static(path.join(process.cwd(), 'dist')));

// API 404 Guard: Catch unhandled /api routes before the SPA fallback
app.use('/api', (req: Request, res: Response) => {
  console.warn(`[SERVER] 404 on API route: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'API endpoint not found' });
});

// SPA Fallback: Serve index.html for all other non-API routes
app.get('*path', (req: Request, res: Response) => {
  const indexPath = path.join(process.cwd(), 'dist/index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send('Not Found');
    }
  });
});

interface HttpError extends Error {
  status?: number;
}

// Global Error Handler (Force JSON)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const error = err as HttpError;
  console.error('[SERVER ERROR]', error);
  
  res.status(error.status || 500).json({ 
    error: error.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
