// ================= types =================
export type Role = 'user' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  googleId?: string;
  picture?: string;
  isProfileComplete?: boolean;
  createdAt: string;
}

export type IntervalType = 'WEEKLY' | 'BIWEEKLY';

export type ReferenceCategory = 'web' | 'book' | 'paper';

export interface ReferenceLink {
  label: string;
  description: string;
  url: string;
  category: ReferenceCategory;
}

export interface Session {
  id: number;
  topicId: number;
  presenterId: number; // userId
  startDateTime: string;
  scope: string;
  outline: string;
  noteLinks: string[];
  references: ReferenceLink[];
  attendees: number[]; // user ids
}

export interface Topic {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  intervalType: IntervalType;
  outline: string;
  referenceUrls: string[];
  keywords: string[];
  attendees: number[]; // user ids
  createdBy: number;   // user id
  createdAt: string;
  sessions: Session[];
}

export type InteractionType =
  | 'question'
  | 'noteLink'
  | 'reference'
  | 'speakerFeedback'
  | 'weeklyInsight'
  | 'outlineSuggestion';

interface InteractionBase {
  id: number;
  type: InteractionType;
  sessionId: number;
  authorId: number;
  createdAt: string;
}

export interface QuestionInteraction extends InteractionBase {
  type: 'question';
  content: string;
}

export interface WeeklyInsightInteraction extends InteractionBase {
  type: 'weeklyInsight';
  content: string;
}

export interface SpeakerFeedbackInteraction extends InteractionBase {
  type: 'speakerFeedback';
  content: string;
}

export interface ReferenceInteraction extends InteractionBase {
  type: 'reference';
  label: string;
  description: string;
  url: string;
  category: ReferenceCategory;
}

export interface OutlineSuggestionInteraction extends InteractionBase {
  type: 'outlineSuggestion';
  content: string;
}

export interface NoteLinkInteraction extends InteractionBase {
  type: 'noteLink';
  label: string;
  description: string;
  url: string;
}

export type Interaction =
  | QuestionInteraction
  | WeeklyInsightInteraction
  | SpeakerFeedbackInteraction
  | ReferenceInteraction
  | OutlineSuggestionInteraction
  | NoteLinkInteraction;
