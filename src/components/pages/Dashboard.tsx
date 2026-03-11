import React, { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

import {
  Globe,
  FileText,
  Users,
  BookOpen,
  MapPin,
  Clock,
  Eye,
  Edit,
  Image as ImageIcon,
  AlertCircle,
  Loader
} from 'lucide-react';

interface Admin {
  email: string;
  lastLogin?: string;
}

interface StatData {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className: string }>;
  color: string;
}

interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className: string }>;
  action: string;
}

interface Activity {
  section: string;
  action: string;
  timestamp?: string;
}

export default function Dashboard({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [stats, setStats] = useState<StatData[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const quickActions: QuickAction[] = [
    { label: 'Edit Home Page', icon: Edit, action: 'home-page' },
    { label: 'Manage Team', icon: Users, action: 'team' },
    { label: 'Manage Services', icon: FileText, action: 'services' },
    { label: 'Manage Map Locations', icon: MapPin, action: 'map-locations' },
    { label: 'Upload Images', icon: ImageIcon, action: 'gallery' },
    { label: 'View Website', icon: Eye, action: 'preview' }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Check for token in URL first (from login redirect)
      const params = new URLSearchParams(window.location.search);
      let token = params.get('token');

      if (token) {
        console.log("✅ Token found in URL, saving to localStorage");
        localStorage.setItem('token', token);
        // Remove token from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        token = localStorage.getItem('token');
      }

      // console.log("🔍 Dashboard loading, token from localStorage:", token ? `✓ ${token.substring(0, 20)}...` : "✗ NO TOKEN");

      if (!token) {
        console.warn("❌ No token found in localStorage or URL");
        setError('Not authenticated. Please login.');
        setLoading(false);
        return;
      }

      // Fetch admin data
      console.log("📤 Fetching /api/admin/me with token...");
      const adminRes = await fetch(`${API_BASE_URL}/api/admin/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      let adminData;
      try {
        adminData = await adminRes.json();
      } catch (jsonError) {
        console.error("❌ Failed to parse JSON:", adminRes.status, adminRes.statusText);
        const text = await adminRes.text();
        console.error("Response body:", text.substring(0, 200));
        setError(`Server error: ${adminRes.status}`);
        setLoading(false);
        return;
      }

      console.log("✅ ADMIN RESPONSE:", { status: adminRes.status, authenticated: adminData.authenticated, email: adminData.email });

      if (adminRes.ok && adminData.authenticated) {
        setAdmin({
          email: adminData.email,
          lastLogin: adminData.lastLogin
        });
        console.log("✅ Admin profile loaded:", adminData.email);
      } else {
        console.warn("❌ Authentication failed. Status:", adminRes.status, "Data:", adminData);
      }

      // Fetch all stats in parallel
      const [teamRes, blogRes, galleryRes, mapRes, jobRes, settingsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/team-members`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/blogs`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/gallery`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/map-locations`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/job-openings`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/settings/general`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      let teamCount = 0;
      let blogCount = 0;
      let galleryCount = 0;
      let mapCount = 0;
      let jobCount = 0;
      let websiteStatus = 'Live';

      if (teamRes.ok) {
        const teamData = await teamRes.json();
        teamCount = Array.isArray(teamData) ? teamData.length : teamData.data?.length || 0;
      }

      if (blogRes.ok) {
        const blogData = await blogRes.json();
        blogCount = Array.isArray(blogData) ? blogData.length : blogData.data?.length || 0;
      }

      if (galleryRes.ok) {
        const galleryData = await galleryRes.json();
        galleryCount = Array.isArray(galleryData) ? galleryData.length : galleryData.data?.length || 0;
      }

      if (mapRes.ok) {
        const mapData = await mapRes.json();
        mapCount = Array.isArray(mapData) ? mapData.length : mapData.data?.length || 0;
      }

      if (jobRes.ok) {
        const jobData = await jobRes.json();
        jobCount = Array.isArray(jobData) ? jobData.length : jobData.data?.length || 0;
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        websiteStatus = settingsData.websiteStatus || 'Live';
      }

      // Build dynamic stats
      const dynamicStats: StatData[] = [
        { label: 'Website Status', value: websiteStatus, icon: Globe, color: websiteStatus === 'Live' ? 'bg-green-600' : 'bg-yellow-600' },
        { label: 'Blog Posts', value: blogCount, icon: BookOpen, color: 'bg-[#888888]' },
        { label: 'Team Members', value: teamCount, icon: Users, color: 'bg-[#022683]' },
        { label: 'Gallery Images', value: galleryCount, icon: ImageIcon, color: 'bg-[#888888]' },
        { label: 'Map Locations', value: mapCount, icon: MapPin, color: 'bg-[#022683]' },
        { label: 'Job Openings', value: jobCount, icon: FileText, color: 'bg-[#888888]' }
      ];

      setStats(dynamicStats);

      // Generate activities from counts (simulated)
      const newActivities: Activity[] = [
        { section: 'Team', action: `Total members: ${teamCount}`, timestamp: 'Updated' },
        { section: 'Blog', action: `Total posts: ${blogCount}`, timestamp: 'Updated' },
        { section: 'Gallery', action: `Total images: ${galleryCount}`, timestamp: 'Updated' },
        { section: 'Locations', action: `Total offices: ${mapCount}`, timestamp: 'Updated' },
        { section: 'Careers', action: `Job openings: ${jobCount}`, timestamp: 'Updated' }
      ];

      setActivities(newActivities);

    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
      setError("Failed to load dashboard data");

      // Set fallback stats with 0 values
      const fallbackStats: StatData[] = [
        { label: 'Website Status', value: 'Live', icon: Globe, color: 'bg-green-600' },
        { label: 'Blog Posts', value: 0, icon: BookOpen, color: 'bg-[#888888]' },
        { label: 'Team Members', value: 0, icon: Users, color: 'bg-[#022683]' },
        { label: 'Gallery Images', value: 0, icon: ImageIcon, color: 'bg-[#888888]' },
        { label: 'Map Locations', value: 0, icon: MapPin, color: 'bg-[#022683]' },
        { label: 'Job Openings', value: 0, icon: FileText, color: 'bg-[#888888]' }
      ];
      setStats(fallbackStats);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    if (action === 'preview') {
      window.open('http://localhost:5173', '_blank');
    } else if (onNavigate) {
      onNavigate(action);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-[#0F1115] via-[#0F1115] to-[#16181D] min-h-full">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-[#888888]">Welcome back! Here's an overview of your website.</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-400 text-sm">{error}</span>
          <button
            onClick={fetchDashboardData}
            className="ml-auto text-red-400 hover:text-red-300 text-sm font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#888888]/20 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-[#888888]/20 rounded w-24 mb-2"></div>
                  <div className="h-6 bg-[#888888]/20 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 flex items-center gap-4 border border-[rgba(136,136,136,0.25)] hover-card-lift hover:border-[#888888] transition-all duration-300 relative overflow-hidden group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[rgba(136,136,136,0.05)] to-[rgba(2,38,131,0.05)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="relative z-10">
                <p className="text-[#888888] text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-[#E6E6E6] transition-all duration-300 group-hover:scale-105">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in">
          <h2 className="text-xl font-bold text-[#E6E6E6] mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-[#888888] to-[#022683] rounded-full"></span>
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.action)}
                className="flex items-center gap-3 p-4 border border-[rgba(136,136,136,0.25)] rounded-lg hover:border-[#888888] transition-all duration-300 relative overflow-hidden group bg-gradient-to-br from-[#0F1115] to-[#16181D]"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[rgba(136,136,136,0.1)] to-[rgba(2,38,131,0.1)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <action.icon className="w-5 h-5 text-[#888888] relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:text-[#022683]" />
                <span className="text-sm font-medium text-[#E6E6E6] relative z-10 transition-all duration-300 group-active:scale-95">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Overview */}
        <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in">
          <h2 className="text-xl font-bold text-[#E6E6E6] mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-[#888888] to-[#022683] rounded-full"></span>
            Content Overview
          </h2>
          <div className="space-y-4">
            {loading ? (
              <>
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex items-start gap-3 pb-4 border-b border-[rgba(136,136,136,0.25)]">
                    <div className="w-5 h-5 bg-[#888888]/20 rounded mt-0.5"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-[#888888]/20 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-[#888888]/20 rounded w-40"></div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              activities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 pb-4 border-b border-[rgba(136,136,136,0.25)] last:border-0 transition-all duration-300 hover:bg-[rgba(136,136,136,0.05)] hover:px-2 hover:-mx-2 rounded-lg group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Clock className="w-5 h-5 text-[#888888] mt-0.5 transition-all duration-300 group-hover:scale-110 group-hover:text-[#022683]" />
                  <div className="flex-1">
                    <p className="font-medium text-[#E6E6E6] transition-all duration-300 group-hover:text-[#888888]">
                      {activity.section}
                    </p>
                    <p className="text-sm text-[#888888]">{activity.action}</p>
                  </div>
                  <span className="text-xs text-[#888888]">{activity.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Admin Profile */}
      <div className="mt-6 bg-gradient-to-r from-[#16181D] via-[#1a2438] to-[#022683] rounded-lg shadow-lg p-6 text-white border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in relative overflow-hidden group">
        <div className="absolute inset-0 animate-shimmer opacity-50"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-[rgba(136,136,136,0.3)] to-[rgba(2,38,131,0.5)] rounded-full flex items-center justify-center border border-[rgba(136,136,136,0.3)] transition-all duration-300 group-hover:scale-110 animate-glow-pulse">
            <Users className="w-8 h-8 text-[#888888]" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-[#E6E6E6]">Admin Profile</h3>
            <p className="text-[#888888]">
              {loading ? "Loading..." : admin?.email || "Not logged in"}
            </p>
            <p className="text-sm text-[#888888] mt-1">
              Last login:{" "}
              {admin?.lastLogin
                ? new Date(admin.lastLogin).toLocaleString()
                : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
