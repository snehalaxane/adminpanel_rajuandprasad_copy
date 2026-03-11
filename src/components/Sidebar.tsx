import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LayoutDashboard,
  Home,
  Navigation,
  MapPin,
  Users,
  Briefcase,
  Building2,
  Clock,
  Network,
  Lightbulb,
  BookOpen,
  Image,
  GraduationCap,
  Mail,
  Search,
  FolderOpen,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Contact,
  Scale
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ currentPage, onNavigate, onLogout }: SidebarProps) {
  const [thinkTankOpen, setThinkTankOpen] = useState(false);
  const [logo, setLogo] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'home-page', label: 'Home Page', icon: Home },
    { id: 'navbar-footer', label: 'Navbar & Footer', icon: Navigation },
    { id: 'footer-contact', label: 'Footer Contact Us', icon: Contact },
    { id: 'map-locations', label: 'Map Locations', icon: MapPin },
    { id: 'team', label: 'Team Management', icon: Users },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'select-clients', label: 'Select Clients', icon: Building2 },
    { id: 'history', label: 'History Page', icon: Clock },
    { id: 'networking', label: 'Networking', icon: Network },
    {
      id: 'think-tank',
      label: 'Think Tank',
      icon: Lightbulb,
      submenu: [
        { id: 'newsletter', label: 'Newsletter', icon: BookOpen },
        { id: 'blog', label: 'Blog Posts', icon: BookOpen },
        { id: 'alumni', label: 'Alumni', icon: GraduationCap }
      ]
    },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'careers', label: 'Careers', icon: Briefcase },
    { id: 'contact', label: 'Contact Page', icon: Mail },
    { id: 'legal-pages', label: 'Legal Pages', icon: Scale },
    { id: 'seo', label: 'SEO & Metadata', icon: Search },
    // { id: 'media', label: 'Media Library', icon: FolderOpen },
    // { id: 'users', label: 'User Management', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];
  
 useEffect(() => {
  fetchSettings();
}, []);

const fetchSettings = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/settings/general`);
    setLogo(res.data.logoUrl);
  } catch (err) {
    console.error(err);
  }
};


  return (
    <div className="w-64 bg-gradient-to-b from-[#16181D] via-[#16181D] to-[#0F1115] text-white flex flex-col border-r border-[rgba(136,136,136,0.25)] shadow-xl">
      <div className="p-6 border-b border-[rgba(136,136,136,0.25)] bg-gradient-to-r from-[#16181D] to-[#1a1d24] flex items-center justify-between">
       <div className="flex items-center gap-3">
  <img
  src={`${API_BASE_URL}${logo}`}
  alt="Logo"
  className="h-10 w-auto"
/>


</div>

      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => (
          <div key={item.id}>
            {item.submenu ? (
              <>
                <button
                  onClick={() => setThinkTankOpen(!thinkTankOpen)}
                  className={`w-full px-6 py-3 flex items-center gap-3 transition-all duration-300 ease-out text-[#888888] hover:text-[#E6E6E6] relative overflow-hidden group ${thinkTankOpen ? 'bg-gradient-to-r from-[rgba(136,136,136,0.1)] to-transparent' : ''
                    }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#888888] to-[#022683] opacity-0 group-hover:opacity-10 transition-opacity duration-300  pointer-events-none"></div>
                  <item.icon className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                  <span className="flex-1 text-left relative z-10">{item.label}</span>
                  {thinkTankOpen ? (
                    <ChevronDown className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-y-0.5" />
                  ) : (
                    <ChevronRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-0.5" />
                  )}
                </button>
                {thinkTankOpen && (
                  <div className="bg-gradient-to-b from-[rgba(136,136,136,0.05)] to-transparent animate-slide-down">
                    {item.submenu.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => onNavigate(subItem.id)}
                        className={`w-full px-6 py-3 pl-14 flex items-center gap-3 transition-all duration-300 relative overflow-hidden group ${currentPage === subItem.id
                          ? 'bg-gradient-to-r from-[#022683] via-[#022683] to-[#033aa0] text-[#E6E6E6] shadow-lg shadow-[#022683]/20 animate-tab-active'
                          : 'text-[#888888] hover:text-[#E6E6E6]'
                          }`}
                      >
                        {currentPage !== subItem.id && (
                          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(136,136,136,0.15)] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300  pointer-events-none"></div>
                        )}
                        {currentPage === subItem.id && (
                          <div className="absolute inset-0 bg-gradient-to-r from-[#022683] to-[#033aa0] animate-pulse-slow  pointer-events-none"></div>
                        )}
                        <subItem.icon className="w-4 h-4 relative z-10 transition-all duration-300 group-hover:scale-110" />
                        <span className="relative z-10 transition-all duration-300 group-active:scale-95">{subItem.label}</span>
                        {currentPage === subItem.id && (
                          <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#888888] to-[#022683] animate-slide-in-right"></div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => onNavigate(item.id)}
                className={`w-full px-6 py-3 flex items-center gap-3 transition-all duration-300 relative overflow-hidden group ${currentPage === item.id
                  ? 'bg-gradient-to-r from-[#022683] via-[#022683] to-[#033aa0] text-[#E6E6E6] shadow-lg shadow-[#022683]/20 animate-tab-active'
                  : 'text-[#888888] hover:text-[#E6E6E6]'
                  }`}
              >
                {currentPage !== item.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[rgba(136,136,136,0.15)] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300  pointer-events-none"></div>
                )}
                {currentPage === item.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#022683] to-[#033aa0] animate-pulse-slow  pointer-events-none"></div>
                )}
                <item.icon className="w-5 h-5 relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" />
                <span className="relative z-10 transition-all duration-300 group-active:scale-95">{item.label}</span>
                {currentPage === item.id && (
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#888888] to-[#022683] animate-slide-in-right"></div>
                )}
              </button>
            )}
          </div>
        ))}
      </nav>

      <button
        onClick={onLogout}
        className="relative z-50 px-6 py-4 flex items-center gap-3 transition-all duration-300 border-t border-[rgba(136,136,136,0.25)] text-[#888888] hover:text-[#E6E6E6] overflow-hidden group bg-gradient-to-r from-[#16181D] to-[#1a1d24] hover:from-red-900/20 hover:to-transparent"
      >

        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-700 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>

        <LogOut className="w-5 h-5 relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-12" />
        <span className="relative z-10 transition-all duration-300 group-active:scale-95">Logout</span>
      </button>
    </div>
  );
}