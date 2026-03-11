import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, Eye, FileText, Globe, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';
import { CKEditor } from '@ckeditor/ckeditor5-react';
// import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface LegalPage {
  _id?: string;
  pageTitle: string;
  pageSlug: string;
  content: string;
  // metaTitle: string;
  // metaDescription: string;
  status: 'draft' | 'published';
  lastUpdated: string;
}

export default function LegalPagesManager() {
  const [legalPages, setLegalPages] = useState<LegalPage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSEOPanel, setShowSEOPanel] = useState(true);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
const [deleting, setDeleting] = useState(false);
const CKEditorComponent = CKEditor as any;
const [content, setContent] = useState("<p>Start writing...</p>");



  useEffect(() => {
    fetchPages();
  }, []);


  const fetchPages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/legal`);
      setLegalPages(response.data);
      if (response.data.length > 0 && !selectedPageId) {
        setSelectedPageId(response.data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching legal pages:', err);
      setToast('Error loading pages');
    } finally {
      setLoading(false);
    }
  };

  const selectedPage = legalPages.find(p => p._id === selectedPageId);

  const handleSaveDraft = async () => {
    if (selectedPage && selectedPageId) {
      try {
        const response = await axios.put(`${API_BASE_URL}/api/legal/${selectedPageId}`, {
          ...selectedPage,
          status: 'draft'
        });
        setLegalPages(legalPages.map(p => p._id === selectedPageId ? response.data : p));
        setToast('Saved as draft!');
      } catch (err) {
        setToast('Error saving draft');
      }
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handlePublish = async () => {
    if (selectedPage && selectedPageId) {
      try {
        const response = await axios.put(`${API_BASE_URL}/api/legal/${selectedPageId}`, {
          ...selectedPage,
          status: 'published'
        });
        setLegalPages(legalPages.map(p => p._id === selectedPageId ? response.data : p));
        setToast('Page published successfully!');
      } catch (err) {
        setToast('Error publishing page');
      }
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleAddPage = async () => {
    const newPageData: Partial<LegalPage> = {
      pageTitle: 'New Legal Page',
      pageSlug: `/new-legal-page-${Date.now()}`,
     content: '<h2>New Legal Page</h2><p>Start writing your content here...</p>',

      // metaTitle: 'New Legal Page',
      // metaDescription: 'Description for new legal page',
      status: 'draft'
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/api/legal`, newPageData);
      setLegalPages([...legalPages, response.data]);
      setSelectedPageId(response.data._id);
      setEditMode(true);
      setShowPreview(false);
      setToast('New page created!');
    } catch (err) {
      setToast('Error creating new page');
    }
    setTimeout(() => setToast(''), 3000);
  };

  const handleDeletePage = (id: string) => {
  setDeleteId(id);
};
const confirmDelete = async () => {
  if (!deleteId) return;

  try {
    setDeleting(true);
    await axios.delete(`${API_BASE_URL}/api/legal/${deleteId}`);

    const updatedList = legalPages.filter(p => p._id !== deleteId);
    setLegalPages(updatedList);

    if (selectedPageId === deleteId) {
      setSelectedPageId(updatedList.length > 0 ? updatedList[0]._id! : null);
    }

    setToast('Page deleted!');
  } catch (err) {
    setToast('Error deleting page');
  } finally {
    setDeleting(false);
    setDeleteId(null);
    setTimeout(() => setToast(''), 3000);
  }
};


  const updateSelectedPage = (updates: Partial<LegalPage>) => {
    if (selectedPageId) {
      setLegalPages(legalPages.map(p =>
        p._id === selectedPageId ? { ...p, ...updates } : p
      ));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-full bg-[#0F1115]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#022683]"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-[#0F1115] via-[#0F1115] to-[#16181D] min-h-full">
      <div className="mb-8 flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Legal Pages Management</h1>
          <p className="text-[#888888]">Manage Terms & Conditions, Privacy Policy, and other legal pages</p>
        </div>
        <button
          onClick={handleAddPage}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(136,136,136,0.2)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Plus className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:rotate-90" />
          <span className="relative z-10">Add New Legal Page</span>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Panel - Pages List */}
        <div className="col-span-3 bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-4 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in">
          <h3 className="font-bold text-[#E6E6E6] mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-gradient-to-b from-[#888888] to-[#022683] rounded-full"></span>
            Legal Pages
          </h3>

          <div className="space-y-2">
            {legalPages.map((page, index) => (
              <button
                key={page._id}
                onClick={() => {
                  setSelectedPageId(page._id!);
                  setEditMode(false);
                  setShowPreview(false);
                }}
                className={`w-full text-left p-3 rounded-lg transition-all duration-300 relative overflow-hidden group ${selectedPageId === page._id
                  ? 'bg-gradient-to-r from-[#022683] to-[#033aa0] text-white shadow-lg shadow-[#022683]/20'
                  : 'bg-gradient-to-br from-[#0F1115] to-[#16181D] text-[#888888] hover:text-[#E6E6E6]'
                  }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {selectedPageId !== page._id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[rgba(136,136,136,0.1)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
                {selectedPageId === page._id && (
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#888888] to-[#022683] animate-pulse"></div>
                )}
                <div className="flex items-start justify-between gap-2 relative z-10">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate transition-all duration-300 group-hover:translate-x-1">{page.pageTitle}</div>
                    <div className={`text-xs mt-1 ${selectedPageId === page._id ? 'text-white/70' : 'text-[#888888]'}`}>
                      {page.pageSlug}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {page.status === 'published' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-[rgba(136,136,136,0.25)]">
            <div className="text-sm text-[#888888]">
              <div className="flex items-center justify-between mb-2">
                <span>Total Pages:</span>
                <span className="font-medium text-[#E6E6E6]">{legalPages.length}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span>Published:</span>
                <span className="font-medium text-green-500">
                  {legalPages.filter(p => p.status === 'published').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Drafts:</span>
                <span className="font-medium text-yellow-500">
                  {legalPages.filter(p => p.status === 'draft').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Content Editor */}
        <div className={`${showSEOPanel ? 'col-span-6' : 'col-span-9'} bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in`}>
          {selectedPage ? (
            <>
              {/* Header */}
              <div className="p-6 border-b border-[rgba(136,136,136,0.25)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-[#888888]" />
                    <div>
                      <h2 className="text-xl font-bold text-[#E6E6E6]">{selectedPage.pageTitle}</h2>
                      <p className="text-sm text-[#888888]">Last updated: {selectedPage.lastUpdated}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${selectedPage.status === 'published'
                      ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                      : 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30'
                      }`}>
                      {selectedPage.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="p-2 text-[#888888] hover:bg-[rgba(136,136,136,0.1)] rounded transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeletePage(selectedPage._id!)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveDraft}
                    className="flex items-center gap-2 px-4 py-2 bg-[rgba(136,136,136,0.2)] text-[#E6E6E6] rounded-lg hover:bg-[rgba(136,136,136,0.3)] border border-[rgba(136,136,136,0.25)] transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Save Draft
                  </button>
                  <button
                    onClick={handlePublish}
                    className="flex items-center gap-2 px-4 py-2 bg-[#022683] text-white rounded-lg hover:bg-[#033aa0] transition-all shadow-md active:scale-95"
                  >
                    <Globe className="w-4 h-4" />
                    Publish
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-6">
                {showPreview ? (
  <div className="max-w-4xl mx-auto">
    <h1 className="text-3xl font-bold text-[#E6E6E6] mb-6">
      {selectedPage.pageTitle}
    </h1>

    <div
      className="prose prose-lg max-w-none text-[#E6E6E6]"
      dangerouslySetInnerHTML={{ __html: selectedPage.content }}
    />
  </div>
) : (

                  // Edit Mode
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#888888] mb-2">
                        Page Title
                      </label>
                      <input
                        type="text"
                        value={selectedPage.pageTitle}
                       onChange={(e) => {
  const title = e.target.value;
  const slug = '/' + title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

  updateSelectedPage({
    pageTitle: title,
    pageSlug: slug
  });
}}

                        className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#888888] mb-2">
                        Page Slug <span className="text-xs text-[#888888]/70">(must be unique)</span>
                      </label>
                      <input
                        type="text"
                        value={selectedPage.pageSlug}
                        onChange={(e) => updateSelectedPage({ pageSlug: e.target.value })}
                        className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none font-mono text-sm text-[#E6E6E6] transition-all"
                        placeholder="/page-url"
                      />
                    </div>

                <div>
  <label className="block text-sm font-medium text-[#888888] mb-2">
    Content Editor
  </label>

  <div className="border border-[rgba(136,136,136,0.25)] rounded-lg overflow-hidden bg-[#0F1115]">
    {/* 1. The Toolbar Container (The "Horizontal Bar") */}
    <div id="toolbar-container" className="border-b border-[rgba(136,136,136,0.25)] bg-[#16181D]"></div>

    {/* 2. The Editable Area */}
    <div className="min-h-[400px] p-4 text-[#E6E6E6]">
      <CKEditorComponent
        editor={DecoupledEditor}
        data={selectedPage.content}
        onReady={(editor: any) => {
          // This line "injects" the toolbar into our specific div
          const toolbarContainer = document.querySelector('#toolbar-container');
          if (toolbarContainer) {
            toolbarContainer.appendChild(editor.ui.view.toolbar.element);
          }
        }}
        onChange={(_event: any, editor: any) => {
          const data = editor.getData();
          updateSelectedPage({ content: data });
        }}
        config={{
            placeholder: 'Start writing your legal content...',
        }}
      />
    </div>
  </div>
</div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-[#888888]">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300 animate-bounce" />
              <p>Select a legal page to edit or create a new one</p>
            </div>
          )}
        </div>

        {/* Right Panel - SEO Settings */}
        {showSEOPanel && selectedPage && (
          <div className="col-span-3 bg-[#16181D] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift">
           
            <div className="space-y-4">
             

           
              {/* <div className="mb-6 p-4 bg-gradient-to-r from-[#888888] to-[#022683] rounded-lg text-white shadow-lg animate-fade-in transition-all duration-300 hover:scale-105">
                <h4 className="text-sm font-bold text-[#E6E6E6] mb-3">Google Preview</h4>
                <div className="p-3 bg-[#0F1115] rounded-lg border border-[rgba(136,136,136,0.15)] shadow-inner">
                  <div className="text-xs text-green-400 mb-1 truncate">rajuandprasad.com{selectedPage.pageSlug}</div>
                  <div className="text-sm text-[#4c8bf5] font-medium mb-1 line-clamp-1">{selectedPage.metaTitle || 'Page Title'}</div>
                  <div className="text-xs text-[#888888] line-clamp-2">{selectedPage.metaDescription || 'Add a meta description to see how this page appears in search results.'}</div>
                </div>
              </div> */}

              <div className="mb-6 p-4 bg-gradient-to-r from-[#888888] to-[#022683] rounded-lg text-white shadow-lg animate-fade-in transition-all duration-300 hover:scale-105">
                <h4 className="text-sm font-bold text-[#E6E6E6] mb-3">Visibility</h4>
                <div className="p-3 bg-green-600/10 border border-green-600/30 rounded-lg">
                  <p className="text-xs text-green-400">
                    {selectedPage.status === 'published'
                      ? '✓ This page is live and visible in the footer.'
                      : '⏳ This page is hidden. Publish it to show.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!showSEOPanel && selectedPage && (
          <button
            onClick={() => setShowSEOPanel(true)}
            className="fixed right-0 top-1/2 -translate-y-1/2 bg-[#022683] text-white px-3 py-6 rounded-l-lg hover:bg-[#033aa0] transition-all shadow-lg z-50 animate-slide-in-right"
          >
            <span className="text-sm font-medium" style={{ writingMode: 'vertical-rl' }}>SEO Settings</span>
          </button>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 right-8 bg-[#1a1d24] text-[#E6E6E6] px-6 py-3 rounded-lg shadow-2xl animate-fade-in border border-[#022683]/50 z-[100] flex items-center gap-3">
          <div className="w-2 h-2 bg-[#022683] rounded-full animate-ping"></div>
          {toast}
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
      Delete this legal page?
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
