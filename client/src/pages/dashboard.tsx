import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, ChartLine, Clock, UserCheck, ArrowUp, Plus, BarChart3, History } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  useEffect(() => {
    document.title = "Dashboard - EduAdmin";
  }, []);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-16 bg-secondary-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
        <p className="text-secondary-600">Selamat datang di sistem manajemen pembelajaran</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border border-secondary-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600 mb-1">Total Murid</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {stats?.totalStudents || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="text-blue-600" size={20} />
              </div>
            </div>
            <div className="mt-4 text-sm text-green-600">
              <ArrowUp className="inline w-4 h-4 mr-1" />
              <span>Murid aktif</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-secondary-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600 mb-1">Kelas Hari Ini</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {stats?.todayClasses || 0}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Calendar className="text-green-600" size={20} />
              </div>
            </div>
            <div className="mt-4 text-sm text-blue-600">
              <Clock className="inline w-4 h-4 mr-1" />
              <span>{stats?.ongoingClasses || 0} sedang berlangsung</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-secondary-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600 mb-1">Total Guru</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {stats?.totalTeachers || 0}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <UserCheck className="text-purple-600" size={20} />
              </div>
            </div>
            <div className="mt-4 text-sm text-green-600">
              <UserCheck className="inline w-4 h-4 mr-1" />
              <span>Guru aktif</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-secondary-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600 mb-1">Sistem Status</p>
                <p className="text-2xl font-bold text-secondary-900">Online</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <ChartLine className="text-orange-600" size={20} />
              </div>
            </div>
            <div className="mt-4 text-sm text-green-600">
              <ArrowUp className="inline w-4 h-4 mr-1" />
              <span>Sistem berjalan normal</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <Card className="border border-secondary-200">
            <div className="p-6 border-b border-secondary-200">
              <h3 className="text-lg font-semibold text-secondary-900">Aktivitas Terbaru</h3>
            </div>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4 py-3 border-b border-secondary-100 last:border-b-0">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Users className="text-blue-600 w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-secondary-900">Sistem siap digunakan</p>
                    <p className="text-xs text-secondary-600">Tambahkan murid dan guru untuk memulai</p>
                  </div>
                  <span className="text-xs text-secondary-500">Baru saja</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="border border-secondary-200">
            <div className="p-6 border-b border-secondary-200">
              <h3 className="text-lg font-semibold text-secondary-900">Aksi Cepat</h3>
            </div>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button 
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                  onClick={() => setLocation("/students")}
                >
                  <Plus size={16} />
                  <span>Tambah Murid Baru</span>
                </Button>
                
                <Button 
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                  onClick={() => setLocation("/schedule")}
                >
                  <Calendar size={16} />
                  <span>Jadwalkan Kelas</span>
                </Button>
                
                <Button 
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                  onClick={() => setLocation("/packages")}
                >
                  <Plus size={16} />
                  <span>Kelola Paket</span>
                </Button>
                
                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                  onClick={() => setLocation("/reports")}
                >
                  <BarChart3 size={16} />
                  <span>Lihat Laporan</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
