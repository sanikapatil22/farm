'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FarmerLayout from '@/components/farmer/FarmerLayout';
import { Sprout, MapPin, Edit, Eye, Plus, X, Loader2, Trash2, Mountain, Leaf } from 'lucide-react';
import ImageUpload from '@/components/common/ImageUpload';
import FarmMap from '@/components/farmer/FarmMap';
import { useTranslation } from 'react-i18next';
import { graphqlRequest } from '@/lib/apollo-client';
import { CREATE_FARM_MUTATION, MY_FARMS_QUERY, UPDATE_FARM_MUTATION, DELETE_FARM_MUTATION } from '@/lib/graphql/farm';

const SOIL_TYPES = ['Clay', 'Sandy', 'Loamy', 'Silt', 'Peat', 'Chalky', 'Black Cotton'];
const ORGANIC_STATUS = ['Organic', 'In Transition', 'Conventional'];

import { useAuth } from '@/context/AuthContext';

// ... 

export default function FarmManagement() {
    const { t } = useTranslation();
    const { user } = useAuth(); // Add this
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFarmModal, setShowFarmModal] = useState(false);
    const [showViewFarmModal, setShowViewFarmModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [editingFarm, setEditingFarm] = useState(null);
    const [selectedFarm, setSelectedFarm] = useState(null);

    const [farmFormData, setFarmFormData] = useState({
        latitude: '',
        longitude: '',
        size: '',
        pinCode: '',
        soilType: '',
        organicStatus: '',
        photo: ''
    });

    useEffect(() => {
        if (!user) return; // Wait for auth
        fetchFarms();
    }, [user]);

    const fetchFarms = async () => {
        try {
            setLoading(true);
            const data = await graphqlRequest(MY_FARMS_QUERY);
            setFarms(data.myFarms || []);
        } catch (err) {
            console.error('Error fetching farms:', err);
            if (!err.message.includes('Unauthorized')) {
                setError('Failed to load farms');
            }
        } finally {
            setLoading(false);
        }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFarmFormData(prev => ({
                        ...prev,
                        latitude: position.coords.latitude.toFixed(6),
                        longitude: position.coords.longitude.toFixed(6)
                    }));
                },
                (error) => {
                    console.error('Error getting location:', error);
                    alert('Could not get your location. Please enter manually.');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser');
        }
    };

    const updateCoordinatesFromMap = ({ latitude, longitude }) => {
        setFarmFormData(prev => ({
            ...prev,
            latitude,
            longitude
        }));
    };

    const resetForm = () => {
        setFarmFormData({
            latitude: '',
            longitude: '',
            size: '',
            pinCode: '',
            soilType: '',
            organicStatus: '',
            photo: ''
        });
        setEditingFarm(null);
        setError('');
    };

    const openAddModal = () => {
        resetForm();
        setShowFarmModal(true);
    };

    const openEditModal = (farm) => {
        setFarmFormData({
            latitude: farm.location.latitude.toString(),
            longitude: farm.location.longitude.toString(),
            size: farm.size.toString(),
            pinCode: farm.pinCode,
            soilType: farm.soilType,
            organicStatus: farm.organicStatus,
            photo: farm.photo
        });
        setEditingFarm(farm);
        setShowFarmModal(true);
    };

    const openViewModal = (farm) => {
        setSelectedFarm(farm);
        setShowViewFarmModal(true);
    };

    const handleFarmSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const variables = {
                location: {
                    latitude: parseFloat(farmFormData.latitude),
                    longitude: parseFloat(farmFormData.longitude)
                },
                size: parseFloat(farmFormData.size),
                pinCode: farmFormData.pinCode,
                soilType: farmFormData.soilType,
                organicStatus: farmFormData.organicStatus,
                photo: farmFormData.photo || 'https://via.placeholder.com/400x300?text=Farm'
            };

            if (editingFarm) {
                const data = await graphqlRequest(UPDATE_FARM_MUTATION, { id: editingFarm.id, ...variables });
                setFarms(prev => prev.map(f => f.id === editingFarm.id ? data.updateFarm : f));
            } else {
                const data = await graphqlRequest(CREATE_FARM_MUTATION, variables);
                setFarms(prev => [...prev, data.createFarm]);
            }

            setShowFarmModal(false);
            resetForm();
        } catch (err) {
            setError(err.message || 'Failed to save farm');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteFarm = async (farmId) => {
        if (!confirm('Are you sure you want to delete this farm? All associated batches will also be affected.')) return;

        try {
            await graphqlRequest(DELETE_FARM_MUTATION, { id: farmId });
            setFarms(prev => prev.filter(f => f.id !== farmId));
        } catch (err) {
            alert('Failed to delete farm: ' + err.message);
        }
    };

    if (loading) {
        return (
            <FarmerLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-10 h-10 animate-spin text-green-600" />
                </div>
            </FarmerLayout>
        );
    }

    return (
        <FarmerLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-stone-800">{t('my_farms')}</h1>
                        <p className="text-stone-500 mt-1">{t('manage_farm_locations')}</p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="px-6 py-3 bg-[var(--color-kombu-green)] text-[var(--color-bone)] rounded-xl font-semibold hover:bg-[var(--color-moss-green)] transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        {t('add_farm')}
                    </button>
                </div>

                {/* Farms Grid */}
                {farms.length === 0 ? (
                    <motion.div
                        className="bg-gradient-to-br from-stone-100 to-stone-200 rounded-3xl p-12 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Sprout className="w-16 h-16 mx-auto mb-4 text-green-600" />
                        <h2 className="text-2xl font-bold text-stone-800 mb-2">{t('no_farms_yet')}</h2>
                        <p className="text-stone-600 mb-6">{t('add_first_farm')}</p>
                        <button
                            onClick={openAddModal}
                            className="px-8 py-4 bg-[var(--color-kombu-green)] text-[var(--color-bone)] rounded-xl font-semibold hover:bg-[var(--color-moss-green)] transition-colors inline-flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            {t('add_first_farm')}
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {farms.map((farm, index) => (
                            <motion.div
                                key={farm.id}
                                className="bg-white rounded-3xl shadow-lg border border-stone-100 overflow-hidden group"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                {/* Farm Image */}
                                <div className="h-40 bg-gradient-to-br from-green-600 to-green-700 relative">
                                    {farm.photo && !farm.photo.includes('placeholder') ? (
                                        <img 
                                            src={farm.photo} 
                                            alt="Farm" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Sprout className="w-16 h-16 text-white/50" />
                                        </div>
                                    )}
                                    
                                    {/* Action Buttons */}
                                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => openViewModal(farm)}
                                            className="p-2 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                                            aria-label={t('view_farm')}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => openEditModal(farm)}
                                            className="p-2 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                                            aria-label="Edit farm"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteFarm(farm.id)}
                                            className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                            aria-label="Delete farm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Organic Badge */}
                                    <div className="absolute bottom-3 left-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            farm.organicStatus === 'Organic' 
                                                ? 'bg-green-100 text-green-700' 
                                                : farm.organicStatus === 'In Transition'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-stone-100 text-stone-700'
                                        }`}>
                                            <Leaf className="w-3 h-3 inline mr-1" />
                                            {farm.organicStatus}
                                        </span>
                                    </div>
                                </div>

                                {/* Farm Details */}
                                <div className="p-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-stone-600">
                                            <MapPin className="w-4 h-4 text-green-600" />
                                            <span className="font-medium">PIN: {farm.pinCode}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-stone-600">
                                            <Mountain className="w-4 h-4 text-green-600" />
                                            <span>{farm.size} Acres • {farm.soilType} Soil</span>
                                        </div>
                                        <div className="text-xs text-stone-400">
                                            📍 {farm.location.latitude.toFixed(4)}, {farm.location.longitude.toFixed(4)}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Farm Modal */}
            <AnimatePresence>
                {showFarmModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowFarmModal(false)}
                    >
                        <motion.div
                            className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-stone-800">
                                    {editingFarm ? t('edit_farm') : t('add_new_farm')}
                                </h2>
                                <button
                                    onClick={() => setShowFarmModal(false)}
                                    className="p-2 hover:bg-stone-100 rounded-xl transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {error && (
                                <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>
                            )}

                            <form onSubmit={handleFarmSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">
                                        {t('location_gps')} *
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="number"
                                            step="any"
                                            placeholder={t('latitude')}
                                            value={farmFormData.latitude}
                                            onChange={(e) => setFarmFormData(prev => ({ ...prev, latitude: e.target.value }))}
                                            required
                                            className="px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-green-500"
                                        />
                                        <input
                                            type="number"
                                            step="any"
                                            placeholder={t('longitude')}
                                            value={farmFormData.longitude}
                                            onChange={(e) => setFarmFormData(prev => ({ ...prev, longitude: e.target.value }))}
                                            required
                                            className="px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={getCurrentLocation}
                                        className="mt-2 text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                                    >
                                        <MapPin className="w-4 h-4" />
                                        {t('use_current_location')}
                                    </button>

                                    <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
                                        {farmFormData.latitude && farmFormData.longitude && Number.isFinite(Number(farmFormData.latitude)) && Number.isFinite(Number(farmFormData.longitude)) ? (
                                            <FarmMap
                                                latitude={farmFormData.latitude}
                                                longitude={farmFormData.longitude}
                                                onLocationChange={updateCoordinatesFromMap}
                                            />
                                        ) : (
                                            <div className="flex h-[300px] items-center justify-center px-6 text-center text-sm text-stone-500">
                                                {t('enter_valid_coordinates', 'Enter valid latitude and longitude to preview the farm location map.')}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">{t('farm_size')} *</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={farmFormData.size}
                                        onChange={(e) => setFarmFormData(prev => ({ ...prev, size: e.target.value }))}
                                        required
                                        placeholder="e.g., 5.5"
                                        className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">{t('pin_code')} * <span className="text-xs text-stone-400">(6 digits)</span></label>
                                    <input
                                        type="text"
                                        value={farmFormData.pinCode}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            setFarmFormData(prev => ({ ...prev, pinCode: value }));
                                        }}
                                        required
                                        pattern="[0-9]{6}"
                                        maxLength={6}
                                        placeholder="e.g., 500001"
                                        className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-green-500"
                                    />
                                    {farmFormData.pinCode && farmFormData.pinCode.length !== 6 && (
                                        <p className="text-xs text-red-500 mt-1">PIN code must be exactly 6 digits</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">{t('soil_type')} *</label>
                                    <select
                                        value={farmFormData.soilType}
                                        onChange={(e) => setFarmFormData(prev => ({ ...prev, soilType: e.target.value }))}
                                        required
                                        className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">{t('select_soil_type', 'Select soil type')}</option>
                                        {SOIL_TYPES.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">{t('organic_status')} *</label>
                                    <select
                                        value={farmFormData.organicStatus}
                                        onChange={(e) => setFarmFormData(prev => ({ ...prev, organicStatus: e.target.value }))}
                                        required
                                        className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">{t('select_status', 'Select status')}</option>
                                        {ORGANIC_STATUS.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>

                                <ImageUpload
                                    label={t('farm_photo')}
                                    value={farmFormData.photo}
                                    onChange={(base64) => setFarmFormData(prev => ({ ...prev, photo: base64 }))}
                                    maxSizeMB={5}
                                />

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            {t('saving', 'Saving...')}
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-5 h-5" />
                                            {editingFarm ? t('update_farm') : t('add_farm')}
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* View Farm Modal */}
            <AnimatePresence>
                {showViewFarmModal && selectedFarm && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowViewFarmModal(false)}
                    >
                        <motion.div
                            className="bg-white rounded-3xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h2 className="text-2xl font-bold text-stone-800">{t('view_farm')}</h2>
                                    <p className="text-sm text-stone-500">{t('read_only_farm_overview', 'Read-only farm overview and map preview')}</p>
                                </div>
                                <button
                                    onClick={() => setShowViewFarmModal(false)}
                                    className="p-2 hover:bg-stone-100 rounded-xl transition-colors"
                                    aria-label="Close farm details"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="grid gap-6 lg:grid-cols-2">
                                <div className="space-y-4">
                                    <div className="rounded-2xl border border-stone-200 p-4 bg-stone-50">
                                        <p className="text-xs uppercase tracking-wide text-stone-500">{t('pin_code')}</p>
                                        <p className="text-lg font-semibold text-stone-800">{selectedFarm.pinCode}</p>
                                    </div>
                                    <div className="rounded-2xl border border-stone-200 p-4 bg-stone-50">
                                        <p className="text-xs uppercase tracking-wide text-stone-500">{t('size', 'Size')}</p>
                                        <p className="text-lg font-semibold text-stone-800">{selectedFarm.size} Acres</p>
                                    </div>
                                    <div className="rounded-2xl border border-stone-200 p-4 bg-stone-50">
                                        <p className="text-xs uppercase tracking-wide text-stone-500">{t('soil_type')}</p>
                                        <p className="text-lg font-semibold text-stone-800">{selectedFarm.soilType}</p>
                                    </div>
                                    <div className="rounded-2xl border border-stone-200 p-4 bg-stone-50">
                                        <p className="text-xs uppercase tracking-wide text-stone-500">{t('organic_status')}</p>
                                        <p className="text-lg font-semibold text-stone-800">{selectedFarm.organicStatus}</p>
                                    </div>
                                    <div className="rounded-2xl border border-stone-200 p-4 bg-stone-50">
                                        <p className="text-xs uppercase tracking-wide text-stone-500">{t('coordinates')}</p>
                                        <p className="text-lg font-semibold text-stone-800">
                                            {Number(selectedFarm.location.latitude).toFixed(6)}, {Number(selectedFarm.location.longitude).toFixed(6)}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="overflow-hidden rounded-3xl border border-stone-200 bg-stone-50">
                                        <FarmMap
                                            latitude={selectedFarm.location.latitude}
                                            longitude={selectedFarm.location.longitude}
                                        />
                                    </div>
                                    <div className="rounded-2xl border border-stone-200 p-4 bg-white">
                                        <p className="text-sm text-stone-500 mb-2">{t('location_details', 'Location Details')}</p>
                                        <p className="text-stone-700">
                                            {t('location_details_description', 'This farm is pinned directly at the saved latitude and longitude. The map is read-only in this view.')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </FarmerLayout>
    );
}
