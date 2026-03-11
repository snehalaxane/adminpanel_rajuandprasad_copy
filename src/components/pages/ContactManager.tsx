import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, MapPin, Mail, Phone, Eye, GripVertical, Check, Building2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const resolveImageUrl = (url: string | undefined) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API_BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
};


export default function ContactManager() {
  const [formSettings, setFormSettings] = useState({
    pageTitle: 'Contact',
    pageSubtitle: "Send us your request and we'll get back to you at the earliest.",
    heading: 'Get in Touch',
    subheading: 'We would love to hear from you. Send us a message and we will respond as soon as possible.',
    callNow: '',
    emailUs: '',
    backgroundImage: '',
    enabled: true
  });


  const [formFields, setFormFields] = useState([
    { id: 1, label: 'Full Name', fieldType: 'text', required: true, enabled: true, placeholder: 'Enter your name' },
    { id: 2, label: 'Email Address', fieldType: 'email', required: true, enabled: true, placeholder: 'your@email.com' },
    { id: 3, label: 'Mobile Number', fieldType: 'tel', required: true, enabled: true, order: 3, placeholder: '+91 XXXXX XXXXX' },
    { id: 4, label: 'Company Name', fieldType: 'text', required: false, enabled: true, order: 4, placeholder: 'Your company (optional)' },
    { id: 5, label: 'Message', fieldType: 'textarea', required: true, enabled: true, order: 5, placeholder: 'How can we help you?' }
  ]);

  const [offices, setOffices] = useState<any[]>([]);

  const [editingOfficeId, setEditingOfficeId] = useState<string | number | null>(null);
  const [editingFieldId, setEditingFieldId] = useState<string | number | null>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'fields' | 'offices' | 'infrastructure' | 'submissions'>('form');
  const [infraData, setInfraData] = useState({
    title: 'Infrastructure',
    description: '',
    contactTitle: 'Contact Us',
    officeName: 'Head Office',
    address: '',
    phone1: '',
    phone2: '',
    email: '',
    website: '',
    fax: '',
    newsletterTitle: 'Newsletter',
    newsletterSubtitle: 'Subscribe to our Newsletter',
    enabled: true
  });
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [toast, setToast] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const introFileInputRef = React.useRef<HTMLInputElement>(null);


  const [deleteState, setDeleteState] = useState<{
    type: 'office' | 'field' | 'submission' | null;
    id?: string | number;
  }>({
    type: null
  });

  const [deleting, setDeleting] = useState(false);


  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [showSubModal, setShowSubModal] = useState(false);

  useEffect(() => {
    // fetch contact form settings from backend
    const fetchContactForm = async () => {
      try {
        // load settings, fields, and offices from separate endpoints
        const [settingsRes, fieldsRes, officesRes, infrastructureRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/contact/settings`),
          fetch(`${API_BASE_URL}/api/contact/fields`),
          fetch(`${API_BASE_URL}/api/contact/offices`),
          fetch(`${API_BASE_URL}/api/infrastructure`)
        ]);

        if (settingsRes && settingsRes.ok) {
          const settings = await settingsRes.json();
          setFormSettings(prev => ({ ...prev, ...settings }));
        }

        if (infrastructureRes && infrastructureRes.ok) {
          const infra = await infrastructureRes.json();
          setInfraData(infra);
        }

        if (fieldsRes && fieldsRes.ok) {
          const fields = await fieldsRes.json();
          const mapped = fields.map((f: any) => ({
            id: f._id || f.id || Date.now().toString(),
            label: f.label || '',
            fieldType: f.fieldType || 'text',
            required: !!f.required,
            enabled: f.enabled !== undefined ? !!f.enabled : true,
            order: f.order || 0,
            placeholder: f.placeholder || ''
          }));
          setFormFields(mapped);
        }

        if (officesRes && officesRes.ok) {
          const ofs = await officesRes.json();
          setOffices(ofs.map((o: any) => ({
            id: o._id || o.id || Date.now(),
            cityName: o.cityName || '',
            officeName: o.officeName || '',
            address: o.address || '',
            phone: o.phone || '',
            email: o.email || '',
            mapEmbed: o.mapEmbed || '',
            enabled: typeof o.enabled === 'boolean' ? o.enabled : true,
            order: typeof o.order === 'number' ? o.order : 0
          })));
        }
      } catch (err) {
        console.error('Failed to load contact form settings', err);
      }
    };

    const fetchSubmissions = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/contact-form/submissions`);
        if (res.ok) {
          const data = await res.json();
          setSubmissions(data);
        }
      } catch (err) {
        console.error('Failed to load submissions', err);
      }
    };

    fetchContactForm();
    fetchSubmissions();
  }, []);

  const handleSaveInfra = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/infrastructure`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(infraData)
      });
      if (res.ok) {
        setToast('Infrastructure settings saved!');
        setTimeout(() => setToast(''), 3000);
      }
    } catch (err) {
      setToast('Failed to save infrastructure settings');
    }
  };

  const handleSaveSettings = async () => {
    // Basic validation
    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePhone = (phone: string) => /^\+?[0-9\s\-()]{7,}$/.test(phone);

    if (!formSettings.callNow || !validatePhone(formSettings.callNow)) {
      setToast('Please enter a valid phone number for "Call Now"');
      setTimeout(() => setToast(''), 3000);
      return;
    }

    if (!formSettings.emailUs || !validateEmail(formSettings.emailUs)) {
      setToast('Please enter a valid email address for "Email Us"');
      setTimeout(() => setToast(''), 3000);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/contact/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formSettings)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save settings');

      setFormSettings(prev => ({ ...prev, ...data }));
      setToast('Settings saved successfully!');
      setHasUnsavedChanges(false);
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      console.error('Error saving settings', err);
      setToast(err instanceof Error ? err.message : 'Error saving settings');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleHeaderFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormSettings(prev => ({ ...prev, backgroundImage: reader.result as string }));
        setHasUnsavedChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveFields = async () => {

    try {
      const res = await fetch(`${API_BASE_URL}/api/contact/fields`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formFields)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save fields');

      const mapped = data.map((f: any) => ({
        id: f._id || f.id || Date.now().toString(),
        label: f.label || '',
        fieldType: f.fieldType || 'text',
        required: !!f.required,
        enabled: f.enabled !== undefined ? !!f.enabled : true,
        order: f.order || 0,
        placeholder: f.placeholder || ''
      }));
      setFormFields(mapped);
      setToast('Form fields saved successfully!');
      setHasUnsavedChanges(false);
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      console.error('Error saving fields', err);
      setToast(err instanceof Error ? err.message : 'Error saving fields');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleSaveOffices = async () => {

    try {
      console.log("Offices BEFORE sending:", offices);
      console.log("Saving to URL:", `${API_BASE_URL}/api/contact/offices`);
      const res = await fetch(`${API_BASE_URL}/api/contact/offices`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(offices)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save offices');

      setOffices(data.map((o: any) => ({
        id: o._id || o.id || Date.now(),
        cityName: o.cityName,
        officeName: o.officeName,
        address: o.address,
        phone: o.phone,
        email: o.email,
        mapEmbed: o.mapEmbed,
        enabled: typeof o.enabled === 'boolean' ? o.enabled : true,
        order: o.order
      })));
      setToast('Office locations saved successfully!');
      setHasUnsavedChanges(false);
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      console.error('Error saving offices', err);
      setToast(err instanceof Error ? err.message : 'Error saving offices');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleSaveAll = async () => {
    // Basic validation for settings
    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePhone = (phone: string) => /^\+?[0-9\s\-()]{7,}$/.test(phone);

    if (!formSettings.callNow || !validatePhone(formSettings.callNow)) {
      setToast('Please enter a valid phone number for "Call Now"');
      return;
    }
    if (!formSettings.emailUs || !validateEmail(formSettings.emailUs)) {
      setToast('Please enter a valid email address for "Email Us"');
      return;
    }

    try {
      setToast('Saving all changes...');
      await Promise.all([
        fetch(`${API_BASE_URL}/api/contact/settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formSettings)
        }),
        fetch(`${API_BASE_URL}/api/contact/fields`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formFields)
        }),
        fetch(`${API_BASE_URL}/api/contact/offices`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(offices)
        })
      ]);
      setToast('All changes saved successfully!');
      setHasUnsavedChanges(false);
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      console.error('Error saving all changes', err);
      setToast('Error saving all changes');
    }
  };

  const openDeleteOffice = (id: string | number) => {
    setDeleteState({ type: 'office', id });
  };


  const handleAddOffice = () => {
    const nextId = Date.now();
    const newOffice = {
      id: nextId,
      cityName: 'New City',
      officeName: 'New Office',
      address: '',
      phone: '',
      email: '',
      mapEmbed: '',
      enabled: true,
      order: offices.length + 1
    };
    setOffices([...offices, newOffice]);
    setEditingOfficeId(nextId);
    setToast('New office added!');
    setTimeout(() => setToast(''), 3000);
  };

  const handleAddField = () => {
    const nextId = Date.now();
    const newField = {
      id: nextId,
      label: 'New Field',
      fieldType: 'text',
      required: false,
      enabled: true,
      order: formFields.length + 1,
      placeholder: 'Enter value'
    };
    setFormFields([...formFields, newField]);
    setEditingFieldId(nextId);
    setHasUnsavedChanges(true);
    setToast('New field added!');
    setTimeout(() => setToast(''), 3000);
  };

  const handleFieldChange = (id: any, field: string, value: any) => {
    setFormFields(formFields.map(f => f.id === id ? { ...f, [field]: value } : f));
    setHasUnsavedChanges(true);
  };

  const toggleFieldEnabled = (id: any) => {
    setFormFields(formFields.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
    setHasUnsavedChanges(true);
  };

  const openDeleteField = (id: string | number) => {
    setDeleteState({ type: 'field', id });
  };

  const confirmDelete = async () => {
    if (!deleteState.type || !deleteState.id) return;

    try {
      setDeleting(true);

      if (deleteState.type === 'office') {
        setOffices(prev => prev.filter(o => o.id !== deleteState.id));
        setToast('Office location deleted!');
      }

      if (deleteState.type === 'field') {
        setFormFields(prev => prev.filter(f => f.id !== deleteState.id));
        setHasUnsavedChanges(true);
        setToast('Field deleted!');
      }

      if (deleteState.type === 'submission') {
        const res = await fetch(
          `${API_BASE_URL}/api/contact-form/submissions/${deleteState.id}`,
          { method: 'DELETE' }
        );

        if (res.ok) {
          setSubmissions(prev =>
            prev.filter(s => s._id !== deleteState.id)
          );
          setToast('Submission deleted!');
        } else {
          throw new Error('Failed to delete submission');
        }
      }

    } catch (err) {
      setToast('Error deleting item');
    } finally {
      setDeleting(false);
      setDeleteState({ type: null });
      setTimeout(() => setToast(''), 3000);
    }
  };
  const updateSubmissionStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact-form/submissions/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setSubmissions(submissions.map(s => s._id === id ? { ...s, status } : s));
        setToast(`Status updated to ${status}`);
        setTimeout(() => setToast(''), 3000);
      }
    } catch (err) {
      setToast('Error updating status');
    }
  };


  const toggleOfficeEnabled = (id: any) => {
    setOffices(offices.map(o => o.id === id ? { ...o, enabled: !o.enabled } : o));
    setHasUnsavedChanges(true);
  };

  const handleOfficeChange = (id: any, field: string, value: any) => {
    let finalValue = value;
    if (field === 'mapEmbed' && value.includes('<iframe')) {
      const match = value.match(/src="([^"]+)"/);
      if (match && match[1]) {
        finalValue = match[1];
      }
    }
    setOffices(offices.map(o => o.id === id ? { ...o, [field]: finalValue } : o));
    setHasUnsavedChanges(true);
  };

  return (
    <div className="p-8 bg-gradient-to-br from-[#0F1115] via-[#0F1115] to-[#16181D] min-h-full">
      <div className="mb-8 flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Contact Page Management</h1>
          <p className="text-[#888888]">Manage contact form, fields, and office locations</p>
        </div>
        {hasUnsavedChanges && (
          <div className="px-4 py-2 bg-yellow-900/20 text-yellow-500 rounded-lg text-sm border border-yellow-900/30 flex items-center gap-2">
            ⚠️ You have unsaved changes
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-[rgba(136,136,136,0.25)] animate-fade-in">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('form')}
            className={`px-4 py-3 border-b-2 transition-colors ${activeTab === 'form'
              ? 'border-[#022683] text-[#022683] font-medium'
              : 'border-transparent text-[#888888] hover:text-[#E6E6E6]'
              }`}
          >
            Contact Page Settings
          </button>
          <button
            onClick={() => setActiveTab('fields')}
            className={`px-4 py-3 border-b-2 transition-colors ${activeTab === 'fields'
              ? 'border-[#022683] text-[#022683] font-medium'
              : 'border-transparent text-[#888888] hover:text-[#E6E6E6]'
              }`}
          >
            Form Fields
          </button>
          <button
            onClick={() => setActiveTab('offices')}
            className={`px-4 py-3 border-b-2 transition-colors ${activeTab === 'offices'
              ? 'border-[#022683] text-[#022683] font-medium'
              : 'border-transparent text-[#888888] hover:text-[#E6E6E6]'
              }`}
          >
            Office Locations
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-3 border-b-2 transition-colors ${activeTab === 'submissions'
              ? 'border-[#022683] text-[#022683] font-medium'
              : 'border-transparent text-[#888888] hover:text-[#E6E6E6]'
              }`}
          >
            Submissions
          </button>
          <button
            onClick={() => setActiveTab('infrastructure')}
            className={`px-4 py-3 border-b-2 transition-colors ${activeTab === 'infrastructure'
              ? 'border-[#022683] text-[#022683] font-medium'
              : 'border-transparent text-[#888888] hover:text-[#E6E6E6]'
              }`}
          >
            Infrastructure Section
          </button>
        </div>
      </div>

      {/* Contact Form Settings Tab */}
      {activeTab === 'form' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
          <div className="lg:col-span-2 bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#E6E6E6]">Contact Page Header & Form Settings</h2>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formSettings.enabled}
                  onChange={(e) => {
                    setFormSettings({ ...formSettings, enabled: e.target.checked });
                    setHasUnsavedChanges(true);
                  }}
                  className="sr-only"
                />
                <div className={`w-10 h-5 rounded-full ${formSettings.enabled ? 'bg-green-500' : 'bg-gray-600'} transition-colors`}>
                  <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-transform ${formSettings.enabled ? 'translate-x-5' : ''}`}></div>
                </div>
                <span className="text-sm text-[#888888] group-hover:text-[#E6E6E6] transition-colors">{formSettings.enabled ? 'Enabled' : 'Disabled'}</span>
              </label>
            </div>

            <div className="space-y-6">
              {/* Page Title & Subtitle Section */}
              <div className="p-4 bg-[rgba(136,136,136,0.05)] rounded-lg border border-[rgba(136,136,136,0.1)] space-y-4">
                <h3 className="text-sm font-bold text-[#5b8fff] uppercase tracking-wider">Main Page Header</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#888888] mb-1">
                      Main Page Title
                    </label>
                    <input
                      type="text"
                      value={formSettings.pageTitle}
                      onChange={(e) => {
                        setFormSettings({ ...formSettings, pageTitle: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none text-[#E6E6E6] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#888888] mb-1">
                      Main Page Subtitle
                    </label>
                    <textarea
                      value={formSettings.pageSubtitle}
                      onChange={(e) => {
                        setFormSettings({ ...formSettings, pageSubtitle: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      rows={2}
                      className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none text-[#E6E6E6] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-2">Background Image</label>
                  <div className="flex gap-4 items-start">
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formSettings.backgroundImage?.startsWith('data:') ? 'Local Image Selected' : formSettings.backgroundImage}
                          onChange={(e) => {
                            setFormSettings({ ...formSettings, backgroundImage: e.target.value });
                            setHasUnsavedChanges(true);
                          }}
                          readOnly={formSettings.backgroundImage?.startsWith('data:')}
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
                          <Plus className="w-4 h-4 rotate-45" />
                          Upload
                        </button>
                        {formSettings.backgroundImage && (
                          <button
                            onClick={() => {
                              setFormSettings({ ...formSettings, backgroundImage: '' });
                              setHasUnsavedChanges(true);
                            }}
                            className="px-4 py-2 bg-red-900/30 text-red-500 border border-red-500/30 rounded-lg hover:bg-red-900/50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-[#888888] font-medium">Recommended size: 1920x375px for best display</p>
                    </div>
                    {formSettings.backgroundImage && (
                      <div className="w-20 h-12 rounded-lg overflow-hidden border border-[rgba(136,136,136,0.25)] bg-[#0F1115] flex-shrink-0">
                        <img
                          src={resolveImageUrl(formSettings.backgroundImage)}
                          alt="Header Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>


              {/* Form Section Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#5b8fff] uppercase tracking-wider">Form Section Content</h3>
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    Form Heading
                  </label>
                  <input
                    type="text"
                    value={formSettings.heading}
                    onChange={(e) => {
                      setFormSettings({ ...formSettings, heading: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none text-[#E6E6E6] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-2">
                    Form Subheading / Description
                  </label>
                  <textarea
                    value={formSettings.subheading}
                    onChange={(e) => {
                      setFormSettings({ ...formSettings, subheading: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    rows={2}
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none text-[#E6E6E6] transition-all"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-2">Call Now (phone)</label>
                  <input
                    type="text"
                    value={formSettings.callNow}
                    onChange={(e) => { setFormSettings({ ...formSettings, callNow: e.target.value }); setHasUnsavedChanges(true); }}
                    placeholder="+91 40 2331 6023"
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none text-[#E6E6E6] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-2">Email Us</label>
                  <input
                    type="email"
                    value={formSettings.emailUs}
                    onChange={(e) => { setFormSettings({ ...formSettings, emailUs: e.target.value }); setHasUnsavedChanges(true); }}
                    placeholder="info@rajuprasad.com"
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none text-[#E6E6E6] transition-all"
                  />
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-900/30 rounded-lg">
                <p className="text-sm text-blue-200">
                  <strong>💡 Tip:</strong> Customize the form heading and description to match your brand voice. Add multiple email recipients to ensure inquiries reach the right team.
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSaveSettings}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  Save Settings
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 sticky top-8 border border-[rgba(136,136,136,0.25)] hover-card-lift max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              <h3 className="font-bold text-[#E6E6E6] mb-4 flex items-center gap-2 sticky top-0 bg-[#16181D] py-2 z-10 border-b border-[rgba(136,136,136,0.1)]">
                <Eye className="w-5 h-5 text-[#888888]" />
                Page Preview
              </h3>

              {formSettings.enabled && (
                <div className="p-4 bg-gradient-to-r from-[#888888] to-[#022683] rounded-lg shadow-lg mb-4 animate-fade-in">
                  <h4 className="font-bold text-white mb-2">{formSettings.heading}</h4>
                  <p className="text-xs text-white/80 mb-4">{formSettings.subheading}</p>

                  {/* Contact Info Preview */}
                  <div className="space-y-1 mb-4 text-xs text-white/90">
                    {formSettings.callNow && (
                      <p>📞 {formSettings.callNow}</p>
                    )}

                    {formSettings.emailUs && (
                      <p>✉️ {formSettings.emailUs}</p>
                    )}
                  </div>

                  {/* <div className="space-y-2">
                    {formFields.filter(f => f.enabled).map((field) => (
                      <div key={field.id}>
                        <label className="text-xs text-white font-medium block mb-1">
                          {field.label} {field.required && <span className="text-red-300">*</span>}
                        </label>
                        {field.fieldType === 'textarea' ? (
                          <textarea
                            className="w-full px-2 py-2 border border-white/20 rounded text-xs bg-white/10 text-white placeholder-white/50 resize-none focus:bg-white/20 focus:outline-none transition-colors"
                            rows={2}
                            placeholder={field.placeholder}
                            disabled
                          />
                        ) : (
                          <input
                            type={field.fieldType}
                            className="w-full px-2 py-2 border border-white/20 rounded text-xs bg-white/10 text-white placeholder-white/50 focus:bg-white/20 focus:outline-none transition-colors"
                            placeholder={field.placeholder}
                            disabled
                          />
                        )}
                      </div>
                    ))}
                    <button className="w-full px-3 py-2 bg-white text-[#022683] rounded text-xs mt-3 font-bold shadow-md hover:bg-gray-100 transition-colors opacity-90 cursor-not-allowed">
                      Send Message
                    </button>
                  </div> */}
                </div>
              )}

              <div className="space-y-3">
                {/* <div className="p-3 bg-[#0F1115] rounded-lg border border-[rgba(136,136,136,0.15)]">
                  <p className="text-xs text-[#E6E6E6] mb-2"><strong>Contact Details:</strong></p>
                  <div className="space-y-1">
                    <p className="text-xs text-[#888888] flex items-center gap-2">
                      <Phone className="w-3 h-3 text-[#022683]" /> {formSettings.callNow}
                    </p>
                    <p className="text-xs text-[#888888] flex items-center gap-2">
                      <Mail className="w-3 h-3 text-[#022683]" /> {formSettings.emailUs}
                    </p>
                  </div>
                </div> */}

                {/* {offices.filter(o => o.enabled).length > 0 && (
                  <div className="p-3 bg-[#0F1115] rounded-lg border border-[rgba(136,136,136,0.15)]">
                    <p className="text-xs text-[#E6E6E6] mb-2 font-bold flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-[#022683]" /> Our Locations:
                    </p>
                    <div className="space-y-3">
                      {offices.filter(o => o.enabled).map(office => (
                        <div key={office.id} className="border-l-2 border-[#022683] pl-2 relative">
                          <p className="text-xs font-bold text-[#E6E6E6]">{office.cityName}</p>
                          <p className="text-[10px] text-[#888888]">{office.officeName}</p>
                          <p className="text-[10px] text-[#888888] line-clamp-2 mt-0.5">{office.address}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )} */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Fields Tab */}
      {activeTab === 'fields' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
          <div className="lg:col-span-2 bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#E6E6E6]">Manage Form Fields</h2>
              <button
                onClick={handleAddField}
                className="flex items-center gap-2 px-4 py-2 bg-[#022683] text-white rounded-lg hover:bg-[#033aa0] transition-colors shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add Field
              </button>
            </div>

            <div className="space-y-3">
              {formFields.map((field) => (
                <div key={field.id} className="border border-[rgba(136,136,136,0.25)] rounded-lg p-4 bg-[#0F1115] hover:border-[#888888] transition-colors">
                  <div className="flex items-start gap-3">
                    <GripVertical className="w-5 h-5 text-[#888888] cursor-move mt-2" />

                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-[#888888] mb-1">
                            Field Label
                          </label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => handleFieldChange(field.id, 'label', e.target.value)}
                            className="w-full px-3 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none text-sm text-[#E6E6E6] transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#888888] mb-1">
                            Field Type
                          </label>
                          <select
                            value={field.fieldType}
                            onChange={(e) => handleFieldChange(field.id, 'fieldType', e.target.value)}
                            className="w-full px-3 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none text-sm text-[#E6E6E6] transition-all"
                          >
                            <option value="text">Text</option>
                            <option value="email">Email</option>
                            <option value="tel">Phone</option>
                            <option value="number">Number</option>
                            <option value="textarea">Textarea</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#888888] mb-1">
                          Placeholder Text
                        </label>
                        <input
                          type="text"
                          value={field.placeholder}
                          onChange={(e) => handleFieldChange(field.id, 'placeholder', e.target.value)}
                          className="w-full px-3 py-2 bg-[#16181D] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none text-sm text-[#E6E6E6] transition-all"
                          placeholder="Enter placeholder text"
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => handleFieldChange(field.id, 'required', e.target.checked)}
                            className="w-4 h-4 text-[#022683] border-gray-300 rounded focus:ring-[#022683]"
                          />
                          <span className="text-sm text-[#888888] group-hover:text-[#E6E6E6] transition-colors">Required Field</span>
                        </label>
                        {/* <span className="text-xs text-[#888888]">Order: {field.order}</span> */}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={field.enabled} onChange={() => toggleFieldEnabled(field.id)} className="sr-only" />
                        <div className={`w-10 h-5 rounded-full ${field.enabled ? 'bg-green-500' : 'bg-gray-600'} transition-colors`}>
                          <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-transform ${field.enabled ? 'translate-x-5' : ''}`}></div>
                        </div>
                      </label>
                      <button
                        onClick={() => openDeleteField(field.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-800/30 rounded-lg">
              {/* <p className="text-sm text-yellow-500">
                <strong>⚠️ Note:</strong> Drag fields to reorder them in the form. Mark important fields as "Required" to ensure users provide necessary information.
              </p> */}
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={handleSaveFields}
                className="flex items-center gap-2 px-4 py-2 bg-[#022683] text-white rounded-lg hover:bg-[#033aa0] transition-colors shadow-md active:scale-95"
              >
                <Save className="w-4 h-4" />
                Save All Fields
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 sticky top-8 border border-[rgba(136,136,136,0.25)] hover-card-lift">
              <h3 className="font-bold text-[#E6E6E6] mb-4">Field Statistics</h3>

              <div className="space-y-3">
                <div className="p-4 bg-blue-900/20 border border-blue-900/30 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{formFields.length}</div>
                  <div className="text-sm text-[#888888]">Total Fields</div>
                </div>

                <div className="p-4 bg-green-900/20 border border-green-900/30 rounded-lg">
                  <div className="text-2xl font-bold text-green-500">{formFields.filter(f => f.enabled).length}</div>
                  <div className="text-sm text-[#888888]">Active Fields</div>
                </div>

                <div className="p-4 bg-red-900/20 border border-red-900/30 rounded-lg">
                  <div className="text-2xl font-bold text-red-500">{formFields.filter(f => f.required).length}</div>
                  <div className="text-sm text-[#888888]">Required Fields</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Office Locations Tab */}
      {activeTab === 'offices' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-end mb-4">
              <button
                onClick={handleAddOffice}
                className="flex items-center gap-2 px-4 py-2 bg-[#022683] text-white rounded-lg hover:bg-[#033aa0] transition-colors shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add Office Location
              </button>
            </div>

            {offices.map((office) => (
              <div key={office.id} className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift">
                {editingOfficeId === office.id ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-[#E6E6E6]">Edit Office Location</h3>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={office.enabled} onChange={() => toggleOfficeEnabled(office.id)} className="sr-only" />
                        <div className={`w-10 h-5 rounded-full ${office.enabled ? 'bg-green-500' : 'bg-gray-600'} transition-colors`}>
                          <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-transform ${office.enabled ? 'translate-x-5' : ''}`}></div>
                        </div>
                        <span className="text-sm text-[#888888] group-hover:text-[#E6E6E6] transition-colors">{office.enabled ? 'Enabled' : 'Disabled'}</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#888888] mb-2">
                          City Name
                        </label>
                        <input
                          type="text"
                          value={office.cityName}
                          onChange={(e) => handleOfficeChange(office.id, 'cityName', e.target.value)}
                          className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none text-[#E6E6E6] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#888888] mb-2">
                          Office Name
                        </label>
                        <input
                          type="text"
                          value={office.officeName}
                          onChange={(e) => handleOfficeChange(office.id, 'officeName', e.target.value)}
                          className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none text-[#E6E6E6] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#888888] mb-2">
                        Full Address
                      </label>
                      <textarea
                        value={office.address}
                        onChange={(e) => handleOfficeChange(office.id, 'address', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none text-[#E6E6E6] transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#888888] mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={office.phone}
                          onChange={(e) => handleOfficeChange(office.id, 'phone', e.target.value)}
                          className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none text-[#E6E6E6] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#888888] mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={office.email}
                          onChange={(e) => handleOfficeChange(office.id, 'email', e.target.value)}
                          className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none text-[#E6E6E6] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-[#888888]">
                          Google Maps Embed URL
                        </label>
                        {office.mapEmbed && (
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${office.mapEmbed.includes('/embed')
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-red-500/10 text-red-500'
                            }`}>
                            {office.mapEmbed.includes('/embed') ? '✓ Valid Embed Link' : '⚠ Invalid Link Type'}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={office.mapEmbed}
                        onChange={(e) => handleOfficeChange(office.id, 'mapEmbed', e.target.value)}
                        className={`w-full px-4 py-2 bg-[#0F1115] border rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-transparent outline-none text-[#E6E6E6] transition-all ${office.mapEmbed && !office.mapEmbed.includes('/embed') ? 'border-red-500/50' : 'border-[rgba(136,136,136,0.25)]'
                          }`}
                        placeholder="Paste Google Maps iframe tag or embed URL"
                      />
                      <div className="mt-2 p-3 bg-blue-900/10 border border-blue-900/20 rounded-lg">
                        <p className="text-[11px] text-[#888888] leading-relaxed">
                          <strong className="text-blue-400">Important:</strong> Standard "Share" links won't work. <br />
                          Go to Google Maps → Share → <span className="text-[#E6E6E6]">Embed a map</span> → Copy HTML. <br />
                          Paste the whole tag here and we'll extract the correct link for you!
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => setEditingOfficeId(null)}
                        className="flex-1 px-4 py-2 bg-[#022683] text-white rounded-lg hover:bg-[#033aa0] transition-colors"
                      >
                        <Check className="w-4 h-4 inline mr-2" />
                        Done Editing
                      </button>
                      <button
                        onClick={() => openDeleteOffice(office.id)}
                        className="px-4 py-2 bg-red-500/20 text-red-500 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <MapPin className="w-5 h-5 text-[#022683] mt-1" />
                        <div>
                          <h4 className="font-bold text-[#E6E6E6] text-lg">{office.cityName}</h4>
                          <p className="text-sm text-[#888888]">{office.officeName}</p>
                          <p className="text-sm text-[#E6E6E6] mt-2 mb-2">{office.address}</p>
                          <div className="flex gap-4 text-xs text-[#888888]">
                            <span className="flex items-center gap-1 group-hover:text-[#022683] transition-colors"><Phone className="w-3 h-3" /> {office.phone}</span>
                            <span className="flex items-center gap-1 group-hover:text-[#022683] transition-colors"><Mail className="w-3 h-3" /> {office.email}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingOfficeId(office.id)}
                          className="p-2 text-[#888888] hover:text-[#022683] hover:bg-[#022683]/10 rounded transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSaveOffices}
                className="flex items-center gap-2 px-4 py-2 bg-[#022683] text-white rounded-lg hover:bg-[#033aa0] transition-colors shadow-md active:scale-95"
              >
                <Save className="w-4 h-4" />
                Save Office Locations
              </button>
            </div>

          </div>

          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 sticky top-8 border border-[rgba(136,136,136,0.25)] hover-card-lift">
              <h3 className="font-bold text-[#E6E6E6] mb-4">Location Stats</h3>
              <div className="space-y-3">
                <div className="p-4 bg-purple-900/20 border border-purple-900/30 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">{offices.length}</div>
                  <div className="text-sm text-[#888888]">Total Offices</div>
                </div>
                <div className="p-4 bg-green-900/20 border border-green-900/30 rounded-lg">
                  <div className="text-2xl font-bold text-green-500">{offices.filter(o => o.enabled).length}</div>
                  <div className="text-sm text-[#888888]">Active Locations</div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-bold text-[#E6E6E6] mb-2 text-sm">Quick Tips</h4>
                <ul className="text-xs text-[#888888] space-y-2 list-disc pl-4">
                  <li>Embed maps help users find your office easily.</li>

                  <li>Keep addresses updated for SEO.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'submissions' && (
        <div className="animate-slide-up">
          <div className="bg-[#16181D] rounded-lg shadow-lg border border-[rgba(136,136,136,0.25)] overflow-hidden">
            <div className="p-6 border-b border-[rgba(136,136,136,0.1)] flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#E6E6E6]">Form Submissions</h2>
              <span className="text-xs text-[#888888] bg-[#0F1115] px-3 py-1 rounded-full border border-[rgba(136,136,136,0.1)]">
                {submissions.length} Total Inquiries
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#0F1115] text-[#888888] text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Contact Info</th>
                    <th className="px-6 py-4 font-semibold">Message</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(136,136,136,0.1)]">
                  {submissions.map((sub) => {
                    // Attempt to find mobile in raw data if missing
                    const findMobile = () => {
                      if (sub.mobile && sub.mobile !== 'N/A') return sub.mobile;
                      const raw = sub.additionalInfo || {};
                      const mobileKey = Object.keys(raw).find(k => k.toLowerCase().includes('mobile') || k.toLowerCase().includes('phone') || k.toLowerCase().includes('tel') || k.toLowerCase().includes('contact'));
                      return mobileKey ? raw[mobileKey] : 'N/A';
                    };

                    return (
                      <tr key={sub._id} className="hover:bg-[rgba(136,136,136,0.02)] transition-colors group">
                        <td className="px-6 py-4 text-sm font-medium text-[#E6E6E6]">{sub.name}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex flex-col gap-1">
                            <span className="text-[#888888] flex items-center gap-2"><Mail className="w-3 h-3" /> {sub.email}</span>
                            <span className="text-[#888888] flex items-center gap-2"><Phone className="w-3 h-3" /> {findMobile()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#888888]">
                          <p className="line-clamp-2 max-w-xs">{sub.message}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#888888]">
                          {new Date(sub.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <select
                            value={sub.status}
                            onChange={(e) => updateSubmissionStatus(sub._id, e.target.value)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold outline-none border-none cursor-pointer transition-all ${sub.status === 'New' ? 'bg-blue-500/10 text-blue-500' :
                              sub.status === 'Replied' ? 'bg-green-500/10 text-green-500' :
                                'bg-gray-500/10 text-gray-400'
                              }`}
                          >
                            <option value="New" className="bg-[#16181D]">New</option>
                            <option value="Replied" className="bg-[#16181D]">Replied</option>
                            <option value="Closed" className="bg-[#16181D]">Closed</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => { setSelectedSubmission(sub); setShowSubModal(true); }}
                              className="p-2 text-blue-400/50 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                              title="View All Data"
                            >
                              {/* <Eye className="w-4 h-4" /> */}
                            </button>
                            <button
                              onClick={() => setDeleteState({ type: 'submission', id: sub._id })}
                              className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {submissions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-[#888888] italic">
                        No submissions found yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'infrastructure' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
          <div className="bg-[#16181D] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#E6E6E6]">Infrastructure Header</h2>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={infraData.enabled}
                  onChange={(e) => setInfraData({ ...infraData, enabled: e.target.checked })}
                  className="sr-only"
                />
                <div className={`w-10 h-5 rounded-full ${infraData.enabled ? 'bg-green-500' : 'bg-gray-600'} transition-colors`}>
                  <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-transform ${infraData.enabled ? 'translate-x-5' : ''}`}></div>
                </div>
                <span className="text-sm text-[#888888] group-hover:text-[#E6E6E6] transition-colors">{infraData.enabled ? 'Enabled' : 'Disabled'}</span>
              </label>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#888888] mb-1">Section Title</label>
                <input
                  type="text"
                  value={infraData.title}
                  onChange={(e) => setInfraData({ ...infraData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#888888] mb-1">Section Description</label>
                <textarea
                  value={infraData.description}
                  onChange={(e) => setInfraData({ ...infraData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white"
                />
              </div>

              <h3 className="text-lg font-bold text-[#5b8fff] mt-8 mb-4">Contact Side Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-1">Contact Title</label>
                  <input
                    type="text"
                    value={infraData.contactTitle}
                    onChange={(e) => setInfraData({ ...infraData, contactTitle: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-1">Office Name</label>
                  <input
                    type="text"
                    value={infraData.officeName}
                    onChange={(e) => setInfraData({ ...infraData, officeName: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#888888] mb-1">Address</label>
                <textarea
                  value={infraData.address}
                  onChange={(e) => setInfraData({ ...infraData, address: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-1">Phone 1</label>
                  <input
                    type="text"
                    value={infraData.phone1}
                    onChange={(e) => setInfraData({ ...infraData, phone1: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-1">Phone 2</label>
                  <input
                    type="text"
                    value={infraData.phone2}
                    onChange={(e) => setInfraData({ ...infraData, phone2: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-1">Email</label>
                  <input
                    type="email"
                    value={infraData.email}
                    onChange={(e) => setInfraData({ ...infraData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-1">Website</label>
                  <input
                    type="text"
                    value={infraData.website}
                    onChange={(e) => setInfraData({ ...infraData, website: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#888888] mb-1">Fax</label>
                <input
                  type="text"
                  value={infraData.fax}
                  onChange={(e) => setInfraData({ ...infraData, fax: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white"
                />
              </div>

              <h3 className="text-lg font-bold text-[#5b8fff] mt-8 mb-4">Newsletter Side Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-1">Newsletter Title</label>
                  <input
                    type="text"
                    value={infraData.newsletterTitle}
                    onChange={(e) => setInfraData({ ...infraData, newsletterTitle: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-1">Newsletter Subtitle</label>
                  <input
                    type="text"
                    value={infraData.newsletterSubtitle}
                    onChange={(e) => setInfraData({ ...infraData, newsletterSubtitle: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button
                  onClick={handleSaveInfra}
                  className="flex items-center gap-2 px-8 py-3 bg-[#022683] text-white rounded-lg hover:bg-[#033aa0] shadow-xl transition-all"
                >
                  <Save className="w-5 h-5" />
                  Save Infrastructure Details
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#16181D] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-[#022683]/20 rounded-full flex items-center justify-center">
              <Building2 className="w-8 h-8 text-[#022683]" />
            </div>
            <h3 className="text-xl font-bold text-white">Preview Information</h3>
            <p className="text-[#888888] max-w-xs">
              These details will appear in the Infrastructure section of the homepage, showing your office capabilities and facilitating newsletter subscriptions.
            </p>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-8 right-8 bg-[#1a1d24] text-[#E6E6E6] px-6 py-3 rounded-lg shadow-2xl border border-[#022683]/50 flex items-center gap-3 z-50 animate-fade-in">
          <div className="w-2 h-2 bg-[#022683] rounded-full animate-ping"></div>
          {toast}
        </div>
      )}
      {deleteState.type && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#16181D] border border-red-500/30 shadow-2xl rounded-lg p-6 w-96 animate-fade-in">

            <h3 className="text-base font-semibold text-white mb-2">
              Are you sure you want to delete this {deleteState.type}?
            </h3>

            <p className="text-sm text-[#888888] mb-5">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteState({ type: null })}
                className="px-4 py-2 text-[#888888] hover:text-white transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
