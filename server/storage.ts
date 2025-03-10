import { users, students, attendance, fees, reports } from "@shared/schema";
import type { User, Student, Attendance, Fee, Report } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Auth
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: Omit<User, "id">): Promise<User>;
  
  // Students
  getStudentsByInstitution(institutionId: number): Promise<Student[]>;
  createStudent(student: Omit<Student, "id">): Promise<Student>;
  
  // Attendance
  getAttendanceByDate(date: Date): Promise<Attendance[]>;
  createAttendance(attendance: Omit<Attendance, "id">): Promise<Attendance>;
  getRecentAttendance(studentIds: number[]): Promise<Attendance[]>;
  
  // Fees
  getPendingFees(studentIds: number[]): Promise<Fee[]>;
  createFee(fee: Omit<Fee, "id">): Promise<Fee>;
  getRecentFees(studentIds: number[]): Promise<Fee[]>;
  
  // Reports
  getRecentReports(studentIds: number[]): Promise<Report[]>;
  createReport(report: Omit<Report, "id">): Promise<Report>;

  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private students: Map<number, Student>;
  private attendanceRecords: Map<number, Attendance>;
  private feeRecords: Map<number, Fee>;
  private reportRecords: Map<number, Report>;
  
  sessionStore: session.Store;
  private currentIds: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.students = new Map();
    this.attendanceRecords = new Map();
    this.feeRecords = new Map();
    this.reportRecords = new Map();
    
    this.currentIds = {
      users: 1,
      students: 1,
      attendance: 1,
      fees: 1,
      reports: 1
    };

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24h
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(userData: Omit<User, "id">): Promise<User> {
    const id = this.currentIds.users++;
    const user = { ...userData, id };
    this.users.set(id, user);
    return user;
  }

  // Students
  async getStudentsByInstitution(institutionId: number): Promise<Student[]> {
    return Array.from(this.students.values()).filter(
      (student) => student.institutionId === institutionId
    );
  }

  async createStudent(studentData: Omit<Student, "id">): Promise<Student> {
    const id = this.currentIds.students++;
    const student = { ...studentData, id };
    this.students.set(id, student);
    return student;
  }

  // Attendance
  async getAttendanceByDate(date: Date): Promise<Attendance[]> {
    return Array.from(this.attendanceRecords.values()).filter(
      (record) => record.date.toDateString() === date.toDateString()
    );
  }

  async createAttendance(attendanceData: Omit<Attendance, "id">): Promise<Attendance> {
    const id = this.currentIds.attendance++;
    const attendance = { ...attendanceData, id };
    this.attendanceRecords.set(id, attendance);
    return attendance;
  }

  async getRecentAttendance(studentIds: number[]): Promise<Attendance[]> {
    return Array.from(this.attendanceRecords.values())
      .filter(record => studentIds.includes(record.studentId))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
  }

  // Fees
  async getPendingFees(studentIds: number[]): Promise<Fee[]> {
    return Array.from(this.feeRecords.values())
      .filter(fee => 
        studentIds.includes(fee.studentId) && 
        fee.status === 'pending'
      );
  }

  async createFee(feeData: Omit<Fee, "id">): Promise<Fee> {
    const id = this.currentIds.fees++;
    const fee = { ...feeData, id };
    this.feeRecords.set(id, fee);
    return fee;
  }

  async getRecentFees(studentIds: number[]): Promise<Fee[]> {
    return Array.from(this.feeRecords.values())
      .filter(fee => studentIds.includes(fee.studentId))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
  }

  // Reports
  async getRecentReports(studentIds: number[]): Promise<Report[]> {
    return Array.from(this.reportRecords.values())
      .filter(report => studentIds.includes(report.studentId))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
  }

  async createReport(reportData: Omit<Report, "id">): Promise<Report> {
    const id = this.currentIds.reports++;
    const report = { ...reportData, id };
    this.reportRecords.set(id, report);
    return report;
  }
}

export const storage = new MemStorage();
