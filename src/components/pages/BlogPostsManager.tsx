import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Save, Eye, X, Calendar, Tag, Upload, Search, Filter, Image as ImageIcon, Loader2 } from 'lucide-react';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const resolveImageUrl = (url: string | undefined) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API_BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
};

interface BlogPost {
  _id?: string;
  title: string;
  shortDescription: string;
  publishDate: string;
  category: string;
  tags: string[];
  content: string;
  featuredImage: string;
  enabled: boolean;
  author: string;
}

export default function BlogPostsManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [toast, setToast] = useState('');
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);


  const [headerData, setHeaderData] = useState({ title: '', subtitle: '', backgroundImage: '' });
  const [savingHeader, setSavingHeader] = useState(false);
  const introFileInputRef = React.useRef<HTMLInputElement>(null);



  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    publishDate: new Date().toISOString().split('T')[0],
    category: '',
    tags: [] as string[],
    content: '',
    featuredImage: '',
    enabled: true,
    author: ''
  });

  const [categories, setCategories] = useState(['Income Tax', 'Compliance', 'SEBI', 'RBI', 'GST', 'Corporate Law', 'Audit', 'Finance']);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    fetchPosts();
    fetchHeader();
  }, []);

  const fetchHeader = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/blog-intro`);
      setHeaderData({
        title: res.data.title,
        subtitle: res.data.subtitle,
        backgroundImage: res.data.backgroundImage || ''
      });
    } catch (err) {
      console.error("Error fetching header:", err);
    }
  };

  const handleHeaderFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeaderData(prev => ({ ...prev, backgroundImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };


  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/blogs`);
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching blog posts:", err);
    }
  };

  const handleAddNew = () => {
    setEditingPost(null);
    setUploadingFile(null);
    setFormData({
      title: '',
      shortDescription: '',
      publishDate: new Date().toISOString().split('T')[0],
      category: '',
      tags: [],
      content: '',
      featuredImage: '',
      enabled: true,
      author: ''
    });
    setShowModal(true);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setUploadingFile(null);
    setFormData({
      title: post.title,
      shortDescription: post.shortDescription,
      publishDate: new Date(post.publishDate).toISOString().split('T')[0],
      category: post.category,
      tags: [...post.tags],
      content: post.content,
      featuredImage: post.featuredImage,
      enabled: post.enabled,
      author: post.author
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.shortDescription || !formData.category) {
      setToast('Please fill in all required fields');
      setTimeout(() => setToast(''), 3000);
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('shortDescription', formData.shortDescription);
    data.append('publishDate', formData.publishDate);
    data.append('category', formData.category);
    data.append('tags', JSON.stringify(formData.tags));
    data.append('content', formData.content);
    data.append('enabled', String(formData.enabled));
    data.append('author', formData.author);

    if (uploadingFile) {
      data.append('featuredImage', uploadingFile);
    } else if (formData.featuredImage) {
      data.append('featuredImage', formData.featuredImage);
    }

    console.log('Sending FormData entries:');
    for (var pair of (data as any).entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    try {
      if (editingPost) {
        await axios.put(`${API_BASE_URL}/api/blogs/${editingPost._id}`, data);
        setToast('Blog post updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/api/blogs`, data);
        setToast('Blog post created successfully!');
      }
      fetchPosts();
      setShowModal(false);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error saving blog post';
      setToast(errorMessage);
    }
    setTimeout(() => setToast(''), 3000);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };
  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      await axios.delete(`${API_BASE_URL}/api/blogs/${deleteId}`);
      setPosts(posts.filter(p => p._id !== deleteId));
      setToast('Blog post deleted successfully!');
    } catch (err) {
      setToast('Error deleting blog post');
    } finally {
      setDeleting(false);
      setDeleteId(null);
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleUpdateHeader = async () => {
    try {
      setSavingHeader(true);
      await axios.put(`${API_BASE_URL}/api/blog-intro`, headerData);
      setToast('Header updated successfully!');
    } catch (err) {
      setToast('Error updating header');
    } finally {
      setSavingHeader(false);
      setTimeout(() => setToast(''), 3000);
    }
  };



  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        if (img.width !== 450 || img.height !== 256) {
          setToast(`Notice: Image is ${img.width}x${img.height}. Recommended is 450x256 for best fit.`);
          setTimeout(() => setToast(''), 4000);
        }
        setUploadingFile(file);
      };
    }
  };

  const handleAddTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const filteredPosts = posts.filter(p => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-8 bg-gradient-to-br from-[#0F1115] via-[#0F1115] to-[#16181D] min-h-full">
      {/* Page Header Section */}
      <div className="mb-8 bg-[#16181D] rounded-xl p-6 border border-[rgba(136,136,136,0.2)] shadow-xl animate-fade-in">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-5 h-5 text-[#022683]" />
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Page Header Settings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider block">Page Title</label>
            <input
              type="text"
              value={headerData.title}
              onChange={(e) => setHeaderData({ ...headerData, title: e.target.value })}
              placeholder="e.g., Our Blog"
              className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.15)] rounded-lg text-[#E6E6E6] focus:ring-2 focus:ring-[#022683] outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider block">Page Subtitle</label>
            <input
              type="text"
              value={headerData.subtitle}
              onChange={(e) => setHeaderData({ ...headerData, subtitle: e.target.value })}
              placeholder="e.g., Stay updated with the latest trends..."
              className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.15)] rounded-lg text-[#E6E6E6] focus:ring-2 focus:ring-[#022683] outline-none transition-all"
            />
          </div>
          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider block">Background Image</label>
            <div className="flex gap-4 items-start">
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={headerData.backgroundImage?.startsWith('data:') ? 'Local Image Selected' : headerData.backgroundImage}
                    onChange={(e) => setHeaderData({ ...headerData, backgroundImage: e.target.value })}
                    readOnly={headerData.backgroundImage?.startsWith('data:')}
                    className="flex-1 px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.15)] rounded-lg text-white outline-none focus:ring-2 focus:ring-[#022683]"
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
                    className="px-6 py-3 bg-[rgba(136,136,136,0.1)] text-white rounded-lg hover:bg-[rgba(136,136,136,0.2)] transition-colors flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload
                  </button>
                  {headerData.backgroundImage && (
                    <button
                      onClick={() => setHeaderData({ ...headerData, backgroundImage: '' })}
                      className="px-4 py-3 bg-red-900/30 text-red-500 border border-red-500/30 rounded-lg hover:bg-red-900/50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-[#888888] font-medium">Recommended size: 1920x375px for best display</p>
              </div>
              {headerData.backgroundImage && (
                <div className="w-20 h-12 rounded-lg overflow-hidden border border-[rgba(136,136,136,0.25)] bg-[#0F1115] flex-shrink-0">
                  <img
                    src={resolveImageUrl(headerData.backgroundImage)}
                    alt="Header Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleUpdateHeader}
            disabled={savingHeader}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-500 transition-all duration-300 shadow-lg hover:shadow-green-500/20 active:scale-95 disabled:opacity-50"
          >
            {savingHeader ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{savingHeader ? 'Updating...' : 'Update Header'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Header */}
      <div className="mb-8 flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Blog Posts Management</h1>
          <p className="text-[#888888]">Create and manage blog articles for the Think Tank section</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(136,136,136,0.2)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Plus className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:rotate-90" />
          <span className="relative z-10">Add Blog Post</span>
        </button>
      </div>


      {/* Filters */}
      <div className="mb-6 flex gap-4 animate-fade-in">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888888]" />
          <input
            type="text"
            placeholder="Search by title, description, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888888]" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="pl-10 pr-8 py-3 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888] cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPosts.map((post, index) => (
          <div
            key={post._id}
            className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg border border-[rgba(136,136,136,0.25)] overflow-hidden hover-card-lift animate-fade-in transition-all duration-300"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {/* Featured Image */}
            <div className="relative h-48 bg-gradient-to-br from-[#0F1115] to-[#16181D] overflow-hidden group">
              {post.featuredImage ? (
                <img
                  src={post.featuredImage.startsWith('http') ? post.featuredImage : `API_BASE_URL/${post.featuredImage}`}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-[#888888] opacity-50" />
                </div>
              )}
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 text-xs rounded backdrop-blur-sm ${post.enabled
                  ? 'bg-green-500/80 text-white border border-green-400/30'
                  : 'bg-yellow-500/80 text-white border border-yellow-400/30'
                  }`}>
                  {post.enabled ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-center gap-2 text-xs text-[#888888] mb-3">
                <Calendar className="w-3 h-3" />
                {new Date(post.publishDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>

              <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 min-h-[3.5rem]">
                {post.title}
              </h3>

              <p className="text-sm text-[#888888] mb-4 line-clamp-3 min-h-[4.5rem]">
                {post.shortDescription}
              </p>

              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#022683]/20 to-[#033aa0]/20 text-[#888888] text-xs rounded border border-[#022683]/30">
                  {post.category}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4 min-h-[2rem]">
                {post.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-[rgba(136,136,136,0.1)] text-[#888888] text-xs rounded border border-[rgba(136,136,136,0.25)]"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
                {post.tags.length > 3 && (
                  <span className="text-xs text-[#888888]">+{post.tags.length - 3} more</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-[rgba(136,136,136,0.25)]">
                <button
                  onClick={() => handleEdit(post)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[rgba(136,136,136,0.1)] text-[#888888] rounded hover:bg-[rgba(136,136,136,0.2)] hover:text-[#E6E6E6] transition-all duration-300 hover:scale-105"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span className="text-sm">Edit</span>
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-[#888888]/20 to-[#022683]/20 text-[#888888] rounded hover:from-[#888888]/30 hover:to-[#022683]/30 hover:text-[#E6E6E6] transition-all duration-300 hover:scale-105"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="text-sm">Preview</span>
                </button>
                <button
                  onClick={() => handleDelete(post._id!)}
                  className="p-2 text-red-400 hover:bg-[rgba(255,0,0,0.1)] rounded transition-all duration-300 hover:scale-110"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredPosts.length === 0 && (
          <div className="col-span-full text-center py-12">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 text-[#888888] opacity-50" />
            <p className="text-[#888888]">No blog posts found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-gradient-to-br from-[#0F1115] via-[#16181D] to-[#0F1115] rounded-lg shadow-2xl border border-[rgba(136,136,136,0.25)] w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#16181D] to-[#1a1d24] px-6 py-4 flex items-center justify-between border-b border-[rgba(136,136,136,0.25)] z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit className="w-5 h-5" />
                {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-[rgba(136,136,136,0.1)] rounded-lg transition-all duration-300 hover:rotate-90"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Title */}
              <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Post Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Understanding the New Income Tax Amendments for FY 2024-25"
                  className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                />
              </div>

              {/* Short Description */}
              <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Short Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Brief summary of the blog post (shown in card view)"
                  rows={3}
                  className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                />
              </div>

              {/* Date and Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    Publish Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.publishDate}
                    onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                  />
                </div>

                <div className="animate-fade-in" style={{ animationDelay: '0.25s' }}>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      if (e.target.value === '__add_new__') {
                        setShowAddCategory(true);
                        setNewCategory('');
                      } else {
                        setFormData({ ...formData, category: e.target.value });
                      }
                    }}
                    className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="__add_new__">+ Add New Category</option>
                  </select>
                  {showAddCategory && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value)}
                        placeholder="Enter new category"
                        className="flex-1 px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-[#E6E6E6] focus:ring-2 focus:ring-[#022683] outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newCategory && !categories.includes(newCategory)) {
                            setCategories([...categories, newCategory]);
                            setFormData({ ...formData, category: newCategory });
                            setShowAddCategory(false);
                          }
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddCategory(false)}
                        className="px-4 py-2 border border-[rgba(136,136,136,0.25)] text-[#888888] rounded-lg hover:bg-[rgba(136,136,136,0.1)] transition-all duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Tags
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a tag and press Enter"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                      className="flex-1 px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#022683]/20 to-[#033aa0]/20 text-[#E6E6E6] text-sm rounded border border-[#022683]/30"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Author */}
              <div className="animate-fade-in" style={{ animationDelay: '0.35s' }}>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Author
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="e.g., CA Rajesh Kumar"
                  className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                />
              </div>

              {/* Featured Image */}
              <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Featured Image
                </label>
                <div className="space-y-3">
                  {/* File Upload */}
                  <div className="border-2 border-dashed border-[rgba(136,136,136,0.25)] rounded-lg p-6 text-center hover:border-[#888888] transition-all duration-300 bg-[#0F1115]">
                    <Upload className="w-8 h-8 mx-auto mb-3 text-[#888888]" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="featured-image-upload"
                    />
                    <label
                      htmlFor="featured-image-upload"
                      className="cursor-pointer text-[#022683] hover:text-[#033aa0] font-medium"
                    >
                      {uploadingFile ? 'Change Image' : 'Click to upload image'}
                    </label>
                    {uploadingFile && (
                      <p className="mt-2 text-sm text-green-400 flex items-center justify-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        {uploadingFile.name}
                      </p>
                    )}
                    <p className="text-xs text-[#888888] mt-2">Images only, max 5MB | Recommended size: 450x256</p>
                  </div>

                  {/* URL Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ImageIcon className="h-4 w-4 text-[#888888]" />
                    </div>
                    <input
                      type="text"
                      value={formData.featuredImage}
                      onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                      placeholder="Or paste an image URL here..."
                      className="w-full pl-10 pr-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
                    />
                  </div>

                  {(formData.featuredImage && !uploadingFile) && (
                    <div className="border border-[rgba(136,136,136,0.25)] rounded-lg bg-[#16181D] flex items-center justify-center h-48 w-full overflow-hidden">
                      <img
                        src={formData.featuredImage.startsWith('http') ? formData.featuredImage : `API_BASE_URL/${formData.featuredImage}`}
                        alt="Preview"
                        className="object-contain max-h-48 max-w-full mx-auto"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="animate-fade-in" style={{ animationDelay: '0.45s' }}>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  Main Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your blog content here (supports HTML formatting)"
                  rows={12}
                  className="w-full px-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888] font-mono text-sm"
                />
                <p className="text-xs text-[#888888] mt-2">
                  You can use HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, etc.
                </p>
              </div>

              {/* Enabled Toggle */}
              <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <label className="flex items-center gap-3 cursor-pointer group p-4 bg-[#0F1115] rounded-lg border border-[rgba(136,136,136,0.25)] hover:border-[#888888] transition-all duration-300">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-12 h-6 rounded-full transition-all duration-300 ${formData.enabled ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-[rgba(136,136,136,0.3)]'} group-hover:shadow-lg`}>
                    <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-all duration-300 shadow-md ${formData.enabled ? 'translate-x-6' : ''} group-hover:scale-110`}></div>
                  </div>
                  <div className="flex-1">
                    <span className="text-[#E6E6E6] font-medium">Publish Blog Post</span>
                    <p className="text-xs text-[#888888] mt-1">Make this post visible on the website</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gradient-to-r from-[#16181D] to-[#1a1d24] px-6 py-4 flex items-center justify-end gap-3 border-t border-[rgba(136,136,136,0.25)]">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 border border-[rgba(136,136,136,0.25)] text-[#888888] rounded-lg hover:bg-[rgba(136,136,136,0.1)] hover:text-[#E6E6E6] transition-all duration-300 hover:scale-105"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[rgba(136,136,136,0.2)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Save className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:rotate-12" />
                <span className="relative z-10">{editingPost ? 'Update' : 'Publish'} Post</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 right-8 bg-gradient-to-r from-[#888888] to-[#022683] text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in border border-[rgba(255,255,255,0.2)] animate-glow-pulse z-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            {toast}
          </div>
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
              Delete this blog?
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
