import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths, isWithinInterval, startOfDay, endOfDay, getDay } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ClassWithRelations } from "@shared/schema";

interface CalendarGridProps {
  classes: ClassWithRelations[];
  onDateClick?: (date: Date) => void;
  onClassClick?: (classItem: ClassWithRelations) => void;
}

export default function CalendarGrid({ classes, onDateClick, onClassClick }: CalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add empty cells for days before the month starts (Sunday = 0)
  const startDay = getDay(monthStart);
  const emptyDays = Array.from({ length: startDay }, (_, i) => i);

  const getClassesForDay = (date: Date) => {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    
    return classes.filter(cls => {
      const classDate = new Date(cls.startTime);
      return isWithinInterval(classDate, { start: dayStart, end: dayEnd });
    }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  };

  const getClassColor = (status: string) => {
    switch (status) {
      case "ongoing": return "bg-green-100 text-green-800";
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-secondary-100 text-secondary-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "rescheduled": return "bg-yellow-100 text-yellow-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  const getDayNames = () => ["Ming", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const handleDateClick = (date: Date) => {
    if (onDateClick) {
      onDateClick(date);
    }
  };

  const handleClassClick = (e: React.MouseEvent, classItem: ClassWithRelations) => {
    e.stopPropagation();
    if (onClassClick) {
      onClassClick(classItem);
    }
  };

  return (
    <Card className="border border-secondary-200">
      <div className="p-6 border-b border-secondary-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="text-secondary-600 hover:text-secondary-900"
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
              className="text-secondary-600 hover:text-secondary-900"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
            className="text-secondary-600 hover:text-secondary-900"
          >
            Hari Ini
          </Button>
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
          {/* Empty cells for days before the month starts */}
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} className="min-h-24 p-2"></div>
          ))}
          
          {monthDays.map((day) => {
            const dayClasses = getClassesForDay(day);
            const isCurrentDay = isToday(day);
            
            return (
              <div
                key={day.toISOString()}
                className={`calendar-day ${isCurrentDay ? "today" : ""}`}
                onClick={() => handleDateClick(day)}
              >
                <div className={`calendar-day-number ${isCurrentDay ? "text-primary-900 font-bold" : ""}`}>
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {dayClasses.slice(0, 3).map((cls) => (
                    <div
                      key={cls.id}
                      className={`calendar-class-item ${getClassColor(cls.status)} cursor-pointer hover:opacity-80`}
                      title={`${format(new Date(cls.startTime), "HH:mm")} - ${cls.student?.name} (${cls.subject || "Kelas"})`}
                      onClick={(e) => handleClassClick(e, cls)}
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
  );
}
