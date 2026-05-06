import React, { useState, useEffect } from 'react';
import { Eye, Save, Edit, Image as ImageIcon, Plus, Trash2, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function HomePageManager() {
  const [heroData, setHeroData] = useState({
    highlightNumber: "",
    highlightText: "",
    title: "",
    subtitle: "",
    description: "",
    imageUrl: "",
    enabled: false,
    stat3: "",
    presenceTitle: "",
    presenceSubtitle: "",
    mapImageUrl: "",
  });

  const [aboutData, setAboutData] = useState({
    title: "",
    description: "",
    stats: [
      { image: "", text: "" },
      { image: "", text: "" },
      { image: "", text: "" },
      { image: "", text: "" },
    ],
    enabled: false,
  });

  const availableIcons = [
    "Award", "MapPin", "Users", "Briefcase", "Clock", "Globe", "Building2", "ShieldCheck", "CheckCircle2", "Zap", "Star", "Heart", "Target", "TrendingUp"
  ];


  const [toast, setToast] = useState('');
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroMapImageFile, setHeroMapImageFile] = useState<File | null>(null);
  const [aboutImageFiles, setAboutImageFiles] = useState<(File | null)[]>([null, null, null, null]);

  // ─── Homepage Services ────────────────────────────────────────────────────────
  interface HomepageSvc { _id?: string; name: string; image: string; description: string; enabled: boolean; order: number; }
  const emptyHpSvc = (): HomepageSvc => ({ name: '', image: '', description: '', enabled: true, order: 0 });
  const [hpServices, setHpServices] = useState<HomepageSvc[]>([]);
  const [hpSvcForm, setHpSvcForm] = useState<HomepageSvc>(emptyHpSvc());
  const [hpSvcImageFile, setHpSvcImageFile] = useState<File | null>(null);
  const [hpSvcEditing, setHpSvcEditing] = useState<string | null>(null); // null = adding new
  const [hpSvcShowForm, setHpSvcShowForm] = useState(false);
  const [hpSvcLoading, setHpSvcLoading] = useState(false);
  const [hpSvcDeleteId, setHpSvcDeleteId] = useState<string | null>(null);
  const [hpSvcDeleting, setHpSvcDeleting] = useState(false);

  const saveHero = async () => {
    try {
      const formData = new FormData();

      formData.append("highlightNumber", heroData.highlightNumber);
      formData.append("highlightText", heroData.highlightText);
      formData.append("title", heroData.title);
      formData.append("subtitle", heroData.subtitle);
      formData.append("description", heroData.description);
      formData.append("enabled", String(heroData.enabled));
      formData.append("stat3", heroData.stat3);
      formData.append("presenceTitle", heroData.presenceTitle);
      formData.append("presenceSubtitle", heroData.presenceSubtitle);
      let saveImageUrl = heroData.imageUrl;
      if (saveImageUrl && saveImageUrl.startsWith("blob:")) {
        saveImageUrl = "";
      } else if (saveImageUrl && API_BASE_URL && saveImageUrl.startsWith(API_BASE_URL)) {
        saveImageUrl = saveImageUrl.replace(API_BASE_URL, "");
      }
      formData.append("imageUrl", saveImageUrl);

      let saveMapImageUrl = heroData.mapImageUrl;
      if (saveMapImageUrl && saveMapImageUrl.startsWith("blob:")) {
        saveMapImageUrl = "";
      } else if (saveMapImageUrl && API_BASE_URL && saveMapImageUrl.startsWith(API_BASE_URL)) {
        saveMapImageUrl = saveMapImageUrl.replace(API_BASE_URL, "");
      }
      formData.append("mapImageUrl", saveMapImageUrl);

      if (heroImageFile) {
        formData.append("image", heroImageFile);
      }
      if (heroMapImageFile) {
        formData.append("mapImage", heroMapImageFile);
      }

      const res = await fetch(`${API_BASE_URL}/api/hero`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error();

      setToast("Hero Section saved successfully!");
    } catch {
      setToast("Failed to save Hero Section");
    }

    setTimeout(() => setToast(""), 3000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setHeroImageFile(file);

    // Optional preview
    const previewUrl = URL.createObjectURL(file);
    setHeroData(prev => ({
      ...prev,
      imageUrl: previewUrl,
    }));
  };


  const handleMapImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setHeroMapImageFile(file);

    // Optional preview
    const previewUrl = URL.createObjectURL(file);
    setHeroData(prev => ({
      ...prev,
      mapImageUrl: previewUrl,
    }));
  };


  useEffect(() => {
    fetch(`${API_BASE_URL}/api/about`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data) {
          setAboutData({
            title: data.title ?? "",
            description: data.description ?? "",
            stats: data.stats?.length
              ? data.stats.map((s: any) => {
                const imgPath = s.image || s.icon || "";
                return {
                  image: imgPath ? (imgPath.startsWith('http') ? imgPath : `${API_BASE_URL}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`) : "",
                  text: s.text ?? ""
                };
              })
              : [
                { image: "", text: "" },
                { image: "", text: "" },
                { image: "", text: "" },
                { image: "", text: "" },
              ],
            enabled: data.enabled ?? false,
          });
        }
      });
  }, []);

  // ─── Homepage Services CRUD ────────────────────────────────────────────────
  const fetchHpServices = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/homepage-services`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) setHpServices(await res.json());
    } catch { /* ignore */ }
  };

  const saveHpService = async () => {
    setHpSvcLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', hpSvcForm.name);
      fd.append('description', hpSvcForm.description);
      fd.append('enabled', String(hpSvcForm.enabled));
      fd.append('order', String(hpSvcForm.order));
      if (hpSvcImageFile) {
        fd.append('image', hpSvcImageFile);
      } else if (hpSvcForm.image && !hpSvcForm.image.startsWith('blob:')) {
        let imgPath = hpSvcForm.image;
        if (API_BASE_URL && imgPath.startsWith(API_BASE_URL)) imgPath = imgPath.slice(API_BASE_URL.length).replace(/^\//, '');
        fd.append('image', imgPath);
      }
      const url = hpSvcEditing
        ? `${API_BASE_URL}/api/homepage-services/${hpSvcEditing}`
        : `${API_BASE_URL}/api/homepage-services`;
      const method = hpSvcEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: fd,
      });
      if (!res.ok) throw new Error();
      setToast(hpSvcEditing ? 'Service updated!' : 'Service added!');
      setHpSvcForm(emptyHpSvc());
      setHpSvcImageFile(null);
      setHpSvcEditing(null);
      setHpSvcShowForm(false);
      await fetchHpServices();
    } catch {
      setToast('Failed to save service');
    } finally {
      setHpSvcLoading(false);
      setTimeout(() => setToast(''), 3000);
    }
  };

  const deleteHpService = (id: string) => {
    setHpSvcDeleteId(id);
  };

  const confirmDeleteHpService = async () => {
    if (!hpSvcDeleteId) return;
    setHpSvcDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/homepage-services/${hpSvcDeleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error();
      setToast('Service deleted');
      await fetchHpServices();
    } catch {
      setToast('Failed to delete');
    } finally {
      setHpSvcDeleting(false);
      setHpSvcDeleteId(null);
      setTimeout(() => setToast(''), 3000);
    }
  };

  const startEditHpService = (svc: any) => {
    setHpSvcEditing(svc._id);
    setHpSvcForm({
      ...svc,
      image: svc.image
        ? svc.image.startsWith('http') ? svc.image : `${API_BASE_URL}/${svc.image}`
        : '',
    });
    setHpSvcImageFile(null);
    setHpSvcShowForm(true);
  };

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/hero`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },

        });

        if (!res.ok) return;

        const data = await res.json();

        setHeroData({
          highlightNumber: data.highlightNumber ?? "",
          highlightText: data.highlightText ?? "",
          title: data.title ?? "",
          subtitle: data.subtitle ?? "",
          description: data.description ?? "",
          imageUrl: data.imageUrl ? (data.imageUrl.startsWith('http') ? data.imageUrl : `${API_BASE_URL}${data.imageUrl.startsWith('/') ? '' : '/'}${data.imageUrl}`) : "",
          enabled: data.enabled ?? false,
          stat3: data.stat3 ?? "",
          presenceTitle: data.presenceTitle ?? "",
          presenceSubtitle: data.presenceSubtitle ?? "",
          mapImageUrl: data.mapImageUrl ? (data.mapImageUrl.startsWith('http') ? data.mapImageUrl : `${API_BASE_URL}${data.mapImageUrl.startsWith('/') ? '' : '/'}${data.mapImageUrl}`) : "",
        });
      } catch (err) {
        console.error("Hero load failed");
      }
    };

    fetchHero();
  }, []);

  useEffect(() => { fetchHpServices(); }, []);


  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("title", aboutData.title);
      formData.append("description", aboutData.description);
      formData.append("enabled", String(aboutData.enabled));

      // Send stats as JSON string
      // Strip blob: preview URLs — only keep real server paths (relative to root)
      formData.append("stats", JSON.stringify(aboutData.stats.map(s => {
        let saveImg = s.image || "";
        // If it's a blob preview, clear it (backend will fill it)
        if (saveImg.startsWith("blob:")) {
          saveImg = "";
        }
        // If it's a server URL, strip the base to keep it relative in DB
        else if (API_BASE_URL && saveImg.startsWith(API_BASE_URL)) {
          saveImg = saveImg.replace(API_BASE_URL, "");
        }
        return { image: saveImg, text: s.text || "" };
      })));

      // Append image files with indexed names
      aboutImageFiles.forEach((file, index) => {
        if (file) {
          formData.append(`stat_image_${index}`, file);
        }
      });

      const res = await fetch(`${API_BASE_URL}/api/about`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error();

      setToast("About Section saved successfully!");
      // Reset files after save
      setAboutImageFiles([null, null, null, null]);
    } catch (error) {
      setToast("Failed to save About Section");
    }

    setTimeout(() => setToast(""), 3000);
  };




  return (
    <div className="p-8 bg-gradient-to-br from-[#0F1115] via-[#0F1115] to-[#16181D] min-h-full">
      <div className="mb-15 flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Home Page Management</h1>
          <p className="text-[#888888]">Manage all sections of your home page</p>
        </div>
        {/* <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#888888] to-[#022683] text-white rounded-lg hover:from-[#022683] hover:to-[#888888] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(255,255,255,0.1)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Eye className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:scale-110" />
          <span className="relative z-10">Preview Website</span>
        </button> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Section */}
          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-[#888888] to-[#022683] rounded-full animate-pulse-slow"></span>
                Hero Section
              </h2>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={heroData.enabled}
                  onChange={(e) => setHeroData({ ...heroData, enabled: e.target.checked })}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-all duration-300 ${heroData.enabled ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-[rgba(136,136,136,0.3)]'} group-hover:shadow-lg`}>
                  <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-all duration-300 shadow-md ${heroData.enabled ? 'translate-x-5' : ''} group-hover:scale-110`}></div>
                </div>
                <span className="text-sm text-[#888888] transition-colors duration-300 group-hover:text-[#E6E6E6]">{heroData.enabled ? 'Enabled' : 'Disabled'}</span>
              </label>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    Highlight Number
                  </label>
                  <input
                    type="text"
                    value={heroData.highlightNumber}
                    onChange={(e) => setHeroData({ ...heroData, highlightNumber: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                  />
                </div>
                <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    Highlight Text
                  </label>
                  <input
                    type="text"
                    value={heroData.highlightText}
                    onChange={(e) => setHeroData({ ...heroData, highlightText: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                  />
                </div> */}

              </div>

              {/* <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Main Title
                </label>
                <input
                  type="text"
                  value={heroData.title}
                  onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                />
              </div> */}


              {/* <div className="animate-fade-in" style={{ animationDelay: '0.25s' }}>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={heroData.subtitle}
                  onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                />
              </div> */}

              <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Description
                </label>
                <textarea
                  value={heroData.description}
                  onChange={(e) => setHeroData({ ...heroData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                />
              </div>

              {/* Stats Section Fields */}
              <div className="grid grid-cols-1 gap-4 animate-fade-in" style={{ animationDelay: '0.35s' }}>
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-2">Statistic</label>
                  <input
                    type="text"
                    value={heroData.stat3}
                    onChange={(e) => setHeroData({ ...heroData, stat3: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6]"
                    placeholder="e.g. 1979 Established"
                  />
                </div>
              </div>

              {/* Presence Section Fields - Commented out for Map Image replacement */}
              {/* <div className="grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-2">Presence Title</label>
                  <input
                    type="text"
                    value={heroData.presenceTitle}
                    onChange={(e) => setHeroData({ ...heroData, presenceTitle: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6]"
                    placeholder="e.g. Our Pan-India Presence"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-2">Presence Subtitle</label>
                  <input
                    type="text"
                    value={heroData.presenceSubtitle}
                    onChange={(e) => setHeroData({ ...heroData, presenceSubtitle: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6]"
                    placeholder="e.g. 7 Strategic Locations..."
                  />
                </div>
              </div> */}



              <div className="animate-fade-in" style={{ animationDelay: "0.45s" }}>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Hero Image
                </label>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label
                      className="flex items-center gap-2 px-4 py-2 border border-[rgba(136,136,136,0.25)]
                  bg-[#0F1115] rounded-lg cursor-pointer
                  hover:border-[#888888] text-[#E6E6E6]
                  transition-all duration-300"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleImageUpload}
                      />
                    </label>

                    <div className="flex-1">
                      <input
                        type="text"
                        value={heroData.imageUrl && !heroData.imageUrl.startsWith('blob:') ? heroData.imageUrl : ''}
                        onChange={(e) => {
                          setHeroImageFile(null);
                          setHeroData({ ...heroData, imageUrl: e.target.value });
                        }}
                        placeholder="Or paste Image URL here..."
                        className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                      />
                    </div>
                  </div>

                  {heroData.imageUrl && (
                    <span className="text-sm text-green-500">
                      Image {heroData.imageUrl.startsWith('blob:') ? 'Selected' : 'Linked'} ✓
                    </span>
                  )}
                </div>

                <p className="text-[10px] text-[#888888] font-medium mt-2">Recommended size: 1920x375px for best display</p>

                {/* Preview 1 */}
                {heroData.imageUrl && (
                  <div className="mt-4">
                    <img
                      src={heroData.imageUrl}
                      alt="Hero Preview"
                      className="w-20 h-12 object-cover rounded-lg border border-[rgba(136,136,136,0.25)]"
                    />
                  </div>
                )}
              </div>


              {/* Map Image */}
              <div className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Map Image (Replacement for interactive map)
                </label>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label
                      className="flex items-center gap-2 px-4 py-2 border border-[rgba(136,136,136,0.25)]
                  bg-[#0F1115] rounded-lg cursor-pointer
                  hover:border-[#888888] text-[#E6E6E6]
                  transition-all duration-300"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Upload Map Image
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleMapImageUpload}
                      />
                    </label>

                    <div className="flex-1">
                      <input
                        type="text"
                        value={heroData.mapImageUrl && !heroData.mapImageUrl.startsWith('blob:') ? heroData.mapImageUrl : ''}
                        onChange={(e) => {
                          setHeroMapImageFile(null);
                          setHeroData({ ...heroData, mapImageUrl: e.target.value });
                        }}
                        placeholder="Or paste Map Image URL here..."
                        className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                      />
                    </div>
                  </div>

                  {heroData.mapImageUrl && (
                    <span className="text-sm text-green-500">
                      Map Image {heroData.mapImageUrl.startsWith('blob:') ? 'Selected' : 'Linked'} ✓
                    </span>
                  )}
                </div>

                {/* Map Image Preview */}
                {heroData.mapImageUrl && (
                  <div className="mt-4">
                    <img
                      src={heroData.mapImageUrl}
                      alt="Map Image Preview"
                      className="w-40 h-24 object-contain rounded-lg border border-[rgba(136,136,136,0.25)]"
                    />
                  </div>
                )}
              </div>


              <button
                onClick={saveHero}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 relative overflow-hidden group animate-fade-in"
                style={{ animationDelay: '0.55s' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[rgba(136,136,136,0.2)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Save className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:rotate-12" />
                <span className="relative z-10">Save Hero Section</span>
              </button>
            </div>
          </div>

          {/* About/Experience Section */}
          {<div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-[#888888] to-[#022683] rounded-full animate-pulse-slow"></span>
                About / Experience Section
              </h2>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={aboutData.enabled}
                  onChange={(e) => setAboutData({ ...aboutData, enabled: e.target.checked })}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-all duration-300 ${aboutData.enabled ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-[rgba(136,136,136,0.3)]'} group-hover:shadow-lg`}>
                  <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-all duration-300 shadow-md ${aboutData.enabled ? 'translate-x-5' : ''} group-hover:scale-110`}></div>
                </div>
                <span className="text-sm text-[#888888] transition-colors duration-300 group-hover:text-[#E6E6E6]">{aboutData.enabled ? 'Enabled' : 'Disabled'}</span>
              </label>
            </div>

            <div className="space-y-4">
              {/* <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Section Title
                </label>
                <input
                  type="text"
                  value={aboutData.title}
                  onChange={(e) => setAboutData({ ...aboutData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                />
              </div> */}

              {/* <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Description
                </label>
                <textarea
                  value={aboutData.description}
                  onChange={(e) => setAboutData({ ...aboutData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                />
              </div> */}

              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <label className="block text-sm font-medium text-[#888888] mb-4">
                  Statistics
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {aboutData.stats?.map((stat, index) => (
                    <div key={index} className="p-4 border border-[rgba(136,136,136,0.25)] bg-[#0F1115] rounded-lg transition-all duration-300 hover:border-[#888888] hover-card-lift animate-fade-in" style={{ animationDelay: `${0.25 + index * 0.05}s` }}>
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="relative group/img w-full aspect-video bg-[#16181D] rounded-lg border border-dashed border-[rgba(136,136,136,0.25)] flex items-center justify-center overflow-hidden">
                          {stat.image ? (
                            <img src={stat.image} alt={`Image ${index + 1}`} className="w-full h-full object-contain" />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-[#888888]" />
                          )}
                          <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                            <div className="flex flex-col items-center gap-2">
                              <Edit className="w-6 h-6 text-white" />
                              <span className="text-white text-xs font-medium">Change Image</span>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const newFiles = [...aboutImageFiles];
                                  newFiles[index] = file;
                                  setAboutImageFiles(newFiles);

                                  // Preview locally
                                  const newStats = [...aboutData.stats];
                                  newStats[index].image = URL.createObjectURL(file);
                                  // Preserve existing text for this stat
                                  newStats[index].text = newStats[index].text || "";
                                  setAboutData({ ...aboutData, stats: newStats });
                                }
                              }}
                            />
                          </label>
                        </div>
                        <div className="text-[#888888] text-xs font-medium uppercase tracking-wider">
                          Image {index + 1}
                        </div>
                        <input
                          type="text"
                          value={stat.text}
                          onChange={(e) => {
                            const newStats = [...aboutData.stats];
                            newStats[index].text = e.target.value;
                            setAboutData({ ...aboutData, stats: newStats });
                          }}
                          className="w-full px-3 py-1.5 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] text-sm"
                          placeholder={`Stat ${index + 1} Text`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 relative overflow-hidden group animate-fade-in"
                style={{ animationDelay: '0.5s' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[rgba(136,136,136,0.2)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Save className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:rotate-12" />
                <span className="relative z-10">Save About Section</span>
              </button>
            </div>
          </div>}

          {/* ─── Homepage Services Section ─────────────────────────────────── */}
          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-[#888888] to-[#022683] rounded-full animate-pulse-slow"></span>
                Homepage Services Section
              </h2>
              <button
                onClick={() => { setHpSvcShowForm(!hpSvcShowForm); setHpSvcEditing(null); setHpSvcForm(emptyHpSvc()); setHpSvcImageFile(null); }}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white text-sm rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                Add Service
              </button>
            </div>

            {/* Add/Edit Form */}
            {hpSvcShowForm && (
              <div className="mb-6 p-5 bg-[#0F1115] rounded-xl border border-[rgba(136,136,136,0.25)] space-y-4">
                <h3 className="text-white font-semibold text-sm">{hpSvcEditing ? 'Edit Service' : 'New Service'}</h3>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-1">Service Name *</label>
                  <input
                    type="text"
                    value={hpSvcForm.name}
                    onChange={e => setHpSvcForm({ ...hpSvcForm, name: e.target.value })}
                    placeholder="e.g. Tax Audit"
                    className="w-full px-4 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={hpSvcForm.description}
                    onChange={e => setHpSvcForm({ ...hpSvcForm, description: e.target.value })}
                    placeholder="Brief description of this service..."
                    className="w-full px-4 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888] resize-none"
                  />
                </div>

                {/* Image */}
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-1">Service Image</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-2 border border-[rgba(136,136,136,0.25)] bg-[#16181D] rounded-lg cursor-pointer hover:border-[#888888] text-[#E6E6E6] transition-all duration-300 text-sm">
                      <ImageIcon className="w-4 h-4" />
                      Upload
                      <input type="file" accept="image/*" hidden onChange={e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setHpSvcImageFile(file);
                        setHpSvcForm(prev => ({ ...prev, image: URL.createObjectURL(file) }));
                      }} />
                    </label>
                    <input
                      type="text"
                      value={hpSvcForm.image && !hpSvcForm.image.startsWith('blob:') ? hpSvcForm.image : ''}
                      onChange={e => { setHpSvcImageFile(null); setHpSvcForm({ ...hpSvcForm, image: e.target.value }); }}
                      placeholder="Or paste image URL..."
                      className="flex-1 px-4 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] outline-none text-[#E6E6E6] text-sm transition-all duration-300 hover:border-[#888888]"
                    />
                  </div>
                  {hpSvcForm.image && (
                    <div className="mt-3 flex items-center gap-3">
                      <img src={hpSvcForm.image} alt="preview" className="w-24 h-16 object-cover rounded-lg border border-[rgba(136,136,136,0.25)]" />
                      <span className="text-xs text-green-400">Image {hpSvcForm.image.startsWith('blob:') ? 'selected' : 'linked'} ✓</span>
                    </div>
                  )}
                </div>

                {/* Order + Enabled */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-[#888888] mb-1">Order</label>
                    <input
                      type="number"
                      value={hpSvcForm.order}
                      onChange={e => setHpSvcForm({ ...hpSvcForm, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] outline-none text-[#E6E6E6] text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={hpSvcForm.enabled} onChange={e => setHpSvcForm({ ...hpSvcForm, enabled: e.target.checked })} className="sr-only" />
                      <div className={`w-10 h-5 rounded-full transition-all duration-300 ${hpSvcForm.enabled ? 'bg-green-500' : 'bg-[rgba(136,136,136,0.3)]'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-all duration-300 ${hpSvcForm.enabled ? 'translate-x-5' : ''}`}></div>
                      </div>
                      <span className="text-sm text-[#888888]">{hpSvcForm.enabled ? 'Enabled' : 'Disabled'}</span>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={saveHpService}
                    disabled={hpSvcLoading || !hpSvcForm.name.trim()}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <Save className="w-5 h-5" />
                    {hpSvcLoading ? 'Saving...' : hpSvcEditing ? 'Update Service' : 'Add Service'}
                  </button>
                  <button
                    onClick={() => { setHpSvcShowForm(false); setHpSvcEditing(null); setHpSvcForm(emptyHpSvc()); setHpSvcImageFile(null); }}
                    className="flex items-center gap-2 px-4 py-2 bg-[rgba(136,136,136,0.15)] text-[#888888] rounded-lg hover:bg-[rgba(136,136,136,0.25)] transition-all duration-300 text-sm"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Services List */}
            {hpServices.length === 0 ? (
              <div className="text-center py-10 text-[#888888] text-sm">
                <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No homepage services added yet. Click "Add Service" to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {hpServices.map((svc, idx) => (
                  <div key={svc._id} className="flex items-center gap-4 p-4 bg-[#0F1115] rounded-xl border border-[rgba(136,136,136,0.25)] hover:border-[#888888] transition-all duration-300 group">
                    {/* Image */}
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#16181D] flex-shrink-0 flex items-center justify-center border border-[rgba(136,136,136,0.15)]">
                      {svc.image ? (
                        <img
                          src={svc.image.startsWith('http') ? svc.image : `${API_BASE_URL}/${svc.image}`}
                          alt={svc.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-[#888888]" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[#E6E6E6] font-semibold text-sm truncate">{svc.name}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${svc.enabled ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                          {svc.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      {svc.description && (
                        <p className="text-[#888888] text-xs mt-1 line-clamp-1">{svc.description}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEditHpService(svc)}
                        className="p-2 text-[#888888] hover:text-[#E6E6E6] hover:bg-[#16181D] rounded-lg transition-all duration-200"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteHpService(svc._id!)}
                        className="p-2 text-[#888888] hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-200"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] sticky top-8 hover-card-lift animate-fade-in">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#888888]" />
              Live Preview
            </h3>

            {/* Hero Preview */}
            {heroData.enabled && (
              <div className="mb-6 p-4 bg-gradient-to-r from-[#888888] to-[#022683] rounded-lg text-white shadow-lg animate-fade-in transition-all duration-300 hover:scale-105">
                {/* Images Preview in place of text */}
                <div className="flex gap-4 mb-4 overflow-hidden">
                  {heroData.imageUrl && (
                    <div className="flex-1 bg-white/10 rounded-lg p-2 border border-white/20">
                      <img src={heroData.imageUrl} alt="Primary" className="w-full h-24 object-contain rounded" />
                      <p className="text-[10px] text-center mt-1 opacity-60">Primary</p>
                    </div>
                  )}
                </div>

                {/* <div className="text-2xl font-bold mb-2 animate-bounce-subtle">
                  {heroData.highlightNumber} {heroData.highlightText}
                </div>
                <h2 className="text-lg font-bold mb-1">{heroData.title}</h2> */}

                {/* <p className="text-sm text-white/80 mb-2">{heroData.subtitle}</p> */}
                <p className="text-xs text-white/70 mb-3">{heroData.description}</p>

                {/* Stats Preview */}
                <div className="grid grid-cols-1 gap-2 mb-3 text-[10px] text-center bg-black/20 p-2 rounded">
                  <div>{heroData.stat3}</div>
                </div>

                {/* Presence Preview - Commented out for Map Image */}
                {/* <div className="mb-3 border-t border-white/20 pt-2">
                  <div className="text-xs font-bold">{heroData.presenceTitle}</div>
                  <div className="text-[10px] text-white/60">{heroData.presenceSubtitle}</div>
                </div> */}

                {/* Map Image Preview */}
                {heroData.mapImageUrl && (
                  <div className="mb-3 border-t border-white/20 pt-2">
                    <p className="text-[10px] uppercase font-bold text-white/40 mb-1">Map Image</p>
                    <img src={heroData.mapImageUrl} alt="Map" className="w-full h-20 object-contain rounded bg-black/20" />
                  </div>
                )}




              </div>
            )}

            {/* About Preview */}
            {aboutData.enabled && (
              <div className="p-4 bg-[#0F1115] rounded-lg border border-[rgba(136,136,136,0.25)] animate-fade-in transition-all duration-300 hover:border-[#888888]">
                <h3 className="font-bold text-white mb-2">{aboutData.title}</h3>
                <p className="text-sm text-[#888888] mb-3">{aboutData.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  {aboutData.stats?.map((stat, index) => (
                    <div key={index} className="text-center p-2 bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded border border-[rgba(136,136,136,0.25)] transition-all duration-300 hover:scale-105 hover-card-lift aspect-video flex flex-col items-center justify-center">
                      {stat.image ? (
                        <img src={stat.image} alt="icon" className="max-w-full max-h-full object-contain opacity-80" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-[#888888] opacity-50" />
                      )}
                      {stat.text && (
                        <p className="mt-1 text-xs text-[#E6E6E6] text-center">{stat.text}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {hpSvcDeleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-2">
          <div className="bg-[#16181D] border border-red-500/20 shadow-2xl rounded-2xl p-4 w-full max-w-md animate-scale-in">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-6 h-6 bg-red-500/10 rounded-xl flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Delete Service?</h3>
                <p className="text-sm text-[#888888]">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-[#E6E6E6] mb-8 leading-relaxed">
              Are you sure you want to remove this service from the homepage? This will permanently delete the entry.
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setHpSvcDeleteId(null)}
                disabled={hpSvcDeleting}
                className="px-6 py-2.5 rounded-xl text-[#888888] hover:text-white transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteHpService}
                disabled={hpSvcDeleting}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-lg shadow-red-600/20 font-bold flex items-center gap-2"
              >
                {hpSvcDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                {hpSvcDeleting ? 'Deleting...' : 'Delete Service'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 right-8 bg-gradient-to-r from-[#888888] to-[#022683] text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in border border-[rgba(255,255,255,0.2)] animate-glow-pulse">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
