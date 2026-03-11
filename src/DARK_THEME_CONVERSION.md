# Dark Theme Conversion Guide

## Global Find & Replace Rules

### Text Colors
- `text-[#022683]` → `text-white`
- `text-blue-700` → `text-white`
- `text-blue-900` → `text-white`
- `text-blue-600` → `text-[#888888]`
- `text-gray-900` → `text-white`
- `text-gray-700` → `text-[#888888]`
- `text-gray-600` → `text-[rgba(136,136,136,0.7)]`

### Background Colors
- `bg-white` → `bg-gradient-to-br from-[#16181D] to-[#1a1d24]`
- `bg-gray-50` → `bg-[#0F1115]`
- `bg-blue-50` → `bg-gradient-to-r from-[rgba(136,136,136,0.05)] to-[rgba(2,38,131,0.05)]`
- `bg-blue-100` → `bg-gradient-to-r from-[rgba(136,136,136,0.1)] to-[rgba(2,38,131,0.1)]`

### Border Colors
- `border-gray-200` → `border-[rgba(136,136,136,0.25)]`
- `border-gray-300` → `border-[rgba(136,136,136,0.25)]`

### Hover States
- `hover:bg-blue-50` → `hover:bg-[rgba(136,136,136,0.1)]`
- `hover:bg-gray-50` → `hover:bg-[rgba(136,136,136,0.05)]`

### Badges and Tags
- Blue badges: Change background to dark gradient, text to white
- Role badges: Use dark backgrounds with appropriate colors

## Component-Specific Rules

### Tabs
```tsx
// Before
className={`border-[#022683] text-[#022683]`}

// After  
className={`border-[#022683] text-white bg-gradient-to-r from-[rgba(136,136,136,0.1)] to-[rgba(2,38,131,0.1)]`}
```

### Cards
```tsx
// Before
className="bg-white rounded-lg shadow p-6"

// After
className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)]"
```

### Edit Buttons
```tsx
// Before
className="p-2 text-[#022683] hover:bg-blue-50 rounded"

// After
className="p-2 text-[#888888] hover:bg-[rgba(136,136,136,0.1)] hover:text-white rounded transition-all duration-300"
```

### Preview Boxes
```tsx
// Before
className="p-4 bg-blue-50 rounded-lg"

// After  
className="p-4 bg-gradient-to-r from-[rgba(136,136,136,0.05)] to-[rgba(2,38,131,0.05)] rounded-lg border border-[rgba(136,136,136,0.15)]"
```

### Stat Cards
```tsx
// Before
<div className="text-2xl font-bold text-[#022683]">{value}</div>

// After
<div className="text-2xl font-bold text-white">{value}</div>
```

## Pages Needing Full Conversion

1. ✅ Login.tsx - DONE
2. ✅ Dashboard.tsx - Already dark
3. ✅ HomePageManager.tsx - Already dark
4. ✅ FooterContactManager.tsx - Already dark
5. ✅ HistoryManager.tsx - Already dark
6. ✅ LegalPagesManager.tsx - Already dark
7. ❌ NavbarFooterManager.tsx - Needs full conversion
8. ❌ MapLocationsManager.tsx - Needs full conversion
9. ❌ TeamManager.tsx - Needs full conversion
10. ❌ ServicesManager.tsx - Needs full conversion
11. ❌ SelectClientsManager.tsx - Needs conversion
12. ❌ NetworkingManager.tsx - Needs conversion
13. ❌ GalleryManager.tsx - Needs conversion
14. ❌ CareersManager.tsx - Needs conversion
15. ❌ ContactManager.tsx - Needs conversion
16. ❌ SEOManager.tsx - Needs conversion
17. ❌ MediaLibrary.tsx - Needs conversion
18. ❌ UserManagement.tsx - Needs conversion
19. ❌ Settings.tsx - Needs conversion
20. ✅ NewsletterManager.tsx - Already dark
21. ✅ BlogPostsManager.tsx - Already dark
22. ✅ AlumniManager.tsx - Already dark

## Priority Order
1. User-facing pages (Team, Services, Contact)
2. Content management (Gallery, Media, SEO)
3. Admin settings (Users, Settings)
