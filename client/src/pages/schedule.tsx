import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Plus, ExternalLink, Edit, Clock, Video, Filter, User } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { id } from "date-fns/locale";
import ScheduleClassModal from "@/components/modals/schedule-class-modal";
import type { ClassWithRelations } from "@shared/schema";

export default function Schedule() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("month");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all");

  const { data: classes = [], isLoading } = useQuery<ClassWithRelations[]>({
    queryKey: ["/api/classes", format(startOfMonth(currentMonth), "yyyy-MM-dd"), format(endOfMonth(currentMonth), "yyyy-MM-dd")],
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ["/api/teachers"],
  });

  useEffect(() => {
    document.title = "Jadwal Kelas - EduAdmin";
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getClassesForDay = (date: Date) => {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    
    return classes.filter(cls => {
      const classDate = new Date(cls.startTime);
      const isInDay = isWithinInterval(classDate, { start: dayStart, end: dayEnd });
      const isTeacherMatch = selectedTeacher === "all" || cls.teacherId === selectedTeacher;
      return isInDay && isTeacherMatch;
    });
  };

  const getTodayClasses = () => {
    const today = new Date();
    return getClassesForDay(today);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ongoing": return "bg-green-100 text-green-800";
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-secondary-100 text-secondary-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "rescheduled": return "bg-yellow-100 text-yellow-800";
      default: return "bg-secondary-100 text-secondary-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ongoing": return "Berlangsung";
      case "scheduled": return "Dijadwalkan";
      case "completed": return "Selesai";
      case "cancelled": return "Dibatalkan";
      case "rescheduled": return "Dijadwal Ulang";
      default: return status;
    }
  };

  const getDayNames = () => ["Ming", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-secondary-200 rounded w-64"></div>
          <div className="h-96 bg-secondary-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Jadwal Kelas</h2>
          <p className="text-secondary-600">Kelola dan lihat jadwal pembelajaran</p>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          {/* Teacher Filter */}
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-secondary-500" />
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter per guru" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Guru</SelectItem>
                {(teachers as any[]).map((teacher: any) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.firstName} {teacher.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Clock size={16} />
              <span className="hidden sm:inline">Minggu Ini</span>
            </Button>
            <Button 
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              onClick={() => setIsScheduleModalOpen(true)}
            >
              <Plus size={16} />
              <span>Jadwalkan Kelas</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <Card className="border border-secondary-200 mb-6">
        <div className="p-6 border-b border-secondary-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft size={16} />
              </Button>
              <h3 className="text-xl font-semibold text-secondary-900">
                {format(currentMonth, "MMMM yyyy", { locale: id })}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant={viewMode === "day" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("day")}
                className={viewMode === "day" ? "bg-primary-500 text-white" : ""}
              >
                Hari
              </Button>
              <Button 
                variant={viewMode === "week" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("week")}
                className={viewMode === "week" ? "bg-primary-500 text-white" : ""}
              >
                Minggu
              </Button>
              <Button 
                variant={viewMode === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("month")}
                className={viewMode === "month" ? "bg-primary-500 text-white" : ""}
              >
                Bulan
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="pt-6">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-4 mb-4">
            {getDayNames().map((day) => (
              <div key={day} className="text-center text-sm font-medium text-secondary-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-4">
            {/* Add empty cells for days before the month starts */}
            {Array.from({ length: monthStart.getDay() }, (_, i) => (
              <div key={`empty-${i}`} className="min-h-24 p-2"></div>
            ))}
            
            {monthDays.map((day) => {
              const dayClasses = getClassesForDay(day);
              const isCurrentDay = isToday(day);
              
              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-24 p-2 border rounded-lg hover:bg-secondary-50 cursor-pointer ${
                    isCurrentDay 
                      ? "border-2 border-primary-500 bg-primary-50" 
                      : "border-secondary-200"
                  }`}
                >
                  <div className={`text-sm mb-1 ${
                    isCurrentDay 
                      ? "text-primary-900 font-bold" 
                      : "text-secondary-900 font-medium"
                  }`}>
                    {format(day, "d")}
                  </div>
                  <div className="space-y-1">
                    {dayClasses.slice(0, 3).map((cls) => (
                      <div
                        key={cls.id}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded truncate"
                        title={`${format(new Date(cls.startTime), "HH:mm")} - ${cls.student?.name}`}
                      >
                        {format(new Date(cls.startTime), "HH:mm")} - {cls.student?.name}
                      </div>
                    ))}
                    {dayClasses.length > 3 && (
                      <div className="text-xs text-secondary-500 px-2">
                        +{dayClasses.length - 3} lainnya
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Today's Classes */}
      <Card className="border border-secondary-200">
        <div className="p-6 border-b border-secondary-200">
          <h3 className="text-lg font-semibold text-secondary-900">Kelas Hari Ini</h3>
        </div>
        <div className="divide-y divide-secondary-200">
          {getTodayClasses().length === 0 ? (
            <div className="p-6 text-center text-secondary-500">
              Tidak ada kelas yang dijadwalkan hari ini
            </div>
          ) : (
            getTodayClasses().map((cls) => (
              <div key={cls.id} className="p-6 flex items-center justify-between hover:bg-secondary-50">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Video className="text-blue-600 w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-secondary-900">
                      {cls.subject || "Kelas Online"} - Level {cls.student?.level || "Unknown"}
                    </h4>
                    <p className="text-sm text-secondary-600">
                      {cls.student?.name} dengan {cls.teacher?.firstName} {cls.teacher?.lastName}
                    </p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-secondary-500">
                        <Clock className="inline w-3 h-3 mr-1" />
                        {cls.startTime ? format(new Date(cls.startTime), "HH:mm") : ""} - {cls.endTime ? format(new Date(cls.endTime), "HH:mm") : ""}
                      </span>
                      <Badge className={getStatusColor(cls.status || "")}>
                        {getStatusText(cls.status || "")}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {cls.zoomLink && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                      onClick={() => window.open(cls.zoomLink || "", "_blank")}
                    >
                      <ExternalLink size={16} />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-secondary-600 hover:text-secondary-700 hover:bg-secondary-50"
                  >
                    <Edit size={16} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <ScheduleClassModal
        open={isScheduleModalOpen}
        onOpenChange={setIsScheduleModalOpen}
      />
    </main>
  );
}
