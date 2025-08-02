import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Mail, Calendar, Eye } from "lucide-react";
import type { User } from "@shared/schema";

export default function Teachers() {
  const { data: teachers = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/teachers"],
  });

  useEffect(() => {
    document.title = "Data Guru - EduAdmin";
  }, []);

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName ? firstName[0] : "";
    const last = lastName ? lastName[0] : "";
    return (first + last).toUpperCase() || "?";
  };

  const getFullName = (firstName?: string, lastName?: string) => {
    return `${firstName || ""} ${lastName || ""}`.trim() || "Nama tidak tersedia";
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-secondary-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-secondary-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Data Guru</h2>
          <p className="text-secondary-600">Kelola informasi guru dan jadwal mereka</p>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">Belum ada guru</h3>
            <p className="text-secondary-600">Guru akan muncul setelah mereka login ke sistem</p>
          </div>
        ) : (
          teachers.map((teacher) => (
            <Card key={teacher.id} className="border border-secondary-200">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    {teacher.profileImageUrl ? (
                      <img 
                        src={teacher.profileImageUrl} 
                        alt={getFullName(teacher.firstName, teacher.lastName)}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-primary-600 font-medium text-lg">
                        {getInitials(teacher.firstName, teacher.lastName)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-secondary-900">
                      {getFullName(teacher.firstName, teacher.lastName)}
                    </h3>
                    <Badge className="bg-purple-100 text-purple-800 mt-1">
                      Guru
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm text-secondary-600">
                    <Mail className="w-4 h-4" />
                    <span>{teacher.email || "Email tidak tersedia"}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-sm text-secondary-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Bergabung {new Date(teacher.createdAt || Date.now()).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-secondary-200">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center justify-center space-x-2 text-secondary-600 hover:text-secondary-700"
                  >
                    <Eye size={16} />
                    <span>Lihat Jadwal</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
