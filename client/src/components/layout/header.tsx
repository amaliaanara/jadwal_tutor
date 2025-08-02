import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/students": "Data Murid",
  "/packages": "Paket Pembelajaran",
  "/schedule": "Jadwal Kelas",
  "/teachers": "Data Guru",
  "/reports": "Laporan",
  "/history": "Riwayat Kelas",
};

export default function Header() {
  const [location] = useLocation();
  const pageTitle = pageTitles[location] || "EduAdmin";

  return (
    <header className="bg-white shadow-sm border-b border-secondary-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-secondary-900 lg:ml-0 ml-12">
            {pageTitle}
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="relative text-secondary-500 hover:text-secondary-700"
          >
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </Button>
          
          <div className="hidden md:block">
            <p className="text-sm text-secondary-600">Selamat datang kembali!</p>
          </div>
        </div>
      </div>
    </header>
  );
}
