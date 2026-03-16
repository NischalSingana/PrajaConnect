import * as dotenv from 'dotenv';
import path from 'path';
// Ensure environment variables are loaded before any other imports
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import express, { Request, Response } from 'express';
import cors from 'cors';
import { db } from '../src/db/index';
import { issues, users, notifications } from '../src/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAuth, clerkClient } from '@clerk/express';
import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Basic health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
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
    return res.json(JSON.parse(content));
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
      return res.json(JSON.parse(text));
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

    res.json({
      citizens: 85000 + (userCount?.count || 0),
      issues: 150000 + (issueCount?.count || 0),
      resolved: 12000 + (resolvedCount?.count || 0),
      avgResponseTime: '36h' // Static for now as we don't have enough data
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
app.post('/api/issues', requireAuth(), async (req: Request, res: Response) => {
  try {
    const { title, description, category, priority, location, isPetition, aiCategoryConfidence, imageUrl, lat, lng } = req.body;
    const userId = (req as unknown as { auth: { userId: string } }).auth.userId; // Provided by Clerk

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
      slaDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000), // Date object for Postgres Timestamp
      escalationLevel: 'Normal',
      isPetition: isPetition || false,
      imageUrl: imageUrl || null,
      lat: lat || null,
      lng: lng || null,
      upvotes: 0,
    }).returning();

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
    console.error('Error creating issue:', error);
    res.status(500).json({ error: 'Failed to create issue' });
  }
});

// Upvote an issue (Requires Auth)
app.post('/api/issues/:id/upvote', requireAuth(), async (req: Request, res: Response) => {
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

// ───────────────── USERS/NOTIFICATIONS API ───────────────── //

app.get('/api/users/me', requireAuth(), async (req: Request, res: Response) => {
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

app.get('/api/notifications', requireAuth(), async (req: Request, res: Response) => {
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
    console.log(`[SYNC] Processing user: ${userId} (${email}) | Role: ${role}`);

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
      console.log('Clerk metadata updated successfully');
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
app.get(/^(?!\/api).*/, (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'dist/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
