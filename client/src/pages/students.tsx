import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AddStudentModal from "@/components/modals/add-student-modal";
import type { StudentWithRelations } from "@shared/schema";

export default function Students() {
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [packageFilter, setPackageFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();

  const { data: students = [], isLoading } = useQuery<StudentWithRelations[]>({
    queryKey: ["/api/students"],
  });

  const deleteStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await fetch(`/api/students/${studentId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete student");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({
        title: "Berhasil",
        description: "Murid berhasil dihapus",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal menghapus murid",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    document.title = "Data Murid - EduAdmin";
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === "all" || student.level === levelFilter;
    const matchesPackage = packageFilter === "all" || 
                          (student.package && student.package.hours.toString() === packageFilter);
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && student.isActive) ||
                         (statusFilter === "inactive" && !student.isActive);
    
    return matchesSearch && matchesLevel && matchesPackage && matchesStatus;
  });

  const handleDeleteStudent = (studentId: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus murid ini?")) {
      deleteStudentMutation.mutate(studentId);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case "beginner": return "bg-yellow-100 text-yellow-800";
      case "intermediate": return "bg-blue-100 text-blue-800";
      case "advanced": return "bg-green-100 text-green-800";
      default: return "bg-secondary-100 text-secondary-800";
    }
  };

  const getProgressPercentage = (remaining: number, total: number) => {
    if (!total || total <= 0) return 0;
    return Math.max(0, Math.min(100, (remaining / total) * 100));
  };

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Data Murid</h2>
          <p className="text-secondary-600">Kelola informasi murid dan paket pembelajaran</p>
        </div>
        <Button 
          className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={16} />
          <span>Tambah Murid</span>
        </Button>
      </div>

      {/* Filters */}
      <Card className="border border-secondary-200 mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Cari Murid</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                <Input
                  placeholder="Nama murid..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Level</label>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Level</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Paket</label>
              <Select value={packageFilter} onValueChange={setPackageFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Paket" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Paket</SelectItem>
                  <SelectItem value="4">4 Jam</SelectItem>
                  <SelectItem value="8">8 Jam</SelectItem>
                  <SelectItem value="12">12 Jam</SelectItem>
                  <SelectItem value="15">15 Jam</SelectItem>
                  <SelectItem value="20">20 Jam</SelectItem>
                  <SelectItem value="40">40 Jam</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card className="border border-secondary-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-secondary-900">Murid</th>
                <th className="text-left py-4 px-6 font-medium text-secondary-900">Usia</th>
                <th className="text-left py-4 px-6 font-medium text-secondary-900">Level</th>
                <th className="text-left py-4 px-6 font-medium text-secondary-900">Paket</th>
                <th className="text-left py-4 px-6 font-medium text-secondary-900">Sisa Jam</th>
                <th className="text-left py-4 px-6 font-medium text-secondary-900">Guru</th>
                <th className="text-left py-4 px-6 font-medium text-secondary-900">Status</th>
                <th className="text-left py-4 px-6 font-medium text-secondary-900">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 px-6 text-center text-secondary-500">
                    {searchTerm || levelFilter !== "all" || packageFilter !== "all" || statusFilter !== "all" 
                      ? "Tidak ada murid yang sesuai dengan filter"
                      : "Belum ada murid yang terdaftar"
                    }
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-secondary-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-medium text-sm">
                            {getInitials(student.name)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-secondary-900">{student.name}</p>
                          <p className="text-sm text-secondary-600">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-secondary-600">
                      {student.age ? `${student.age} tahun` : "-"}
                    </td>
                    <td className="py-4 px-6">
                      <Badge className={getLevelBadgeColor(student.level || "beginner")}>
                        {student.level === "beginner" ? "Beginner" : 
                         student.level === "intermediate" ? "Intermediate" : "Advanced"}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-secondary-600">
                      {student.package ? `${student.package.hours} Jam` : "-"}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-secondary-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ 
                              width: `${getProgressPercentage(
                                Number(student.remainingHours) || 0, 
                                Number(student.totalHours) || 1
                              )}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-secondary-600">
                          {Number(student.remainingHours) || 0} jam
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-secondary-600">
                      {student.assignedTeacher 
                        ? `${student.assignedTeacher.firstName} ${student.assignedTeacher.lastName}`.trim()
                        : "-"
                      }
                    </td>
                    <td className="py-4 px-6">
                      <Badge className={student.isActive 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                      }>
                        {student.isActive ? "Aktif" : "Tidak Aktif"}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-secondary-600 hover:text-secondary-700 hover:bg-secondary-50"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteStudent(student.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        {filteredStudents.length > 0 && (
          <div className="bg-secondary-50 px-6 py-4 border-t border-secondary-200 flex items-center justify-between">
            <div className="text-sm text-secondary-600">
              Menampilkan {filteredStudents.length} murid
            </div>
          </div>
        )}
      </Card>

      <AddStudentModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />
    </main>
  );
}
