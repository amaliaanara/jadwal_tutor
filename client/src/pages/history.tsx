import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Search, History as HistoryIcon } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useState } from "react";
import type { ClassWithRelations } from "@shared/schema";

export default function History() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: classes = [], isLoading } = useQuery<ClassWithRelations[]>({
    queryKey: ["/api/classes"],
  });

  useEffect(() => {
    document.title = "Riwayat Kelas - EduAdmin";
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "rescheduled": return "bg-yellow-100 text-yellow-800";
      case "ongoing": return "bg-blue-100 text-blue-800";
      case "scheduled": return "bg-secondary-100 text-secondary-800";
      default: return "bg-secondary-100 text-secondary-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "Selesai";
      case "cancelled": return "Dibatalkan";
      case "rescheduled": return "Dijadwal Ulang";
      case "ongoing": return "Berlangsung";
      case "scheduled": return "Dijadwalkan";
      default: return status;
    }
  };

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.teacher?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.teacher?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || cls.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort by most recent first
  const sortedClasses = filteredClasses.sort((a, b) => 
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-secondary-200 rounded w-64"></div>
          <div className="h-64 bg-secondary-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-secondary-900">Riwayat Kelas</h2>
        <p className="text-secondary-600">Lihat riwayat kelas yang telah berlangsung</p>
      </div>

      {/* Filters */}
      <Card className="border border-secondary-200 mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Cari Kelas</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                <Input
                  placeholder="Nama murid, guru, atau mata pelajaran..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="cancelled">Dibatalkan</SelectItem>
                  <SelectItem value="rescheduled">Dijadwal Ulang</SelectItem>
                  <SelectItem value="ongoing">Berlangsung</SelectItem>
                  <SelectItem value="scheduled">Dijadwalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <Card className="border border-secondary-200">
        <div className="p-6 border-b border-secondary-200">
          <h3 className="text-lg font-semibold text-secondary-900">
            Riwayat Kelas ({sortedClasses.length})
          </h3>
        </div>
        <div className="divide-y divide-secondary-200">
          {sortedClasses.length === 0 ? (
            <div className="p-6 text-center">
              <HistoryIcon className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">
                {searchTerm || statusFilter !== "all" 
                  ? "Tidak ada kelas yang sesuai dengan filter"
                  : "Belum ada riwayat kelas"
                }
              </h3>
              <p className="text-secondary-600">
                {searchTerm || statusFilter !== "all" 
                  ? "Coba ubah filter pencarian Anda"
                  : "Kelas yang telah dijadwalkan akan muncul di sini"
                }
              </p>
            </div>
          ) : (
            sortedClasses.map((cls) => (
              <div key={cls.id} className="p-6 hover:bg-secondary-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-secondary-900">
                        {cls.subject || "Kelas Online"} - Level {cls.student?.level || "Unknown"}
                      </h4>
                      <Badge className={getStatusColor(cls.status)}>
                        {getStatusText(cls.status)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-secondary-600 mb-2">
                      {cls.student?.name} dengan{" "}
                      {cls.teacher?.firstName} {cls.teacher?.lastName}
                    </p>
                    
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-secondary-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {format(new Date(cls.startTime), "dd MMM yyyy, HH:mm", { locale: id })} - {format(new Date(cls.endTime), "HH:mm")}
                      </span>
                      
                      {cls.duration && (
                        <span className="text-xs text-secondary-500">
                          Durasi: {cls.duration} jam
                        </span>
                      )}
                    </div>
                    
                    {cls.notes && (
                      <p className="text-sm text-secondary-600 mt-2 bg-secondary-50 p-2 rounded">
                        <strong>Catatan:</strong> {cls.notes}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right text-sm text-secondary-500">
                    <div className="mb-1">
                      {format(new Date(cls.createdAt || cls.startTime), "dd/MM/yyyy", { locale: id })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </main>
  );
}
