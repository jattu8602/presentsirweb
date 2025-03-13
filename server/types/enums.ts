// Enums that were previously expected from Prisma client

export enum UserRole {
  ADMIN = 'ADMIN',
  SCHOOL = 'SCHOOL',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  COACHING = 'COACHING',
  COLLEGE = 'COLLEGE',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum PlanType {
  BASIC = 'BASIC',
  PRO = 'PRO',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
}

export enum FeeStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum InstitutionType {
  SCHOOL = 'SCHOOL',
  COACHING = 'COACHING',
  COLLEGE = 'COLLEGE',
}
