import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClassSchema, type InsertClass, type StudentWithRelations, type User } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { z } from "zod";

interface ScheduleClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Extended schema for form validation including date/time formatting
const scheduleClassSchema = insertClassSchema.extend({
  date: z.string().min(1, "Tanggal harus diisi"),
  startTime: z.string().min(1, "Waktu mulai harus diisi"),
  endTime: z.string().min(1, "Waktu selesai harus diisi"),
}).omit({
  startTime: true,
  endTime: true,
});

type ScheduleClassForm = z.infer<typeof scheduleClassSchema> & {
  date: string;
  startTime: string;
  endTime: string;
};

export default function ScheduleClassModal({ open, onOpenChange }: ScheduleClassModalProps) {
  const { toast } = useToast();

  const { data: students = [] } = useQuery<StudentWithRelations[]>({
    queryKey: ["/api/students"],
    enabled: open,
  });

  const { data: teachers = [] } = useQuery<User[]>({
    queryKey: ["/api/teachers"],
    enabled: open,
  });

  const form = useForm<ScheduleClassForm>({
    resolver: zodResolver(scheduleClassSchema),
    defaultValues: {
      studentId: "",
      teacherId: "",
      subject: "",
      date: "",
      startTime: "",
      endTime: "",
      duration: "1.0",
      zoomLink: "",
      status: "scheduled",
      notes: "",
    },
  });

  const createClassMutation = useMutation({
    mutationFn: async (data: ScheduleClassForm) => {
      // Combine date and time into proper DateTime objects
      const startDateTime = new Date(`${data.date}T${data.startTime}`);
      const endDateTime = new Date(`${data.date}T${data.endTime}`);
      
      // Validate that end time is after start time
      if (endDateTime <= startDateTime) {
        throw new Error("Waktu selesai harus setelah waktu mulai");
      }

      // Calculate duration in hours
      const durationHours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
      
      const classData: InsertClass = {
        studentId: data.studentId,
        teacherId: data.teacherId,
        subject: data.subject,
        startTime: startDateTime,
        endTime: endDateTime,
        duration: durationHours.toString(),
        zoomLink: data.zoomLink || undefined,
        status: data.status,
        notes: data.notes || undefined,
      };
      
      await apiRequest("POST", "/api/classes", classData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      onOpenChange(false);
      form.reset();
      toast({
        title: "Berhasil",
        description: "Kelas berhasil dijadwalkan",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Gagal menjadwalkan kelas",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ScheduleClassForm) => {
    createClassMutation.mutate(data);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  // Get today's date in YYYY-MM-DD format for minimum date
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Jadwalkan Kelas Baru</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Murid</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih murid" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {students.filter(student => student.isActive).map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name} ({student.level})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="teacherId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guru</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih guru" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.firstName} {teacher.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mata Pelajaran</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Matematika, Bahasa Inggris" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      min={today}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Waktu Mulai</FormLabel>
                    <FormControl>
                      <Input 
                        type="time"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Waktu Selesai</FormLabel>
                    <FormControl>
                      <Input 
                        type="time"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="zoomLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link Zoom (Opsional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="url"
                      placeholder="https://zoom.us/j/..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Catatan tambahan untuk kelas ini..."
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Batal
              </Button>
              <Button 
                type="submit"
                disabled={createClassMutation.isPending}
                className="bg-primary-500 hover:bg-primary-600"
              >
                {createClassMutation.isPending ? "Menjadwalkan..." : "Jadwalkan Kelas"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
