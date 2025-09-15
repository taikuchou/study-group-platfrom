import { User as PrismaUser, UserRole, InteractionType, IntervalType } from '@prisma/client';

// Define ReferenceCategory locally until Prisma client is regenerated
enum ReferenceCategory {
  WEB = 'WEB',
  BOOK = 'BOOK',
  PAPER = 'PAPER'
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  googleId?: string;
  picture?: string;
  isProfileComplete?: boolean;
  createdAt: string;
}

export interface ReferenceLink {
  label: string;
  description: string;
  url: string;
  category: 'web' | 'book' | 'paper';
}

export interface Session {
  id: number;
  topicId: number;
  presenterId: number;
  startDateTime: string;
  scope: string;
  outline: string;
  noteLinks: string[];
  references: ReferenceLink[];
  attendees: number[];
}

export interface Topic {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  intervalType: 'WEEKLY' | 'BIWEEKLY';
  outline: string;
  referenceUrls: string[];
  keywords: string[];
  attendees: number[];
  createdBy: number;
  createdAt: string;
  sessions: Session[];
}

export type InteractionTypeEnum = 
  | 'question'
  | 'noteLink'
  | 'reference'
  | 'speakerFeedback'
  | 'weeklyInsight'
  | 'outlineSuggestion';

interface InteractionBase {
  id: number;
  type: InteractionTypeEnum;
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
  category: 'web' | 'book' | 'paper';
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

export interface AuthUser {
  id: number;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// Utility type conversions
export function prismaUserToUser(prismaUser: PrismaUser): User {
  return {
    id: prismaUser.id,
    name: prismaUser.name,
    email: prismaUser.email,
    role: prismaUser.role.toLowerCase() as 'user' | 'admin',
    googleId: (prismaUser as any).googleId || undefined,
    picture: (prismaUser as any).picture || undefined,
    isProfileComplete: (prismaUser as any).isProfileComplete ?? undefined,
    createdAt: prismaUser.createdAt.toISOString().split('T')[0],
  };
}

export function prismaInteractionTypeToFrontend(type: InteractionType): InteractionTypeEnum {
  const mapping: Record<InteractionType, InteractionTypeEnum> = {
    QUESTION: 'question',
    NOTE_LINK: 'noteLink',
    REFERENCE: 'reference',
    SPEAKER_FEEDBACK: 'speakerFeedback',
    WEEKLY_INSIGHT: 'weeklyInsight',
    OUTLINE_SUGGESTION: 'outlineSuggestion',
  };
  return mapping[type];
}

export function frontendInteractionTypeToPrisma(type: InteractionTypeEnum): InteractionType {
  const mapping: Record<InteractionTypeEnum, InteractionType> = {
    question: 'QUESTION',
    noteLink: 'NOTE_LINK',
    reference: 'REFERENCE',
    speakerFeedback: 'SPEAKER_FEEDBACK',
    weeklyInsight: 'WEEKLY_INSIGHT',
    outlineSuggestion: 'OUTLINE_SUGGESTION',
  };
  return mapping[type];
}

export function prismaIntervalTypeToFrontend(type: IntervalType): 'WEEKLY' | 'BIWEEKLY' {
  return type as 'WEEKLY' | 'BIWEEKLY';
}

export function prismaReferenceCategoryToFrontend(category: ReferenceCategory): 'web' | 'book' | 'paper' {
  const mapping: Record<ReferenceCategory, 'web' | 'book' | 'paper'> = {
    WEB: 'web',
    BOOK: 'book',
    PAPER: 'paper',
  };
  return mapping[category];
}

export function frontendReferenceCategoryToPrisma(category: 'web' | 'book' | 'paper'): ReferenceCategory {
  const mapping: Record<'web' | 'book' | 'paper', ReferenceCategory> = {
    web: 'WEB',
    book: 'BOOK',
    paper: 'PAPER',
  };
  return mapping[category];
}