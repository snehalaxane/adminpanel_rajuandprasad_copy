import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Image as ImageIcon, GripVertical, Filter, Upload, X } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface GalleryImage {
  _id?: string;
  url: string;
  title: string;
  category: string;
  year: string;
  enabled: boolean;
  order: number;
}

const resolveImageUrl = (url: string | undefined) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API_BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
};


export default function GalleryManager() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterYear, setFilterYear] = useState('All');
  const [toast, setToast] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [intro, setIntro] = useState({ heading: '', subheading: '', backgroundImage: '' });
  const [isSavingIntro, setIsSavingIntro] = useState(false);
  const introFileInputRef = React.useRef<HTMLInputElement>(null);


  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingYear, setIsAddingYear] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [customYear, setCustomYear] = useState('');


  const [newImageForm, setNewImageForm] = useState({
    title: '',
    category: 'Annual Seminar',
    year: new Date().getFullYear().toString(),
    enabled: true
  });

  const [categories, setCategories] = useState(['Annual Seminar', 'Fun @ Work']);
  const [years, setYears] = useState(['2026', '2025', '2024', '2023']);

  useEffect(() => {
    fetchImages();
    fetchIntro();
  }, []);

  useEffect(() => {
    const uniqueCategories = Array.from(new Set([...categories, ...images.map(img => img.category)]));
    const uniqueYears = Array.from(new Set([...years, ...images.map(img => img.year)]));
    setCategories(uniqueCategories.sort());
    setYears(uniqueYears.sort((a, b) => b.localeCompare(a)));
  }, [images]);

  const fetchIntro = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/gallery/intro`);
      setIntro({
        heading: response.data.heading || '',
        subheading: response.data.subheading || '',
        backgroundImage: response.data.backgroundImage || ''
      });

    } catch (err) {
      console.error('Error fetching intro:', err);
    }
  };

  const handleSaveIntro = async () => {
    setIsSavingIntro(true);
    try {
      await axios.put(`${API_BASE_URL}/api/gallery/intro`, intro);
      setToast('Gallery header updated!');
    } catch (err) {
      setToast('Error updating header');
    } finally {
      setIsSavingIntro(false);
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleHeaderFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIntro(prev => ({ ...prev, backgroundImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchImages = async () => {

    try {
      const response = await axios.get(`${API_BASE_URL}/api/gallery`);
      setImages(response.data);
    } catch (err) {
      console.error('Error fetching gallery:', err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setToast('File size must be less than 5MB');
        setTimeout(() => setToast(''), 3000);
        return;
      }

      // Check dimensions
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        if (img.width !== 370 || img.height !== 264) {
          setToast(`Notice: Image is ${img.width}x${img.height}. Recommended is 370x264 for best fit.`);
          setTimeout(() => setToast(''), 4000);
        }
        setUploadingFile(file);
      };
    }
  };

  const handleCreateImage = async () => {
    if (!uploadingFile && !newImageForm.title) {
      setToast('Please provide a title and select an image');
      setTimeout(() => setToast(''), 3000);
      return;
    }

    const data = new FormData();
    data.append('title', newImageForm.title);
    data.append('category', newImageForm.category);
    data.append('year', newImageForm.year);
    data.append('enabled', String(newImageForm.enabled));
    if (uploadingFile) {
      data.append('image', uploadingFile);
    }

    try {
      await axios.post(`${API_BASE_URL}/api/gallery`, data);
      setToast('Image uploaded successfully!');
      fetchImages();
      setShowUploadModal(false);
      setUploadingFile(null);
      setNewImageForm({
        title: '',
        category: 'Annual Seminar',
        year: new Date().getFullYear().toString(),
        enabled: true
      });
    } catch (err: any) {
      setToast(err.response?.data?.message || 'Error uploading image');
    }
    setTimeout(() => setToast(''), 3000);
  };

  const handleSaveAll = async () => {
    setToast('Saving all changes...');
    try {
      // In this specific UI, edits are per-item in the grid.
      // We'll update the logic to handle per-item updates.
      setToast('Gallery changes synced!');
    } catch (err) {
      setToast('Error saving changes');
    }
    setTimeout(() => setToast(''), 3000);
  };

  const handleUpdateImage = async (id: string, updates: Partial<GalleryImage>) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/gallery/${id}`, updates);
      setImages(images.map(img => img._id === id ? response.data : img));
    } catch (err) {
      setToast('Error updating image');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };
  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      await axios.delete(`${API_BASE_URL}/api/gallery/${deleteId}`);
      setImages(images.filter(img => img._id !== deleteId));
      setToast('Image deleted successfully!');
    } catch (err) {
      setToast('Error deleting image');
    } finally {
      setDeleting(false);
      setDeleteId(null);
      setTimeout(() => setToast(''), 3000);
    }
  };


  const filteredImages = images.filter(img => {
    const categoryMatch = filterCategory === 'All' || img.category === filterCategory;
    const yearMatch = filterYear === 'All' || img.year === filterYear;
    return categoryMatch && yearMatch;
  });

  return (
    <div className="p-8 bg-gradient-to-br from-[#0F1115] via-[#0F1115] to-[#16181D] min-h-full">
      <div className="mb-8 flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gallery Management</h1>
          <p className="text-[#888888]">Manage photo albums and gallery images</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(136,136,136,0.2)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Plus className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:rotate-90" />
          <span className="relative z-10">Upload Images</span>
        </button>
      </div>

      {/* Page Content Settings */}
      <div className="mb-8 bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] animate-fade-in transition-all duration-300">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Filter className="w-5 h-5 text-[#022683]" />
          Page Header Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#888888]">Gallery Title</label>
            <input
              type="text"
              value={intro.heading}
              onChange={(e) => setIntro({ ...intro, heading: e.target.value })}
              className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300"
              placeholder="E.g., Our Gallery"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#888888]">Gallery Subtitle</label>
            <input
              type="text"
              value={intro.subheading}
              onChange={(e) => setIntro({ ...intro, subheading: e.target.value })}
              className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300"
              placeholder="E.g., Capturing moments from our legacy..."
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#888888] mb-2">Background Image</label>
            <div className="flex gap-4 items-start">
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={intro.backgroundImage.startsWith('data:') ? 'Local Image Selected' : intro.backgroundImage}
                    onChange={(e) => setIntro({ ...intro, backgroundImage: e.target.value })}
                    readOnly={intro.backgroundImage.startsWith('data:')}
                    className="flex-1 px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-[#E6E6E6] focus:ring-2 focus:ring-[#022683] outline-none"
                    placeholder="Enter Image URL or upload..."
                  />
                  <input
                    type="file"
                    ref={introFileInputRef}
                    onChange={handleHeaderFileSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => introFileInputRef.current?.click()}
                    className="px-4 py-2 bg-[rgba(136,136,136,0.1)] text-white rounded-lg hover:bg-[rgba(136,136,136,0.2)] transition-colors flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload
                  </button>
                  {intro.backgroundImage && (
                    <button
                      onClick={() => setIntro({ ...intro, backgroundImage: '' })}
                      className="px-4 py-2 bg-red-900/30 text-red-500 border border-red-500/30 rounded-lg hover:bg-red-900/50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-[#888888] font-medium">Recommended size: 1920x375px for best display</p>
              </div>
              {intro.backgroundImage && (
                <div className="w-20 h-12 rounded-lg overflow-hidden border border-[rgba(136,136,136,0.25)] bg-[#0F1115] flex-shrink-0">
                  <img
                    src={resolveImageUrl(intro.backgroundImage)}
                    alt="Header Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveIntro}
            disabled={isSavingIntro}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300 shadow-lg"
          >
            <Save className="w-4 h-4" />
            {isSavingIntro ? 'Saving...' : 'Update Header'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-[#888888]" />
          <div className="flex gap-4 flex-1">
            <div>
              <label className="block text-sm font-medium text-[#888888] mb-2">
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
              >
                {['All', ...categories].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#888888] mb-2">
                Year
              </label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
              >
                {['All', ...years].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="text-sm text-[#888888]">
            Showing {filteredImages.length} of {images.length} images
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Images Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-3 gap-4">
            {filteredImages.map((image, index) => (
              <div
                key={image._id}
                className="bg-[#16181D] rounded-lg shadow-lg overflow-hidden group border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in transition-all duration-300"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="relative">
                  <img
                    src={
                      image.url.startsWith('http')
                        ? image.url
                        : `${API_BASE_URL.replace(/\/$/, '')}/${image.url.replace(/^\//, '')}`
                    }
                    alt={image.title}
                    // Add an onError to catch broken links during debugging
                    onError={(e) => { e.currentTarget.src = "https://placehold.co/400?text=Image+Not+Found"; }}
                    className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleUpdateImage(image._id!, { enabled: !image.enabled })}
                      className={`flex items-center gap-1 cursor-pointer rounded px-2 py-1 ${image.enabled ? 'bg-green-500/80 text-white backdrop-blur-sm' : 'bg-gray-800/80 text-gray-400 backdrop-blur-sm'}`}
                    >
                      <div className={`w-8 h-4 rounded-full relative transition-colors ${image.enabled ? 'bg-green-400' : 'bg-gray-600'}`}>
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${image.enabled ? 'right-0.5' : 'left-0.5'}`}></div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDelete(image._id!)}
                      className="p-1.5 bg-red-500/80 text-white rounded hover:bg-red-600 backdrop-blur-sm transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-[#16181D]">
                  {/* <input
                    type="text"
                    value={image.title}
                    onChange={(e) => handleUpdateImage(image._id!, { title: e.target.value })}
                    className="w-full px-2 py-1 mb-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded text-sm focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                    placeholder="Image title"
                  /> */}
                  <div className="flex gap-2">
                    <select
                      value={image.category}
                      onChange={(e) => handleUpdateImage(image._id!, { category: e.target.value })}
                      className="flex-1 px-2 py-1 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded text-xs focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#888888] transition-all duration-300 hover:border-[#888888]"
                    >
                      {categories.filter(c => c !== 'All').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <select
                      value={image.year}
                      onChange={(e) => handleUpdateImage(image._id!, { year: e.target.value })}
                      className="px-2 py-1 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded text-xs focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#888888] transition-all duration-300 hover:border-[#888888]"
                    >
                      {years.filter(y => y !== 'All').map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Card */}
            <div
              onClick={() => setShowUploadModal(true)}
              className="bg-[#0F1115] border-2 border-dashed border-[rgba(136,136,136,0.25)] rounded-lg aspect-square flex items-center justify-center hover:border-[#022683] hover:bg-[#022683]/5 transition-all duration-300 cursor-pointer group animate-fade-in"
            >
              <div className="text-center group-hover:scale-105 transition-transform duration-300">
                <ImageIcon className="w-12 h-12 text-[#888888] mx-auto mb-2 group-hover:text-[#022683] transition-colors" />
                <p className="text-sm text-[#888888] group-hover:text-[#E6E6E6] transition-colors">Upload Image</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="lg:col-span-1">
          <div className="bg-[#16181D] rounded-lg shadow-lg p-6 sticky top-8 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in">
            <h3 className="font-bold text-[#E6E6E6] mb-4 text-lg">Gallery Stats</h3>

            <div className="space-y-4">
              <div className="p-4 bg-[rgba(2,38,131,0.1)] rounded-lg border border-[rgba(2,38,131,0.2)]">
                <div className="text-3xl font-bold text-[#022683]">{images.length}</div>
                <div className="text-sm text-[#022683] font-medium">Total Images</div>
              </div>

              <div className="p-4 bg-[rgba(22,101,52,0.1)] rounded-lg border border-[rgba(22,101,52,0.2)]">
                <div className="text-3xl font-bold text-green-500">
                  {images.filter(i => i.enabled).length}
                </div>
                <div className="text-sm text-green-500 font-medium">Active Images</div>
              </div>

              <div className="pt-6 border-t border-[rgba(136,136,136,0.25)]">
                <h4 className="font-bold text-[#E6E6E6] mb-3 text-sm uppercase tracking-wider">By Category</h4>
                <div className="space-y-3">
                  {categories.filter(c => c !== 'All').map(cat => (
                    <div key={cat} className="flex justify-between items-center text-sm">
                      <span className="text-[#888888]">{cat}</span>
                      <span className="bg-[#0F1115] text-[#E6E6E6] px-2 py-0.5 rounded-full font-bold min-w-[30px] text-center border border-[rgba(136,136,136,0.25)]">
                        {images.filter(i => i.category === cat).length}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-[rgba(136,136,136,0.25)]">
                <h4 className="font-bold text-[#E6E6E6] mb-3 text-sm uppercase tracking-wider">By Year</h4>
                <div className="space-y-3">
                  {years.filter(y => y !== 'All').map(year => (
                    <div key={year} className="flex justify-between items-center text-sm">
                      <span className="text-[#888888]">{year}</span>
                      <span className="bg-[#0F1115] text-[#E6E6E6] px-2 py-0.5 rounded-full font-bold min-w-[30px] text-center border border-[rgba(136,136,136,0.25)]">
                        {images.filter(i => i.year === year).length}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSaveAll}
          className="flex items-center gap-2 px-8 py-3 bg-[#022683] text-white rounded-lg hover:bg-[#033aa0] shadow-lg transition-all active:scale-95 font-bold"
        >
          <Save className="w-5 h-5" />
          Sync All Changes
        </button>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#16181D] rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-[rgba(136,136,136,0.25)] animate-scale-in">
            <div className="p-6 border-b border-[rgba(136,136,136,0.25)] flex justify-between items-center bg-gradient-to-r from-[#16181D] to-[#1a1d24]">
              <h2 className="text-xl font-bold text-[#E6E6E6]">Upload to Gallery</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 hover:bg-[rgba(136,136,136,0.1)] rounded-full transition-colors"
                title="Close"
              >
                <X className="w-6 h-6 text-[#888888]" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="border-2 border-dashed border-[rgba(136,136,136,0.25)] rounded-lg p-8 text-center bg-[#0F1115] hover:border-[#022683] transition-colors">
                <Upload className="w-10 h-10 text-[#022683]/50 mx-auto mb-3" />
                <input
                  type="file"
                  id="gallery-file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*"
                />
                <label
                  htmlFor="gallery-file"
                  className="px-4 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg text-sm font-bold text-[#E6E6E6] cursor-pointer shadow-sm hover:border-[#022683] transition-colors"
                >
                  {uploadingFile ? 'Change Image' : 'Select Image'}
                </label>
                {uploadingFile ? (
                  <p className="mt-4 text-sm text-green-400 font-medium flex items-center justify-center gap-1">
                    <ImageIcon className="w-4 h-4" /> {uploadingFile.name}
                  </p>
                ) : (
                  <p className="text-xs text-[#888888] mt-2">Max 5MB | Recommended: 370x264</p>
                )}
              </div>



              <div>
                <label className="block text-sm font-bold text-[#888888] mb-1">Category</label>
                {!isAddingCategory ? (
                  <div className="flex gap-2">
                    <select
                      value={newImageForm.category}
                      onChange={(e) => {
                        if (e.target.value === 'ADD_NEW') {
                          setIsAddingCategory(true);
                        } else {
                          setNewImageForm({ ...newImageForm, category: e.target.value });
                        }
                      }}
                      className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="ADD_NEW">+ Add New Category</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex gap-2 animate-scale-in">
                    <input
                      type="text"
                      autoFocus
                      value={customCategory}
                      onChange={(e) => {
                        setCustomCategory(e.target.value);
                        setNewImageForm({ ...newImageForm, category: e.target.value });
                      }}
                      className="w-full px-4 py-2 bg-[#0F1115] border border-[#022683] rounded-lg outline-none text-[#E6E6E6] transition-all duration-300 shadow-[0_0_10px_rgba(2,38,131,0.2)]"
                      placeholder="New category name"
                    />
                    <button
                      onClick={() => {
                        setIsAddingCategory(false);
                        setCustomCategory('');
                        setNewImageForm({ ...newImageForm, category: categories[0] });
                      }}
                      className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-[#888888] mb-1">Year</label>
                {!isAddingYear ? (
                  <div className="flex gap-2">
                    <select
                      value={newImageForm.year}
                      onChange={(e) => {
                        if (e.target.value === 'ADD_NEW') {
                          setIsAddingYear(true);
                        } else {
                          setNewImageForm({ ...newImageForm, year: e.target.value });
                        }
                      }}
                      className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                    >
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                      <option value="ADD_NEW">+ Add New Year</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex gap-2 animate-scale-in">
                    <input
                      type="text"
                      autoFocus
                      value={customYear}
                      onChange={(e) => {
                        setCustomYear(e.target.value);
                        setNewImageForm({ ...newImageForm, year: e.target.value });
                      }}
                      className="w-full px-4 py-2 bg-[#0F1115] border border-[#022683] rounded-lg outline-none text-[#E6E6E6] transition-all duration-300 shadow-[0_0_10px_rgba(2,38,131,0.2)]"
                      placeholder="New year"
                    />
                    <button
                      onClick={() => {
                        setIsAddingYear(false);
                        setCustomYear('');
                        setNewImageForm({ ...newImageForm, year: years[0] });
                      }}
                      className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-[#0F1115] flex gap-3 border-t border-[rgba(136,136,136,0.25)]">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-2 bg-[rgba(136,136,136,0.1)] border border-[rgba(136,136,136,0.25)] text-[#888888] rounded-lg font-bold hover:bg-[rgba(136,136,136,0.2)] hover:text-[#E6E6E6] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateImage}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg font-bold hover:from-[#033aa0] hover:to-[#022683] shadow-md transition-all active:scale-95"
              >
                Upload Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-8 right-8 bg-gray-900/90 backdrop-blur text-white px-6 py-4 rounded-xl shadow-2xl z-[100] animate-fade-in flex items-center gap-3 border border-white/10">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="font-medium">{toast}</span>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] 
      border border-red-500/30 
      shadow-2xl 
      rounded-xl 
      p-8 
      w-full 
      max-w-md 
      animate-scale-in">

            <h3 className="text-lg font-semibold text-white mb-3">
              Delete this image?
            </h3>

            <p className="text-sm text-[#888888] mb-6">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-[rgba(136,136,136,0.2)] text-white hover:bg-[rgba(136,136,136,0.3)] transition-all"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
