import {
  users,
  packages,
  students,
  classes,
  scheduleChangeRequests,
  type User,
  type UpsertUser,
  type Package,
  type InsertPackage,
  type Student,
  type InsertStudent,
  type StudentWithRelations,
  type Class,
  type InsertClass,
  type ClassWithRelations,
  type ScheduleChangeRequest,
  type InsertScheduleChangeRequest,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, count, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Package operations
  getPackages(): Promise<Package[]>;
  getPackage(id: string): Promise<Package | undefined>;
  createPackage(packageData: InsertPackage): Promise<Package>;
  updatePackage(id: string, packageData: Partial<InsertPackage>): Promise<Package>;
  deletePackage(id: string): Promise<void>;
  
  // Student operations
  getStudents(): Promise<StudentWithRelations[]>;
  getStudent(id: string): Promise<StudentWithRelations | undefined>;
  createStudent(studentData: InsertStudent): Promise<Student>;
  updateStudent(id: string, studentData: Partial<InsertStudent>): Promise<Student>;
  deleteStudent(id: string): Promise<void>;
  
  // Class operations
  getClasses(startDate?: Date, endDate?: Date): Promise<ClassWithRelations[]>;
  getClass(id: string): Promise<ClassWithRelations | undefined>;
  createClass(classData: InsertClass): Promise<Class>;
  updateClass(id: string, classData: Partial<InsertClass>): Promise<Class>;
  deleteClass(id: string): Promise<void>;
  getClassesByTeacher(teacherId: string, startDate?: Date, endDate?: Date): Promise<ClassWithRelations[]>;
  
  // Schedule change request operations
  getScheduleChangeRequests(): Promise<ScheduleChangeRequest[]>;
  createScheduleChangeRequest(requestData: InsertScheduleChangeRequest): Promise<ScheduleChangeRequest>;
  updateScheduleChangeRequest(id: string, requestData: Partial<InsertScheduleChangeRequest>): Promise<ScheduleChangeRequest>;
  
  // Dashboard stats
  getDashboardStats(): Promise<{
    totalStudents: number;
    totalTeachers: number;
    todayClasses: number;
    ongoingClasses: number;
  }>;
  
  // Teachers
  getTeachers(): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  
  // Package operations
  async getPackages(): Promise<Package[]> {
    return await db.select().from(packages).where(eq(packages.isActive, true)).orderBy(packages.hours);
  }
  
  async getPackage(id: string): Promise<Package | undefined> {
    const [packageData] = await db.select().from(packages).where(eq(packages.id, id));
    return packageData;
  }
  
  async createPackage(packageData: InsertPackage): Promise<Package> {
    const [newPackage] = await db.insert(packages).values(packageData).returning();
    return newPackage;
  }
  
  async updatePackage(id: string, packageData: Partial<InsertPackage>): Promise<Package> {
    const [updatedPackage] = await db
      .update(packages)
      .set({ ...packageData, updatedAt: new Date() })
      .where(eq(packages.id, id))
      .returning();
    return updatedPackage;
  }
  
  async deletePackage(id: string): Promise<void> {
    await db.update(packages).set({ isActive: false }).where(eq(packages.id, id));
  }
  
  // Student operations
  async getStudents(): Promise<StudentWithRelations[]> {
    return await db
      .select()
      .from(students)
      .leftJoin(packages, eq(students.packageId, packages.id))
      .leftJoin(users, eq(students.assignedTeacherId, users.id))
      .where(eq(students.isActive, true))
      .orderBy(desc(students.createdAt))
      .then(rows => 
        rows.map(row => ({
          ...row.students,
          package: row.packages || undefined,
          assignedTeacher: row.users || undefined,
        }))
      );
  }
  
  async getStudent(id: string): Promise<StudentWithRelations | undefined> {
    const rows = await db
      .select()
      .from(students)
      .leftJoin(packages, eq(students.packageId, packages.id))
      .leftJoin(users, eq(students.assignedTeacherId, users.id))
      .where(eq(students.id, id));
    
    if (rows.length === 0) return undefined;
    
    const row = rows[0];
    return {
      ...row.students,
      package: row.packages || undefined,
      assignedTeacher: row.users || undefined,
    };
  }
  
  async createStudent(studentData: InsertStudent): Promise<Student> {
    const [newStudent] = await db.insert(students).values(studentData).returning();
    return newStudent;
  }
  
  async updateStudent(id: string, studentData: Partial<InsertStudent>): Promise<Student> {
    const [updatedStudent] = await db
      .update(students)
      .set({ ...studentData, updatedAt: new Date() })
      .where(eq(students.id, id))
      .returning();
    return updatedStudent;
  }
  
  async deleteStudent(id: string): Promise<void> {
    await db.update(students).set({ isActive: false }).where(eq(students.id, id));
  }
  
  // Class operations
  async getClasses(startDate?: Date, endDate?: Date): Promise<ClassWithRelations[]> {
    let query = db
      .select()
      .from(classes)
      .leftJoin(students, eq(classes.studentId, students.id))
      .leftJoin(users, eq(classes.teacherId, users.id))
      .orderBy(desc(classes.startTime));
    
    if (startDate && endDate) {
      query = query.where(
        and(
          gte(classes.startTime, startDate),
          lte(classes.startTime, endDate)
        )
      ) as any;
    }
    
    const rows = await query;
    
    return rows.map(row => ({
      ...row.classes,
      student: row.students || undefined,
      teacher: row.users || undefined,
    }));
  }
  
  async getClass(id: string): Promise<ClassWithRelations | undefined> {
    const rows = await db
      .select()
      .from(classes)
      .leftJoin(students, eq(classes.studentId, students.id))
      .leftJoin(users, eq(classes.teacherId, users.id))
      .where(eq(classes.id, id));
    
    if (rows.length === 0) return undefined;
    
    const row = rows[0];
    return {
      ...row.classes,
      student: row.students || undefined,
      teacher: row.users || undefined,
    };
  }
  
  async createClass(classData: InsertClass): Promise<Class> {
    const [newClass] = await db.insert(classes).values(classData).returning();
    
    // Update student's remaining hours
    if (classData.duration) {
      await db
        .update(students)
        .set({
          remainingHours: sql`${students.remainingHours} - ${classData.duration}`,
          updatedAt: new Date(),
        })
        .where(eq(students.id, classData.studentId));
    }
    
    return newClass;
  }
  
  async updateClass(id: string, classData: Partial<InsertClass>): Promise<Class> {
    const [updatedClass] = await db
      .update(classes)
      .set({ ...classData, updatedAt: new Date() })
      .where(eq(classes.id, id))
      .returning();
    return updatedClass;
  }
  
  async deleteClass(id: string): Promise<void> {
    await db.delete(classes).where(eq(classes.id, id));
  }
  
  async getClassesByTeacher(teacherId: string, startDate?: Date, endDate?: Date): Promise<ClassWithRelations[]> {
    let query = db
      .select()
      .from(classes)
      .leftJoin(students, eq(classes.studentId, students.id))
      .leftJoin(users, eq(classes.teacherId, users.id))
      .where(eq(classes.teacherId, teacherId))
      .orderBy(desc(classes.startTime));
    
    if (startDate && endDate) {
      query = query.where(
        and(
          eq(classes.teacherId, teacherId),
          gte(classes.startTime, startDate),
          lte(classes.startTime, endDate)
        )
      ) as any;
    }
    
    const rows = await query;
    
    return rows.map(row => ({
      ...row.classes,
      student: row.students || undefined,
      teacher: row.users || undefined,
    }));
  }
  
  // Schedule change request operations
  async getScheduleChangeRequests(): Promise<ScheduleChangeRequest[]> {
    return await db
      .select()
      .from(scheduleChangeRequests)
      .orderBy(desc(scheduleChangeRequests.createdAt));
  }
  
  async createScheduleChangeRequest(requestData: InsertScheduleChangeRequest): Promise<ScheduleChangeRequest> {
    const [newRequest] = await db.insert(scheduleChangeRequests).values(requestData).returning();
    return newRequest;
  }
  
  async updateScheduleChangeRequest(id: string, requestData: Partial<InsertScheduleChangeRequest>): Promise<ScheduleChangeRequest> {
    const [updatedRequest] = await db
      .update(scheduleChangeRequests)
      .set({ ...requestData, updatedAt: new Date() })
      .where(eq(scheduleChangeRequests.id, id))
      .returning();
    return updatedRequest;
  }
  
  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalStudents: number;
    totalTeachers: number;
    todayClasses: number;
    ongoingClasses: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const [totalStudentsResult] = await db
      .select({ count: count() })
      .from(students)
      .where(eq(students.isActive, true));
    
    const [totalTeachersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "teacher"));
    
    const [todayClassesResult] = await db
      .select({ count: count() })
      .from(classes)
      .where(
        and(
          gte(classes.startTime, today),
          lte(classes.startTime, tomorrow)
        )
      );
    
    const [ongoingClassesResult] = await db
      .select({ count: count() })
      .from(classes)
      .where(eq(classes.status, "ongoing"));
    
    return {
      totalStudents: totalStudentsResult.count,
      totalTeachers: totalTeachersResult.count,
      todayClasses: todayClassesResult.count,
      ongoingClasses: ongoingClassesResult.count,
    };
  }
  
  // Teachers
  async getTeachers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.role, "teacher"))
      .orderBy(users.firstName);
  }
}

export const storage = new DatabaseStorage();
