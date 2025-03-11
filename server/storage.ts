import { prisma } from './lib/prisma'
import type { Student, Attendance, Fee, Report } from '@prisma/client'

interface StorageInterface {
  getStudentsByInstitution(institutionId: string): Promise<Student[]>
  getAttendanceByStudent(studentId: string): Promise<Attendance[]>
  getFeesByStudent(studentId: string): Promise<Fee[]>
  getReportsByStudent(studentId: string): Promise<Report[]>
}

class Storage implements StorageInterface {
  async getStudentsByInstitution(institutionId: string) {
    return prisma.student.findMany({
      where: {
        schoolId: institutionId,
      },
      include: {
        attendance: true,
        fees: true,
        reports: true,
      },
    })
  }

  async getAttendanceByStudent(studentId: string) {
    return prisma.attendance.findMany({
      where: {
        studentId,
      },
      orderBy: {
        date: 'desc',
      },
    })
  }

  async getFeesByStudent(studentId: string) {
    return prisma.fee.findMany({
      where: {
        studentId,
      },
      orderBy: {
        dueDate: 'desc',
      },
    })
  }

  async getReportsByStudent(studentId: string) {
    return prisma.report.findMany({
      where: {
        studentId,
      },
      orderBy: {
        date: 'desc',
      },
    })
  }
}

export const storage = new Storage()
