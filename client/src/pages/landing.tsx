import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Users, Calendar, BookOpen } from "lucide-react";

export default function Landing() {
  useEffect(() => {
    document.title = "EduAdmin - Sistem Manajemen Pembelajaran";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="pt-8 pb-8 px-8">
          <div className="text-center mb-8">
            <div className="bg-primary-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-secondary-900">EduAdmin</h1>
            <p className="text-secondary-600 mt-2">Sistem Manajemen Pembelajaran</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-3 text-secondary-700">
              <Users className="w-5 h-5 text-primary-500" />
              <span className="text-sm">Kelola data murid dan guru</span>
            </div>
            <div className="flex items-center space-x-3 text-secondary-700">
              <Calendar className="w-5 h-5 text-primary-500" />
              <span className="text-sm">Jadwalkan kelas online</span>
            </div>
            <div className="flex items-center space-x-3 text-secondary-700">
              <BookOpen className="w-5 h-5 text-primary-500" />
              <span className="text-sm">Manajemen paket pembelajaran</span>
            </div>
          </div>

          <Button 
            className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg transition-colors duration-200 font-medium"
            onClick={() => window.location.href = "/api/login"}
          >
            Masuk ke Sistem
          </Button>

          <p className="text-xs text-secondary-500 text-center mt-4">
            Silakan masuk untuk mengakses sistem manajemen pembelajaran
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
