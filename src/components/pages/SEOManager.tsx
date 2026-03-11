import React, { useState, useEffect } from 'react';
import { Save, Eye, Upload,Trash2  } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface PageSEO {
  _id?: string;
  pageName: string;
  urlSlug: string;
  metaTitle: string;
  metaDescription: string;
 keywords: string[]
  // ogImage: string;
  indexPage: boolean;
  followLinks: boolean;
  includeInSitemap: boolean;
}

export default function SEOManager() {
  const [pages, setPages] = useState<PageSEO[]>([]);
  const [editingPageName, setEditingPageName] = useState<string | null>('Home');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
const [newPageName, setNewPageName] = useState('');
const [deletePageName, setDeletePageName] = useState<string | null>(null);
const [deleting, setDeleting] = useState(false);
const [keywordInput, setKeywordInput] = useState('');


const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setKeywordInput(value);

  if (!currentPage) return; // ✅ Add this line

  if (value.includes(',')) {
    const newKeywords = value
      .split(',')
      .map(k => k.trim())
      .filter(k => k !== '');

    updateCurrentPage({
      keywords: [...currentPage.keywords, ...newKeywords]
    });

    setKeywordInput('');
  }
};




  useEffect(() => {
    fetchSEOConfigs();
  }, []);

 const fetchSEOConfigs = async () => {
  setLoading(true);
  try {
    const response = await axios.get(`${API_BASE_URL}/api/seo`);

    const formatted = response.data.map((page: any) => ({
      ...page,
      keywords: Array.isArray(page.keywords)
        ? page.keywords
        : page.keywords
          ? page.keywords.split(',').map((k: string) => k.trim())
          : []
    }));

    setPages(formatted);

    if (formatted.length > 0 && !editingPageName) {
      setEditingPageName(formatted[0].pageName);
    }
  } catch (err) {
    console.error('Error fetching SEO configs:', err);
    setToast('Error loading SEO settings');
  } finally {
    setLoading(false);
  }
};


  const currentPage = pages.find(p => p.pageName === editingPageName) || (pages.length > 0 ? pages[0] : null);

  const handleSave = async () => {
    if (!currentPage) return;
    try {
      await axios.put(`${API_BASE_URL}/api/seo/${currentPage.pageName}`, currentPage);
      setToast('SEO settings saved successfully!');
    } catch (err) {
      console.error('Error saving SEO config:', err);
      setToast('Error saving SEO settings');
    }
    setTimeout(() => setToast(''), 3000);
  };

  const handleAddPage = () => {
  setShowAddModal(true);
};
const confirmAddPage = async () => {
  if (!newPageName.trim()) return;

  const pageName = newPageName.trim();

  const newPage: PageSEO = {
    pageName,
    urlSlug: `/${pageName.toLowerCase().replace(/\s+/g, '-')}`,
    metaTitle: `${pageName} - Raju & Prasad`,
    metaDescription: '',
     keywords: [],
    indexPage: true,
    followLinks: true,
    includeInSitemap: true
  };

  try {
    const response = await axios.put(`${API_BASE_URL}/api/seo/${pageName}`, newPage);
    setPages([...pages, response.data]);
    setEditingPageName(pageName);
    setToast('New SEO page added!');
  } catch (err) {
    setToast('Error adding SEO page');
  }

  setShowAddModal(false);
  setNewPageName('');
  setTimeout(() => setToast(''), 3000);
};


 const handleDeletePage = (pageName: string) => {
  if (['Home', 'About', 'Services', 'Contact'].includes(pageName)) {
    setToast('Default pages cannot be deleted.');
    setTimeout(() => setToast(''), 3000);
    return;
  }

  setDeletePageName(pageName);
};




  const confirmDeletePage = async () => {
  if (!deletePageName) return;

  try {
    setDeleting(true);
    await axios.delete(`${API_BASE_URL}/api/seo/${deletePageName}`);
    setPages(pages.filter(p => p.pageName !== deletePageName));
    setEditingPageName('Home');
    setToast('SEO page deleted!');
  } catch (err) {
    setToast('Error deleting SEO page');
  } finally {
    setDeleting(false);
    setDeletePageName(null);
    setTimeout(() => setToast(''), 3000);
  }
};

  const updateCurrentPage = (updates: Partial<PageSEO>) => {
    if (!editingPageName) return;
    setPages(pages.map(p =>
      p.pageName === editingPageName ? { ...p, ...updates } : p
    ));
  };

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-[400px] bg-[#0F1115]">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#022683]"></div>
  //     </div>
  //   );
  // }

  if (!currentPage) return <div className="p-8 bg-[#0F1115] text-[#E6E6E6] min-h-full">No SEO configurations found.</div>;

  return (
    <div className="p-8 bg-gradient-to-br from-[#0F1115] via-[#0F1115] to-[#16181D] min-h-full">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">SEO & Metadata Management</h1>
        <p className="text-[#888888]">Optimize search engine visibility for each page</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Page Selector */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-4 sticky top-8 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in">
           <div className="flex items-center justify-between mb-4 gap-2">
      <h3 className="font-bold text-[#E6E6E6] text-sm whitespace-nowrap">Pages</h3>
      
      <div className="flex items-center gap-2 overflow-hidden">
        <select
          value={editingPageName || ''}
          onChange={(e) => setEditingPageName(e.target.value)}
          className="bg-[#0F1115] text-[#E6E6E6] text-xs border border-[rgba(136,136,136,0.25)] rounded px-2 py-1 outline-none focus:ring-1 focus:ring-[#022683] transition-all cursor-pointer min-w-[80px] max-w-[120px]"
        >
          {pages.map((page) => (
            <option key={page.pageName} value={page.pageName} className="bg-[#16181D]">
              {page.pageName}
            </option>
          ))}
        </select>

        <button
          onClick={handleAddPage}
          className="p-1 px-2 text-xs bg-[#022683] text-white rounded hover:bg-[#033aa0] transition-colors flex items-center gap-1 shadow-md shrink-0"
        >
          + Add
        </button>
      </div>
    </div>
            <div className="space-y-2">
              {pages.map((page, index) => (
                <button
                  key={page.pageName}
                  onClick={() => setEditingPageName(page.pageName)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 relative group ${editingPageName === page.pageName
                    ? 'bg-gradient-to-r from-[#022683] to-[#033aa0] text-white shadow-lg shadow-[#022683]/20'
                    : 'bg-gradient-to-br from-[#0F1115] to-[#16181D] text-[#888888] hover:text-[#E6E6E6] border border-transparent hover:border-[rgba(136,136,136,0.25)]'
                    }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex justify-between items-center relative z-10">
                    <div>
                      <div className="font-medium">{page.pageName}</div>
                      <div className={`text-xs ${editingPageName === page.pageName ? 'text-white/70' : 'text-[#888888]'}`}>
                        {page.urlSlug}
                      </div>
                    </div>
                   {true && (

                     <button
  onClick={(e) => {
    e.stopPropagation();
    handleDeletePage(page.pageName);
  }}
  className="p-1.5 rounded-md text-red-400 hover:bg-red-500/10 hover:scale-110 transition-all duration-200"
>
  <Trash2 className="w-4 h-4" />
</button>

                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SEO Editor */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in">
            <h2 className="text-xl font-bold text-[#E6E6E6] mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-[#888888] to-[#022683] rounded-full"></span>
              SEO Settings: {currentPage.pageName}
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#888888] mb-2">
                  URL Slug
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#888888]">website.com</span>
                  <input
                    type="text"
                    value={currentPage.urlSlug}
                    onChange={(e) => updateCurrentPage({ urlSlug: e.target.value })}
                    className="flex-1 px-4 py-2 border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none bg-[#0F1115] text-[#E6E6E6] transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-[#888888]">
                    Meta Title
                  </label>
                  <span className="text-xs text-[#888888]">
                    {currentPage.metaTitle.length}/60 characters
                  </span>
                </div>
                <input
                  type="text"
                  value={currentPage.metaTitle}
                  onChange={(e) => updateCurrentPage({ metaTitle: e.target.value })}
                  maxLength={60}
                  className="w-full px-4 py-2 border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none bg-[#0F1115] text-[#E6E6E6] transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-[#888888]">
                    Meta Description
                  </label>
                  <span className="text-xs text-[#888888]">
                    {currentPage.metaDescription.length}/160 characters
                  </span>
                </div>
                <textarea
                  value={currentPage.metaDescription}
                  onChange={(e) => updateCurrentPage({ metaDescription: e.target.value })}
                  maxLength={160}
                  rows={3}
                  className="w-full px-4 py-2 border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none bg-[#0F1115] text-[#E6E6E6] transition-all"
                />
              </div>

             <div>
  <label className="block text-sm font-medium text-[#888888] mb-2">
    Keywords
  </label>

  <div className="flex flex-wrap gap-2 mb-2">
    {currentPage.keywords.map((keyword, index) => (
      <div
        key={index}
        className="flex items-center bg-[#022683] text-white px-3 py-1 rounded-full text-sm"
      >
        {keyword}
        <button
          onClick={() => {
            const updated = currentPage.keywords.filter((_, i) => i !== index);
            updateCurrentPage({ keywords: updated });
          }}
          className="ml-2 text-white hover:text-red-300"
        >
          ✕
        </button>
      </div>
    ))}
  </div>

  <input
    type="text"
    value={keywordInput}
    onChange={handleKeywordChange}
    placeholder="Type keyword and press comma"
    className="w-full px-4 py-2 border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none bg-[#0F1115] text-[#E6E6E6]"
  />
</div>


            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 sticky top-8 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in">
            <h3 className="font-bold text-[#E6E6E6] mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#888888]" />
              Search Preview
            </h3>

            {/* Google Search Result Preview */}
            <div className="mb-6 p-4 bg-gradient-to-r from-[#888888] to-[#022683] rounded-lg shadow-lg animate-fade-in transition-all duration-300 hover:scale-105">
              <div className="text-xs text-white/70 mb-1 font-medium bg-black/20 inline-block px-1.5 py-0.5 rounded">
                website.com{currentPage.urlSlug}
              </div>
              <div className="text-white text-lg font-medium mb-1 hover:underline cursor-pointer tracking-wide">
                {currentPage.metaTitle || 'Page Title'}
              </div>
              <div className="text-xs text-white/80 leading-relaxed">
                {currentPage.metaDescription || 'No description provided.'}
              </div>
            </div>

            {/* Social Media Preview */}
            <div className="mb-4">
              <h4 className="text-sm font-bold text-[#E6E6E6] mb-3">Social Media Preview</h4>
              <div className="border border-[rgba(136,136,136,0.25)] rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:scale-105">
                {/* <div className="bg-gray-200 h-32 flex items-center justify-center">
                  <span className="text-xs text-gray-500">OG Image Preview</span>
                </div> */}
                <div className="p-4 bg-gradient-to-r from-[#888888] to-[#022683]">
                  <div className="text-sm font-bold text-white mb-2">
                    {currentPage.metaTitle || 'Page Title'}
                  </div>
                  <div className="text-xs text-white/80">
                    {(currentPage.metaDescription || '').substring(0, 100)}...
                  </div>
                  <div className="mt-3 text-[10px] text-white/60 uppercase tracking-wider font-semibold">
                    WEBSITE.COM
                  </div>
                </div>
              </div>
            </div>

            {/* SEO Score */}
            <div className="p-4 bg-[rgba(22,163,74,0.1)] rounded-lg border border-green-900/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#E6E6E6]">SEO Score</span>
                <span className="text-2xl font-bold text-green-500">
                  {Math.min(100, (currentPage.metaTitle.length ? 40 : 0) + (currentPage.metaDescription.length ? 60 : 0))}/100
                </span>
              </div>
              <div className="w-full bg-[#0F1115] rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(100, (currentPage.metaTitle.length ? 40 : 0) + (currentPage.metaDescription.length ? 60 : 0))}%` }}></div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-[rgba(2,38,131,0.2)] rounded-lg border border-[#022683]/30">
              <p className="text-xs text-blue-200">
                <strong>Tip:</strong> Keep meta titles under 60 characters and descriptions under 160 characters for best results.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          <Save className="w-4 h-4" />
          Save SEO Settings
        </button>
      </div>

      {toast && (
        <div className="fixed bottom-8 right-8 bg-[#1a1d24] text-[#E6E6E6] px-6 py-3 rounded-lg shadow-2xl border border-[#022683]/50 flex items-center gap-3 z-50 animate-fade-in">
          <div className="w-2 h-2 bg-[#022683] rounded-full animate-ping"></div>
          {toast}
        </div>
      )}
      {showAddModal && (
  <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
    <div className="bg-[#16181D] border border-[#022683]/30 shadow-2xl rounded-lg p-6 w-96 pointer-events-auto">

      <h3 className="text-base font-semibold text-white mb-4">
        Add New SEO Page
      </h3>

      <input
        type="text"
        value={newPageName}
        onChange={(e) => setNewPageName(e.target.value)}
        placeholder="Enter page name (e.g., Portfolio)"
        className="w-full px-4 py-2 mb-5 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] outline-none text-[#E6E6E6]"
      />

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowAddModal(false)}
          className="px-4 py-2 text-sm rounded bg-[rgba(136,136,136,0.2)] text-white hover:bg-[rgba(136,136,136,0.3)] transition"
        >
          Cancel
        </button>

        <button
          onClick={confirmAddPage}
          className="px-4 py-2 text-sm rounded bg-[#022683] text-white hover:bg-[#033aa0] transition"
        >
          Add
        </button>
      </div>

    </div>
  </div>
)}
{deletePageName && (
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
      Delete SEO page "{deletePageName}"?
    </h3>

    <p className="text-sm text-[#888888] mb-6">
      This action cannot be undone.
    </p>

    <div className="flex justify-end gap-3">
      <button
        onClick={() => setDeletePageName(null)}
        disabled={deleting}
        className="px-4 py-2 rounded-lg bg-[rgba(136,136,136,0.2)] text-white hover:bg-[rgba(136,136,136,0.3)] transition-all"
      >
        Cancel
      </button>

      <button
        onClick={confirmDeletePage}
        disabled={deleting}
        className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-50"
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
