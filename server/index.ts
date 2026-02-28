import express, { Request, Response } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import path from 'path';
import { db } from '../src/db/index.js';
import { issues, users, notifications } from '../src/db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '@clerk/express';

// Ensure environment variables are loaded
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Basic health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
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
    const { title, description, category, priority, location, isPetition, aiCategoryConfidence } = req.body;
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

// Serve Frontend in Production
app.use(express.static(path.join(process.cwd(), 'dist')));
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'dist/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
