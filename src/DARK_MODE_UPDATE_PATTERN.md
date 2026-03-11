# Dark Mode Update Pattern for All CMS Pages

## Pages to Update:
- ✅ Dashboard - DONE
- ✅ Home Page Manager - DONE  
- ✅ Team Manager - DONE
- ✅ Legal Pages Manager - DONE
- ✅ History Manager - DONE
- ✅ Footer Contact Manager - DONE
- ✅ Navigation & Links Management - DONE
- ✅ Map Locations Manager - DONE
- ⏳ Services Management
- ⏳ Select Clients Management
- ⏳ Networking Page Management
- ⏳ Blog / Newsletter Management
- ⏳ Alumni Management
- ⏳ Gallery Management
- ⏳ Careers Management
- ⏳ Contact Page Management
- ⏳ SEO & Metadata Management
- ⏳ Media Library
- ⏳ User Management
- ⏳ Settings

## Pattern to Apply:

### 1. Main Container
```tsx
<div className="p-8 bg-gradient-to-br from-[#0F1115] via-[#0F1115] to-[#16181D] min-h-screen">
```

### 2. Page Header
```tsx
<div className="mb-8 flex items-center justify-between animate-fade-in">
  <div>
    <h1 className="text-3xl font-bold text-white mb-2">Page Title</h1>
    <p className="text-[#888888]">Page description</p>
  </div>
</div>
```

### 3. Cards
```tsx
<div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in">
```

### 4. Section Headings
```tsx
<h2 className="text-xl font-bold text-white flex items-center gap-2">
  <span className="w-1 h-6 bg-gradient-to-b from-[#888888] to-[#022683] rounded-full animate-pulse-slow"></span>
  Section Title
</h2>
```

### 5. Input Fields
```tsx
<input
  className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300 hover:border-[#888888]"
/>
```

### 6. Labels
```tsx
<label className="block text-sm font-medium text-[#888888] mb-2">
```

### 7. Primary Buttons
```tsx
<button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 relative overflow-hidden group">
  <div className="absolute inset-0 bg-gradient-to-r from-[rgba(136,136,136,0.2)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  <Icon className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:rotate-90" />
  <span className="relative z-10">Button Text</span>
</button>
```

### 8. Secondary Buttons (Preview, etc.)
```tsx
<button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#888888] to-[#022683] text-white rounded-lg hover:from-[#022683] hover:to-[#888888] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95">
```

### 9. Toggle Switches
```tsx
<label className="flex items-center gap-2 cursor-pointer group">
  <input type="checkbox" checked={enabled} className="sr-only" />
  <div className={`w-11 h-6 rounded-full transition-all duration-300 ${enabled ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-[rgba(136,136,136,0.3)]'} group-hover:shadow-lg`}>
    <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-all duration-300 shadow-md ${enabled ? 'translate-x-5' : ''} group-hover:scale-110`}></div>
  </div>
  <span className="text-sm text-[#888888] transition-colors duration-300 group-hover:text-[#E6E6E6]">{enabled ? 'Enabled' : 'Disabled'}</span>
</label>
```

### 10. Tabs
```tsx
<button
  className={`px-6 py-3 font-medium transition-all duration-300 relative ${
    activeTab === 'tab1'
      ? 'text-white bg-gradient-to-r from-[#022683] via-[#022683] to-[#033aa0] rounded-t-lg shadow-lg animate-tab-active'
      : 'text-[#888888] hover:text-[#E6E6E6] hover:bg-[rgba(136,136,136,0.1)] rounded-t-lg'
  }`}
>
  {activeTab === 'tab1' && (
    <div className="absolute inset-0 bg-gradient-to-r from-[rgba(136,136,136,0.2)] to-transparent opacity-50 rounded-t-lg"></div>
  )}
  <span className="relative z-10">Tab Label</span>
</button>
```

### 11. Toast Notifications
```tsx
{toast && (
  <div className="fixed bottom-8 right-8 bg-gradient-to-r from-[#888888] to-[#022683] text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in border border-[rgba(255,255,255,0.2)] animate-glow-pulse">
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
      {toast}
    </div>
  </div>
)}
```

### 12. Preview Panels
```tsx
<div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] sticky top-8 hover-card-lift animate-fade-in">
  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
    <Eye className="w-5 h-5 text-[#888888]" />
    Preview
  </h3>
</div>
```

### 13. Status Badges
```tsx
<span className="px-2 py-1 bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 text-xs rounded border border-green-500/30">Active</span>
```

### 14. Info Boxes
```tsx
<div className="p-4 bg-[rgba(2,38,131,0.1)] border border-[rgba(136,136,136,0.25)] rounded-lg">
  <p className="text-sm text-[#E6E6E6]">
    <strong>ℹ️ Note:</strong> Info text here
  </p>
</div>
```

### 15. Delete/Danger Buttons
```tsx
<button className="p-2 text-red-400 hover:bg-[rgba(255,0,0,0.1)] rounded transition-all duration-300 hover:scale-110">
  <Trash2 className="w-4 h-4" />
</button>
```

## Animation Delays for Lists
```tsx
style={{ animationDelay: `${index * 0.05}s` }}
```

## Text Colors:
- **Main Titles**: `text-white`
- **Section Headings**: `text-white`  
- **Body Text**: `text-[#E6E6E6]`
- **Labels**: `text-[#888888]`
- **Muted/Subdued**: `text-[#888888]`
- **Links**: `text-[#888888] hover:text-[#E6E6E6]`

## Border Colors:
- Default: `border-[rgba(136,136,136,0.25)]`
- Hover: `hover:border-[#888888]`
- Focus: `focus:border-[#022683]`
