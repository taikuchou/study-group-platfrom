import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// User schemas
export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  role: z.enum(['user', 'admin']).optional(),
});

export const updateUserSchema = z.object({
  id: z.number(),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
  role: z.enum(['user', 'admin']).optional(),
});

// Topic schemas
export const createTopicSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  intervalType: z.enum(['WEEKLY', 'BIWEEKLY']),
  outline: z.string().optional(),
  referenceUrls: z.array(z.string().url()).optional(),
  keywords: z.array(z.string()).optional(),
  attendees: z.array(z.number()).optional(),
});

export const updateTopicSchema = createTopicSchema.partial().extend({
  id: z.number(),
});

// Reference schema
export const referenceSchema = z.object({
  label: z.string(),
  description: z.string(),
  url: z.string().url(),
  category: z.enum(['web', 'book', 'paper'])
});

// Session schemas
export const createSessionSchema = z.object({
  topicId: z.number(),
  presenterId: z.number(),
  startDateTime: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, 'Invalid datetime format (YYYY-MM-DD HH:MM)'),
  scope: z.string().min(3, 'Scope must be at least 3 characters'),
  outline: z.string().optional(),
  noteLinks: z.array(z.string()).optional(),
  references: z.array(referenceSchema).optional(),
});

export const updateSessionSchema = createSessionSchema.partial().extend({
  id: z.number(),
});

// Interaction schemas
export const createInteractionSchema = z.object({
  type: z.enum(['question', 'noteLink', 'reference', 'speakerFeedback', 'weeklyInsight', 'outlineSuggestion']),
  sessionId: z.number(),
  content: z.string().optional(),
  label: z.string().optional(),
  description: z.string().optional(),
  url: z.string().url().optional(),
  category: z.enum(['web', 'book', 'paper']).optional(),
}).refine((data) => {
  if (data.type === 'noteLink') {
    return data.label && data.description && data.url;
  }
  if (data.type === 'reference') {
    return data.label && data.description && data.url && data.category;
  }
  return data.content;
}, {
  message: 'Content is required for content-based interactions, label/description/url are required for noteLink/reference interactions, and category is required for reference interactions',
});

export const updateInteractionSchema = z.object({
  id: z.number(),
  type: z.enum(['question', 'noteLink', 'reference', 'speakerFeedback', 'weeklyInsight', 'outlineSuggestion']).optional(),
  sessionId: z.number().optional(),
  content: z.string().optional(),
  label: z.string().optional(),
  description: z.string().optional(),
  url: z.string().url().optional(),
  category: z.enum(['web', 'book', 'paper']).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type CreateInteractionInput = z.infer<typeof createInteractionSchema>;
export type UpdateInteractionInput = z.infer<typeof updateInteractionSchema>;