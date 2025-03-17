import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../libs/password'
import { APPROVAL_STATUS, USER_ROLES } from '../constants'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seeding...')

  // Create admin user
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123'
  const hashedAdminPassword = await hashPassword(adminPassword)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@presentsir.com' },
    update: {},
    create: {
      email: 'admin@presentsir.com',
      username: 'admin',
      name: 'Admin User',
      password: hashedAdminPassword,
      role: USER_ROLES.ADMIN,
    },
  })

  console.log('Admin user created:', admin.email)

  // Create demo school
  const schoolPassword = await hashPassword('School@123')

  const schoolUser = await prisma.user.upsert({
    where: { email: 'school@presentsir.com' },
    update: {},
    create: {
      email: 'school@presentsir.com',
      username: 'demoschool',
      name: 'Demo School',
      password: schoolPassword,
      role: USER_ROLES.SCHOOL,
    },
  })

  const school = await prisma.school.upsert({
    where: { userId: schoolUser.id },
    update: {},
    create: {
      name: 'Demo School',
      address: '123 Education Street',
      city: 'Demo City',
      district: 'Demo District',
      state: 'Demo State',
      pincode: '123456',
      phone: '9876543210',
      email: 'school@presentsir.com',
      website: 'https://demoschool.presentsir.com',
      approvalStatus: APPROVAL_STATUS.APPROVED,
      userId: schoolUser.id,
    },
  })

  console.log('Demo school created:', school.name)

  // Create demo teacher
  const teacherPassword = await hashPassword('Teacher@123')

  const teacherUser = await prisma.user.upsert({
    where: { email: 'teacher@presentsir.com' },
    update: {},
    create: {
      email: 'teacher@presentsir.com',
      username: 'demoteacher',
      name: 'Demo Teacher',
      password: teacherPassword,
      role: USER_ROLES.TEACHER,
    },
  })

  const teacher = await prisma.teacher.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: {
      name: 'Demo Teacher',
      email: 'teacher@presentsir.com',
      phone: '9876543211',
      address: '456 Teacher Street',
      qualification: 'M.Ed',
      subject: 'Mathematics',
      joiningDate: new Date(),
      userId: teacherUser.id,
      schoolId: school.id,
    },
  })

  console.log('Demo teacher created:', teacher.name)

  // Create demo student
  const studentPassword = await hashPassword('Student@123')

  const studentUser = await prisma.user.upsert({
    where: { email: 'student@presentsir.com' },
    update: {},
    create: {
      email: 'student@presentsir.com',
      username: 'demostudent',
      name: 'Demo Student',
      password: studentPassword,
      role: USER_ROLES.STUDENT,
    },
  })

  // Create a class
  const demoClass = await prisma.class.upsert({
    where: {
      name_schoolId: {
        name: 'Class 10',
        schoolId: school.id,
      },
    },
    update: {},
    create: {
      name: 'Class 10',
      section: 'A',
      schoolId: school.id,
      teacherId: teacher.id,
    },
  })

  const student = await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      name: 'Demo Student',
      email: 'student@presentsir.com',
      phone: '9876543212',
      address: '789 Student Street',
      dateOfBirth: new Date('2005-01-01'),
      gender: 'Male',
      rollNumber: 'S001',
      admissionDate: new Date(),
      userId: studentUser.id,
      schoolId: school.id,
      classId: demoClass.id,
    },
  })

  console.log('Demo student created:', student.name)
  console.log('Demo class created:', demoClass.name)

  console.log('Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
