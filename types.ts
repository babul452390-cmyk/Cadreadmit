import type { Timestamp } from "firebase/firestore";

export type Role = "user" | "admin";

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: Role;
  subscription?: {
    status: "active" | "inactive";
    plan?: string;
    expiresAt?: Timestamp | null;
  };
  createdAt?: Timestamp;
}

export interface Subject {
  id: string;
  name: string;
  slug: string;
  category: "preli" | "written";
  description?: string;
  order: number;
}

export interface Question {
  id: string;
  subjectId: string;
  question: string;
  options: string[]; // 4 options
  answer: number; // 0-3
  explanation?: string;
}

export interface ModelTest {
  id: string;
  title: string;
  description?: string;
  questionIds: string[];
  durationMin: number;
  category: "preli" | "written";
  createdAt?: Timestamp;
}

export interface Attempt {
  id: string;
  userId: string;
  testId?: string;
  subjectId?: string;
  score: number;
  total: number;
  answers: Record<string, number>; // questionId -> selected index
  createdAt: Timestamp;
}

export interface WrittenTopic {
  id: string;
  title: string;
  prompt: string;
  subject?: string;
}

export interface WrittenSubmission {
  id: string;
  userId: string;
  topicId: string;
  answer: string;
  feedback?: string;
  createdAt: Timestamp;
}

export interface Payment {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  method: "bkash" | "nagad";
  trxId: string;
  senderNumber: string;
  amount: number;
  planDays: number;
  status: "pending" | "approved" | "rejected";
  reason?: string;
  createdAt: Timestamp;
  reviewedAt?: Timestamp;
}

export interface GlobalSettings {
  paymentAmount: number;
  planDays: number;
  planLabel: string;
  bkashNumber: string;
  nagadNumber: string;
  instructions: string;
}
