export interface User {
  id: string;
  name: string;
  role: 'citizen' | 'politician' | 'admin' | 'moderator';
  avatar?: string;
}

export interface Citizen extends User {
  role: 'citizen';
  reputationScore: number;
  badges: string[]; // e.g., 'Active Citizen', 'Community Leader'
}

export interface Politician extends User {
  role: 'politician';
  district: string;
  transparencyScore: number; // 0 - 100
  avgResponseTimeHours: number;
  resolutionRate: number; // Percentage 0 - 100
  citizenRating: number; // 0.0 - 5.0
}

export type IssueCategory =
  | 'Infrastructure' | 'Sanitation' | 'Safety' | 'General'
  | 'Roads' | 'Water' | 'Electricity' | 'Environment'
  | 'Transport' | 'Parks' | 'Housing' | 'Education' | 'Health';
export type IssuePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type IssueStatus = 'Pending' | 'In Progress' | 'Resolved' | 'Escalated';
export type EscalationLevel = 'Normal' | 'Level 1' | 'Level 2' | 'Critical';

export interface Issue {
  id: string;
  title: string;
  description: string;
  reporterId: string;
  assignedPoliticianId?: string;
  
  category: IssueCategory;
  aiCategoryConfidence?: number; // 0 - 100%
  priority: IssuePriority;
  status: IssueStatus;
  
  location: string;
  coordinates?: { lat: number, lng: number }; // For heatmap
  
  createdAt: string; // ISO date string
  slaDeadline: string; // ISO date string
  escalationLevel: EscalationLevel; // Auto-escalates if SLA passes
  
  isPetition: boolean;
  upvotes: number;
  petitionTarget?: number;
  
  commentsCount: number;
  imageUrl?: string;
  lat?: number;
  lng?: number;
  // Politician response
  response?: string;
  // Moderator flags
  flagged: boolean;
  flagReason?: string | null;
  resolvedAt?: string | null;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'SLA_WARNING' | 'ESCALATION' | 'REPLY' | 'STATUS_CHANGE' | 'PETITION_MILESTONE';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  linkToIssueId?: string;
}

export interface AnalyticsData {
  issuesByCategory: { name: string, value: number }[];
  resolutionTrend: { name: string, reported: number, resolved: number }[];
  wardHeatmap: { ward: string, count: number }[];
  topPoliticians: Politician[];
}
