import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, FileText, Download, TrendingUp, Users, Clock, BookOpen } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { id } from "date-fns/locale";
import type { ClassWithRelations, StudentWithRelations } from "@shared/schema";

export default function Reports() {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));

  useEffect(() => {
    document.title = "Laporan - EduAdmin";
  }, []);

  const monthStart = startOfMonth(new Date(selectedMonth + "-01"));
  const monthEnd = endOfMonth(new Date(selectedMonth + "-01"));

  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: [`/api/classes/${format(monthStart, "yyyy-MM-dd")}/${format(monthEnd, "yyyy-MM-dd")}`],
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/students"],
  });

  const { data: teachers = [], isLoading: teachersLoading } = useQuery({
    queryKey: ["/api/teachers"],
  });

  const isLoading = classesLoading || studentsLoading || teachersLoading;

  // Calculate statistics
  const classesArray = classes as ClassWithRelations[];
  const studentsArray = students as StudentWithRelations[];
  const teachersArray = teachers as any[];
  
  const totalClasses = classesArray.length;
  const completedClasses = classesArray.filter((c: ClassWithRelations) => c.status === "completed").length;
  const totalHours = classesArray
    .filter((c: ClassWithRelations) => c.status === "completed")
    .reduce((sum: number, c: ClassWithRelations) => sum + (parseFloat(c.duration || "0") || 0), 0);

  const teacherStats = teachersArray.map((teacher) => {
    const teacherClasses = classesArray.filter((c: ClassWithRelations) => c.teacherId === teacher.id);
    const completedHours = teacherClasses
      .filter((c: ClassWithRelations) => c.status === "completed")
      .reduce((sum: number, c: ClassWithRelations) => sum + (parseFloat(c.duration || "0") || 0), 0);
    
    return {
      ...teacher,
      totalClasses: teacherClasses.length,
      completedClasses: teacherClasses.filter((c: ClassWithRelations) => c.status === "completed").length,
      completedHours,
    };
  });

  const studentStats = studentsArray.map((student: StudentWithRelations) => {
    const studentClasses = classesArray.filter((c: ClassWithRelations) => c.studentId === student.id);
    const completedHours = studentClasses
      .filter((c: ClassWithRelations) => c.status === "completed")
      .reduce((sum: number, c: ClassWithRelations) => sum + (parseFloat(c.duration || "0") || 0), 0);
    
    return {
      ...student,
      totalClasses: studentClasses.length,
      completedClasses: studentClasses.filter((c: ClassWithRelations) => c.status === "completed").length,
      completedHours,
    };
  });

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = subMonths(currentDate, i);
      const value = format(date, "yyyy-MM");
      const label = format(date, "MMMM yyyy", { locale: id });
      options.push({ value, label });
    }
    
    return options;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 mb-6">
            <FileText className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-secondary-900">Laporan</h1>
          </div>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-secondary-600 mt-4">Memuat laporan...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-secondary-900">Laporan</h1>
          </div>
          <Button className="bg-primary-500 hover:bg-primary-600 text-white">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>

        {/* Month Filter */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-secondary-900">Filter Periode</CardTitle>
                <CardDescription>Pilih bulan untuk melihat laporan</CardDescription>
              </div>
              <Calendar className="h-5 w-5 text-primary-500" />
            </div>
          </CardHeader>
          <CardContent>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Pilih bulan" />
              </SelectTrigger>
              <SelectContent>
                {generateMonthOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-secondary-600">Total Kelas</CardTitle>
              <BookOpen className="h-4 w-4 text-primary-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary-900">{totalClasses}</div>
              <p className="text-xs text-secondary-500">
                {completedClasses} selesai dari {totalClasses} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-secondary-600">Total Jam</CardTitle>
              <Clock className="h-4 w-4 text-primary-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary-900">{totalHours.toFixed(1)}</div>
              <p className="text-xs text-secondary-500">jam pembelajaran selesai</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-secondary-600">Murid Aktif</CardTitle>
              <Users className="h-4 w-4 text-primary-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary-900">{studentsArray.length}</div>
              <p className="text-xs text-secondary-500">total murid terdaftar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-secondary-600">Tingkat Penyelesaian</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary-900">
                {totalClasses > 0 ? Math.round((completedClasses / totalClasses) * 100) : 0}%
              </div>
              <p className="text-xs text-secondary-500">kelas selesai tepat waktu</p>
            </CardContent>
          </Card>
        </div>

        {/* Teacher Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-secondary-900">Kinerja Guru</CardTitle>
            <CardDescription>Statistik kelas dan jam mengajar per guru</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teacherStats.map((teacher) => (
                <div key={teacher.id} className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-medium text-sm">
                        {teacher.firstName?.charAt(0)}{teacher.lastName?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-secondary-900">
                        {teacher.firstName} {teacher.lastName}
                      </h3>
                      <p className="text-sm text-secondary-500">{teacher.email}</p>
                    </div>
                  </div>
                  <div className="flex space-x-6 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-secondary-900">{teacher.totalClasses}</div>
                      <div className="text-secondary-500">Total Kelas</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-secondary-900">{teacher.completedClasses}</div>
                      <div className="text-secondary-500">Selesai</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-secondary-900">{teacher.completedHours.toFixed(1)}</div>
                      <div className="text-secondary-500">Jam</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Student Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-secondary-900">Progress Murid</CardTitle>
            <CardDescription>Kemajuan pembelajaran per murid</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentStats.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center">
                      <span className="text-secondary-600 font-medium text-sm">
                        {student.name.split(' ').map((n: string) => n.charAt(0)).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-secondary-900">{student.name}</h3>
                      <p className="text-sm text-secondary-500">
                        Level: <span className={`level-${student.level} px-2 py-1 rounded text-xs`}>
                          {student.level}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-6 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-secondary-900">{student.totalClasses}</div>
                      <div className="text-secondary-500">Total Kelas</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-secondary-900">{student.completedClasses}</div>
                      <div className="text-secondary-500">Selesai</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-secondary-900">{student.completedHours.toFixed(1)}</div>
                      <div className="text-secondary-500">Jam</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-secondary-900">{parseFloat(student.remainingHours || "0").toFixed(1)}</div>
                      <div className="text-secondary-500">Sisa</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}