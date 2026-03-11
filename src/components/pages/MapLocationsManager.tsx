import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, MapPin, Save, Eye, Loader2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
console.log("GOOGLE KEY:", GOOGLE_KEY);

export default function MapLocationsManager() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    city: '',
    state: '',
    latitude: '',
    longitude: '',
    pinColor: '#022683',
    tooltip: '',
    address: '',
    enabled: true
  });
  const [formErrors, setFormErrors] = useState({
    city: '',
    state: '',
    latitude: '',
    longitude: '',
    tooltip: '',
    address: ''
  });
  const [toast, setToast] = useState('');
  const [address, setAddress] = useState("");
const [latitude, setLatitude] = useState<number | null>(null);
const [longitude, setLongitude] = useState<number | null>(null);


useEffect(() => {
  if (!formData.address) return;

  const timeout = setTimeout(() => {
    fetchCoordinates(formData.address);
  }, 800); // wait 800ms after typing stops

  return () => clearTimeout(timeout);
}, [formData.address]);


  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/map-locations`);
      setLocations(res.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
      showToast('Error loading locations');
    }
  };

  useEffect(() => {
  console.log("Modal state:", showModal);
}, [showModal]);


  const validateForm = () => {
    const errors = {
      city: '',
      state: '',
      latitude: '',
      longitude: '',
      tooltip: '',
      address: ''
    };

    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.latitude) errors.latitude = 'Latitude is required';
    if (!formData.longitude) errors.longitude = 'Longitude is required';
    if (!formData.tooltip.trim()) errors.tooltip = 'Tooltip is required';
    if (!formData.address.trim()) errors.address = 'Address is required';

    setFormErrors(errors);
    return !Object.values(errors).some(err => err !== '');
  };

  const openAddModal = () => {
    setEditingLocation(null);
    setFormData({
      city: '',
      state: '',
      latitude: '',
      longitude: '',
      pinColor: '#022683',
      tooltip: '',
      address: '',
      enabled: true
    });
    setFormErrors({
      city: '',
      state: '',
      latitude: '',
      longitude: '',
      tooltip: '',
      address: ''
    });
    setShowModal(true);
  };

 const fetchCoordinates = async (address: string) => {
  try {
    const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_KEY}`
    );

    const data = await response.json();

    if (data.status === "OK") {
      const location = data.results[0].geometry.location;

      setFormData((prev) => ({
        ...prev,
        latitude: location.lat,
        longitude: location.lng,
      }));

      console.log("Coordinates fetched:", location.lat, location.lng);
    } else {
      console.error("Geocoding failed:", data.status);
    }
  } catch (error) {
    console.error("Error fetching coordinates:", error);
  }
};




  const openEditModal = (location: any) => {
    setEditingLocation(location);
    setFormData({
      city: location.city,
      state: location.state,
      latitude: location.latitude,
      longitude: location.longitude,
      pinColor: location.pinColor,
      tooltip: location.tooltip,
      address: location.address,
      enabled: location.enabled
    });
    setFormErrors({
      city: '',
      state: '',
      latitude: '',
      longitude: '',
      tooltip: '',
      address: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingLocation(null);
    setFormData({
      city: '',
      state: '',
      latitude: '',
      longitude: '',
      pinColor: '#022683',
      tooltip: '',
      address: '',
      enabled: true
    });
    setFormErrors({
      city: '',
      state: '',
      latitude: '',
      longitude: '',
      tooltip: '',
      address: ''
    });
  };

  const handleSaveLocation = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (editingLocation) {
        await axios.put(`${API_BASE_URL}/api/map-locations/${editingLocation._id}`, formData);
        showToast('Location updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/api/map-locations`, formData);
        showToast('Location added successfully!');
      }
      fetchLocations();
      closeModal();
    } catch (error) {
      console.error('Error saving location:', error);
      showToast('Error saving location');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
  if (!deleteId) return;

  try {
    await axios.delete(`${API_BASE_URL}/api/map-locations/${deleteId}`);
    showToast('Location deleted successfully!');
    fetchLocations();
  } catch (error) {
    console.error('Error deleting location:', error);
    showToast('Error deleting location');
  } finally {
    setShowDeleteModal(false);
    setDeleteId(null);
  }
};


  const handleToggleEnabled = async (id: string, currentEnabled: boolean) => {
    try {
      await axios.put(`${API_BASE_URL}/api/map-locations/${id}`, { enabled: !currentEnabled });
      fetchLocations();
    } catch (error) {
      console.error('Error updating location:', error);
      showToast('Error updating location');
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="p-8 bg-gradient-to-br from-[#0F1115] via-[#0F1115] to-[#16181D] min-h-full">
      <div className="mb-8 flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Map Locations Manager</h1>
          <p className="text-[#888888]">Manage city pins and office locations on the interactive map</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(136,136,136,0.2)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Plus className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:rotate-90" />
          <span className="relative z-10">Add Location</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Locations List */}
        <div className="lg:col-span-2 space-y-4">
          {locations.map((location, index) => (
            <div
              key={location._id}
              className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] hover-card-lift animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: location.pinColor }}
                  >
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{location.city}</h3>
                    <p className="text-sm text-[#888888]">{location.state}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={location.enabled}
                      onChange={() => handleToggleEnabled(location._id, location.enabled)}
                      className="sr-only"
                    />
                    <div className={`w-10 h-5 rounded-full transition-all duration-300 ${location.enabled ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-[rgba(136,136,136,0.3)]'} group-hover:shadow-lg`}>
                      <div className={`w-4 h-4 bg-white rounded-full m-0.5 transition-all duration-300 shadow-md ${location.enabled ? 'translate-x-5' : ''} group-hover:scale-110`}></div>
                    </div>
                  </label>
                  <button
                    onClick={() => openEditModal(location)}
                    className="p-2 text-[#022683] hover:bg-[rgba(2,38,131,0.1)] rounded transition-all duration-300 hover:scale-110"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
  setDeleteId(location._id);
  setShowDeleteModal(true);
}}

                    className="p-2 text-red-400 hover:bg-[rgba(255,0,0,0.1)] rounded transition-all duration-300 hover:scale-110"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-sm text-[#888888]">
                <p className="mb-1"><strong className="text-[#E6E6E6]">Address:</strong> {location.address}</p>
                <p><strong className="text-[#E6E6E6]">Coordinates:</strong> {location.latitude}, {location.longitude}</p>
              </div>
            </div>
          ))}

          {locations.length === 0 && (
            <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-12 border border-[rgba(136,136,136,0.25)] text-center">
              <MapPin className="w-16 h-16 text-[#888888] mx-auto mb-4" />
              <p className="text-[#888888] text-lg">No locations added yet</p>
              <p className="text-[#888888] text-sm mt-2">Click "Add Location" to create your first map pin</p>
            </div>
          )}
        </div>

        {/* Map Preview */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-6 border border-[rgba(136,136,136,0.25)] sticky top-8 hover-card-lift animate-fade-in">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#888888]" />
              Map Preview
            </h3>
            <div className="bg-gradient-to-br from-[#0F1115] to-[#16181D] rounded-lg h-96 flex items-center justify-center relative overflow-hidden border border-[rgba(136,136,136,0.25)]">
              {/* India Map Mockup */}
              <div className="relative w-full h-full">
                <div className="absolute inset-0 flex items-center justify-center text-[#888888]">
                  <svg width="200" height="280" viewBox="0 0 200 280" fill="none">
                    <path d="M100 10 L120 40 L140 60 L145 90 L150 120 L145 150 L140 180 L130 210 L120 240 L110 270 L100 275 L90 270 L80 240 L70 210 L60 180 L55 150 L50 120 L55 90 L60 60 L80 40 Z"
                      fill="rgba(136,136,136,0.1)" stroke="#022683" strokeWidth="2" />
                  </svg>
                </div>
                {/* Pin indicators */}
                {locations.filter(loc => loc.enabled).map((loc, idx) => (
                 <div
  key={loc._id}
  className="absolute group"
  style={{
    left: `${20 + idx * 15}%`,
    top: `${30 + idx * 12}%`
  }}
>
  {/* Pin */}
  <div
    className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg animate-pulse cursor-pointer"
    style={{ backgroundColor: loc.pinColor }}
  >
    <MapPin className="w-4 h-4 text-white" />
  </div>

  {/* Tooltip */}
  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 
                  bg-[#0F1115] text-white text-xs px-3 py-1 rounded 
                  opacity-0 group-hover:opacity-100 
                  transition-all duration-300 whitespace-nowrap 
                  border border-[rgba(136,136,136,0.25)] shadow-lg">
    {loc.tooltip}
  </div>
</div>

                ))}
              </div>
            </div>
            <div className="mt-4 p-3 bg-gradient-to-r from-[rgba(2,38,131,0.2)] to-[rgba(136,136,136,0.2)] rounded-lg border border-[rgba(136,136,136,0.25)]">
              <p className="text-sm text-[#E6E6E6]">
                <strong>{locations.filter(loc => loc.enabled).length}</strong> active locations on map
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Location Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] p-6 rounded-lg w-[600px] border border-[rgba(136,136,136,0.25)] shadow-xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingLocation ? 'Edit Location' : 'Add Location'}
            </h3>

            <div className="space-y-4">
              {/* City and State */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-1">
                    City Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter city name"
                    value={formData.city}
                    onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value });
                      setFormErrors({ ...formErrors, city: '' });
                    }}
                    className={`w-full px-3 py-2 bg-[#0F1115] border ${formErrors.city ? 'border-red-500' : 'border-[rgba(136,136,136,0.25)]'} rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300`}
                  />
                  {formErrors.city && <p className="text-red-400 text-xs mt-1">{formErrors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter state"
                    value={formData.state}
                    onChange={(e) => {
                      setFormData({ ...formData, state: e.target.value });
                      setFormErrors({ ...formErrors, state: '' });
                    }}
                    className={`w-full px-3 py-2 bg-[#0F1115] border ${formErrors.state ? 'border-red-500' : 'border-[rgba(136,136,136,0.25)]'} rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300`}
                  />
                  {formErrors.state && <p className="text-red-400 text-xs mt-1">{formErrors.state}</p>}
                </div>
              </div>

              {/* Latitude and Longitude */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-1">
                    Latitude *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 19.0760"
                    value={formData.latitude}
                    onChange={(e) => {
                      setFormData({ ...formData, latitude: e.target.value });
                      setFormErrors({ ...formErrors, latitude: '' });
                    }}
                    className={`w-full px-3 py-2 bg-[#0F1115] border ${formErrors.latitude ? 'border-red-500' : 'border-[rgba(136,136,136,0.25)]'} rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300`}
                  />
                  {formErrors.latitude && <p className="text-red-400 text-xs mt-1">{formErrors.latitude}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#888888] mb-1">
                    Longitude *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 72.8777"
                    value={formData.longitude}
                    onChange={(e) => {
                      setFormData({ ...formData, longitude: e.target.value });
                      setFormErrors({ ...formErrors, longitude: '' });
                    }}
                    className={`w-full px-3 py-2 bg-[#0F1115] border ${formErrors.longitude ? 'border-red-500' : 'border-[rgba(136,136,136,0.25)]'} rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300`}
                  />
                  {formErrors.longitude && <p className="text-red-400 text-xs mt-1">{formErrors.longitude}</p>}
                </div>
              </div>

              {/* Tooltip */}
              <div>
                <label className="block text-sm font-medium text-[#888888] mb-1">
                  Tooltip Text *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Mumbai Head Office"
                  value={formData.tooltip}
                  onChange={(e) => {
                    setFormData({ ...formData, tooltip: e.target.value });
                    setFormErrors({ ...formErrors, tooltip: '' });
                  }}
                  className={`w-full px-3 py-2 bg-[#0F1115] border ${formErrors.tooltip ? 'border-red-500' : 'border-[rgba(136,136,136,0.25)]'} rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300`}
                />
                {formErrors.tooltip && <p className="text-red-400 text-xs mt-1">{formErrors.tooltip}</p>}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-[#888888] mb-1">
                  Office Address *
                </label>
    <textarea
      autoFocus
  placeholder="Enter full address"
  value={formData.address}
  onChange={(e) => {
    setFormData({
      ...formData,
      address: e.target.value
    });
  }}
 
                  rows={2}
                  className={`w-full px-3 py-2 bg-[#0F1115] border ${formErrors.address ? 'border-red-500' : 'border-[rgba(136,136,136,0.25)]'} rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300`}
                />
                {formErrors.address && <p className="text-red-400 text-xs mt-1">{formErrors.address}</p>}
              </div>

              {/* Pin Color */}
              <div>
                <label className="block text-sm font-medium text-[#888888] mb-1">
                  Pin Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.pinColor}
                    onChange={(e) => setFormData({ ...formData, pinColor: e.target.value })}
                    className="w-20 h-10 border border-[rgba(136,136,136,0.25)] rounded cursor-pointer bg-[#0F1115]"
                  />
                  <span className="text-[#E6E6E6] text-sm">{formData.pinColor}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                disabled={loading}
                className="px-4 py-2 bg-[rgba(136,136,136,0.3)] text-[#E6E6E6] rounded hover:bg-[rgba(136,136,136,0.4)] transition-all duration-300 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveLocation}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{editingLocation ? 'Update' : 'Add'} Location</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 right-8 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in z-50">
          {toast}
        </div>
      )}
      {/* Delete Confirmation Modal */}
{showDeleteModal && (
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
      Delete Location
    </h3>

    <p className="text-sm text-[#888888] mb-6">
      Are you sure you want to delete this location? This action cannot be undone.
    </p>

    <div className="flex justify-end gap-3">
      <button
        onClick={() => {
          setShowDeleteModal(false);
          setDeleteId(null);
        }}
        className="px-4 py-2 rounded-lg bg-[rgba(136,136,136,0.2)] text-white hover:bg-[rgba(136,136,136,0.3)] transition-all"
      >
        Cancel
      </button>

      <button
        onClick={handleDelete}
        className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all"
      >
        Delete
      </button>
    </div>

  </div>
</div>

)}

    </div>
  );
}
