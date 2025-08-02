import { Link, useLocation } from "wouter";
import { 
  Home, 
  Users, 
  Package, 
  Calendar, 
  UserCheck, 
  BarChart3, 
  History, 
  LogOut,
  GraduationCap,
  Menu,
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Data Murid", href: "/students", icon: Users },
  { name: "Paket Pembelajaran", href: "/packages", icon: Package },
  { name: "Jadwal Kelas", href: "/schedule", icon: Calendar },
  { name: "Data Guru", href: "/teachers", icon: UserCheck },
  { name: "Laporan", href: "/reports", icon: BarChart3 },
  { name: "Riwayat Kelas", href: "/history", icon: History },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName ? firstName[0] : "";
    const last = lastName ? lastName[0] : "";
    return (first + last).toUpperCase() || "U";
  };

  const getFullName = (firstName?: string, lastName?: string) => {
    return `${firstName || ""} ${lastName || ""}`.trim() || "User";
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  // Show mobile menu button on mobile
  if (isMobile) {
    return (
      <>
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          className="fixed top-4 left-4 z-50 lg:hidden bg-white shadow-md"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>

        {/* Mobile sidebar overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarContent 
            location={location}
            user={user}
            getInitials={getInitials}
            getFullName={getFullName}
            handleLogout={handleLogout}
            onLinkClick={() => setIsMobileMenuOpen(false)}
          />
        </div>
      </>
    );
  }

  // Desktop sidebar
  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
      <SidebarContent 
        location={location}
        user={user}
        getInitials={getInitials}
        getFullName={getFullName}
        handleLogout={handleLogout}
      />
    </div>
  );
}

interface SidebarContentProps {
  location: string;
  user: any;
  getInitials: (firstName?: string, lastName?: string) => string;
  getFullName: (firstName?: string, lastName?: string) => string;
  handleLogout: () => void;
  onLinkClick?: () => void;
}

function SidebarContent({ 
  location, 
  user, 
  getInitials, 
  getFullName, 
  handleLogout, 
  onLinkClick 
}: SidebarContentProps) {
  return (
    <>
      <div className="flex items-center justify-center h-16 bg-primary-500 text-white">
        <GraduationCap size={24} className="mr-2" />
        <span className="text-xl font-bold">EduAdmin</span>
      </div>
      
      <nav className="mt-8">
        <div className="px-4 py-2">
          <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wider">
            Menu Utama
          </p>
        </div>
        
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onLinkClick}
            >
              <div className={`flex items-center px-6 py-3 text-sm transition-colors duration-150 ${
                isActive
                  ? "bg-primary-50 text-primary-600 border-r-2 border-primary-600"
                  : "text-secondary-700 hover:bg-primary-50 hover:text-primary-600"
              }`}>
                <item.icon className="w-5 h-5 mr-3" />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      
      <div className="absolute bottom-0 w-full p-4 border-t border-secondary-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
            {user?.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt={getFullName(user.firstName, user.lastName)}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-sm font-medium">
                {getInitials(user?.firstName, user?.lastName)}
              </span>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-secondary-900">
              {getFullName(user?.firstName, user?.lastName)}
            </p>
            <p className="text-xs text-secondary-500 capitalize">
              {user?.role || "User"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-secondary-500 hover:text-secondary-700 p-2"
          >
            <LogOut size={16} />
          </Button>
        </div>
      </div>
    </>
  );
}
