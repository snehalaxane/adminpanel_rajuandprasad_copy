import React, { useState } from 'react';
import { Upload, Trash2, Search, FolderPlus, Image as ImageIcon, FileText, File, Save } from 'lucide-react';

export default function MediaLibrary() {
    const [files, setFiles] = useState([
        { id: 1, name: 'hero-banner.jpg', type: 'image', size: '2.4 MB', folder: 'Home Page', date: '2026-02-06', url: 'https://images.unsplash.com/photo-1765366417030-16d9765d920a?w=400' },
        { id: 2, name: 'team-photo.jpg', type: 'image', size: '1.8 MB', folder: 'Team', date: '2026-02-05', url: 'https://images.unsplash.com/photo-1765366417030-16d9765d920a?w=400' },
        { id: 3, name: 'budget-2026.pdf', type: 'pdf', size: '845 KB', folder: 'Newsletter', date: '2026-02-04', url: '/documents/budget-2026.pdf' },
        { id: 4, name: 'office-mumbai.jpg', type: 'image', size: '3.1 MB', folder: 'Contact', date: '2026-02-03', url: 'https://images.unsplash.com/photo-1765366417030-16d9765d920a?w=400' },
        { id: 5, name: 'annual-report.pdf', type: 'pdf', size: '1.2 MB', folder: 'Documents', date: '2026-02-02', url: '/documents/annual-report.pdf' },
        { id: 6, name: 'service-icon.svg', type: 'image', size: '12 KB', folder: 'Services', date: '2026-02-01', url: '/icons/service.svg' },
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFolder, setSelectedFolder] = useState('All');
    const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
    const [toast, setToast] = useState('');

    const folders = ['All', ...Array.from(new Set(files.map(f => f.folder)))];

    const filteredFiles = files.filter(file => {
        const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFolder = selectedFolder === 'All' || file.folder === selectedFolder;
        return matchesSearch && matchesFolder;
    });

    const handleDelete = () => {
        if (selectedFiles.length === 0) {
            setToast('Please select files to delete');
            setTimeout(() => setToast(''), 3000);
            return;
        }
        if (confirm(`Delete ${selectedFiles.length} file(s)?`)) {
            setFiles(files.filter(f => !selectedFiles.includes(f.id)));
            setSelectedFiles([]);
            setToast('Files deleted successfully!');
            setTimeout(() => setToast(''), 3000);
        }
    };

    const toggleFileSelection = (id: number) => {
        setSelectedFiles(prev =>
            prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
        );
    };

    const getFileIcon = (type: string) => {
        if (type === 'image') return <ImageIcon className="w-8 h-8 text-[#022683]" />;
        if (type === 'pdf') return <FileText className="w-8 h-8 text-red-400" />;
        return <File className="w-8 h-8 text-[#888888]" />;
    };

    return (
        <div className="p-8 bg-gradient-to-br from-[#0F1115] via-[#0F1115] to-[#16181D] min-h-full">
            <div className="mb-8 animate-fade-in">
                <h1 className="text-3xl font-bold text-white mb-2">Media Library</h1>
                <p className="text-[#888888]">Manage all your images, documents, and media files</p>
            </div>

            {/* Toolbar */}
            <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 mb-6 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in">
                <div className="flex items-center gap-4 flex-wrap">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95">
                        <Upload className="w-4 h-4" />
                        Upload Files
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[rgba(136,136,136,0.1)] text-[#E6E6E6] rounded-lg hover:bg-[rgba(136,136,136,0.2)] transition-all duration-300">
                        <FolderPlus className="w-4 h-4" />
                        New Folder
                    </button>
                    {selectedFiles.length > 0 && (
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all duration-300"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete ({selectedFiles.length})
                        </button>
                    )}
                    <div className="flex-1"></div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888888]" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search files..."
                            className="pl-10 pr-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 placeholder-[#888888]"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Folders Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-4 border border-[rgba(136,136,136,0.25)] animate-fade-in hover-card-lift">
                        <h3 className="font-bold text-[#E6E6E6] mb-4 flex items-center gap-2">
                            <span className="w-1 h-5 bg-[#022683] rounded-full"></span>
                            Folders
                        </h3>
                        <div className="space-y-1">
                            {folders.map((folder) => (
                                <button
                                    key={folder}
                                    onClick={() => setSelectedFolder(folder)}
                                    className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-300 ${selectedFolder === folder
                                        ? 'bg-gradient-to-r from-[#022683] to-[#033aa0] text-white shadow-md'
                                        : 'hover:bg-[rgba(136,136,136,0.1)] text-[#888888] hover:text-[#E6E6E6]'
                                        }`}
                                >
                                    <span className="flex items-center justify-between w-full">
                                        {folder}
                                        {folder !== 'All' && (
                                            <span className={`text-xs ${selectedFolder === folder ? 'text-white/70' : 'text-[#888888]'}`}>
                                                ({files.filter(f => f.folder === folder).length})
                                            </span>
                                        )}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Files Grid */}
                <div className="lg:col-span-4">
                    <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] animate-fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-[#E6E6E6] flex items-center gap-2">
                                {selectedFolder === 'All' ? 'All Files' : selectedFolder}
                                <span className="text-sm font-normal text-[#888888] bg-[rgba(136,136,136,0.1)] px-2 py-0.5 rounded-full">
                                    {filteredFiles.length}
                                </span>
                            </h3>
                        </div>

                        {filteredFiles.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-[rgba(136,136,136,0.25)] rounded-lg bg-[rgba(136,136,136,0.05)]">
                                <ImageIcon className="w-16 h-16 text-[#888888] mx-auto mb-4 opacity-50" />
                                <p className="text-[#888888]">No files found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filteredFiles.map((file, index) => (
                                    <div
                                        key={file.id}
                                        className={`border rounded-lg overflow-hidden cursor-pointer transition-all duration-300 group ${selectedFiles.includes(file.id)
                                            ? 'border-[#022683] bg-[rgba(2,38,131,0.1)] ring-1 ring-[#022683]'
                                            : 'border-[rgba(136,136,136,0.25)] hover:border-[#888888] bg-[#0F1115]'
                                            } animate-fade-in`}
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                        onClick={() => toggleFileSelection(file.id)}
                                    >
                                        <div className="aspect-square bg-[#0F1115] flex items-center justify-center relative border-b border-[rgba(136,136,136,0.1)] group-hover:opacity-90">
                                            {file.type === 'image' ? (
                                                <img
                                                    src={file.url}
                                                    alt={file.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                getFileIcon(file.type)
                                            )}

                                            {/* Selection Checkbox */}
                                            <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${selectedFiles.includes(file.id) ? 'bg-[#022683]' : 'bg-[rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100'
                                                }`}>
                                                {selectedFiles.includes(file.id) && (
                                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <p className="text-sm font-medium text-[#E6E6E6] truncate group-hover:text-white transition-colors" title={file.name}>
                                                {file.name}
                                            </p>
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="text-xs text-[#888888]">{file.size}</p>
                                                <p className="text-xs text-[#888888]">{file.date}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* File Details */}
                    {selectedFiles.length === 1 && (
                        <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 mt-6 border border-[rgba(136,136,136,0.25)] animate-slide-up">
                            <h3 className="font-bold text-[#E6E6E6] mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-[#022683]" />
                                File Details
                            </h3>
                            {(() => {
                                const file = files.find(f => f.id === selectedFiles[0]);
                                if (!file) return null;
                                return (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-[#0F1115] rounded-lg border border-[rgba(136,136,136,0.15)]">
                                                <p className="text-xs font-medium text-[#888888] mb-1 uppercase tracking-wider">File Name</p>
                                                <p className="text-sm text-[#E6E6E6] font-medium truncate" title={file.name}>{file.name}</p>
                                            </div>
                                            <div className="p-3 bg-[#0F1115] rounded-lg border border-[rgba(136,136,136,0.15)]">
                                                <p className="text-xs font-medium text-[#888888] mb-1 uppercase tracking-wider">File Size</p>
                                                <p className="text-sm text-[#E6E6E6] font-medium">{file.size}</p>
                                            </div>
                                            <div className="p-3 bg-[#0F1115] rounded-lg border border-[rgba(136,136,136,0.15)]">
                                                <p className="text-xs font-medium text-[#888888] mb-1 uppercase tracking-wider">Folder</p>
                                                <p className="text-sm text-[#E6E6E6] font-medium">{file.folder}</p>
                                            </div>
                                            <div className="p-3 bg-[#0F1115] rounded-lg border border-[rgba(136,136,136,0.15)]">
                                                <p className="text-xs font-medium text-[#888888] mb-1 uppercase tracking-wider">Upload Date</p>
                                                <p className="text-sm text-[#E6E6E6] font-medium">{file.date}</p>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-[rgba(136,136,136,0.25)]">
                                            <p className="text-sm font-medium text-[#888888] mb-2">File URL</p>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={file.url}
                                                    readOnly
                                                    className="flex-1 px-3 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-sm text-[#E6E6E6] outline-none"
                                                />
                                                <button className="px-4 py-2 bg-[rgba(136,136,136,0.1)] text-[#E6E6E6] rounded-lg hover:bg-[rgba(136,136,136,0.2)] transition-colors text-sm font-medium">
                                                    Copy
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
                <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-4 border border-[rgba(136,136,136,0.25)] hover:border-[#022683]/50 transition-colors">
                    <div className="text-2xl font-bold text-[#E6E6E6]">{files.length}</div>
                    <div className="text-sm text-[#888888]">Total Files</div>
                </div>
                <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-4 border border-[rgba(136,136,136,0.25)] hover:border-[#022683]/50 transition-colors">
                    <div className="text-2xl font-bold text-[#022683] text-glow-blue">
                        {files.filter(f => f.type === 'image').length}
                    </div>
                    <div className="text-sm text-[#888888]">Images</div>
                </div>
                <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-4 border border-[rgba(136,136,136,0.25)] hover:border-[#022683]/50 transition-colors">
                    <div className="text-2xl font-bold text-red-400 text-glow-red">
                        {files.filter(f => f.type === 'pdf').length}
                    </div>
                    <div className="text-sm text-[#888888]">Documents</div>
                </div>
                <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-4 border border-[rgba(136,136,136,0.25)] hover:border-[#022683]/50 transition-colors">
                    <div className="text-2xl font-bold text-purple-400 text-glow-purple">
                        {(files.reduce((acc, f) => acc + parseFloat(f.size), 0) / 1000).toFixed(1)} GB
                    </div>
                    <div className="text-sm text-[#888888]">Storage Used</div>
                </div>
            </div>

            {toast && (
                <div className="fixed bottom-8 right-8 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
                    {toast}
                </div>
            )}
        </div>
    );
}
