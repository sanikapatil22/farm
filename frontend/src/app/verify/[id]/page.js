'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
    Leaf, 
    Shield, 
    MapPin, 
    Calendar, 
    Loader2, 
    Sprout, 
    Droplets, 
    FlaskConical, 
    Bug, 
    Scissors, 
    PackageCheck, 
    Truck,
    CheckCircle2,
    Clock,
    ExternalLink
} from 'lucide-react';

const ACTIVITY_ICONS = {
    'SEEDING': Sprout,
    'WATERING': Droplets,
    'FERTILIZER': FlaskConical,
    'PESTICIDE': Bug,
    'HARVEST': Scissors,
    'PACKED': PackageCheck,
    'SHIPPED': Truck
};

const ACTIVITY_COLORS = {
    'SEEDING': 'bg-yellow-100 text-yellow-700',
    'WATERING': 'bg-blue-100 text-blue-700',
    'FERTILIZER': 'bg-amber-100 text-amber-700',
    'PESTICIDE': 'bg-red-100 text-red-700',
    'HARVEST': 'bg-green-100 text-green-700',
    'PACKED': 'bg-purple-100 text-purple-700',
    'SHIPPED': 'bg-emerald-100 text-emerald-700'
};

export default function VerifyBatchPage() {
    const { t } = useTranslation();
    const params = useParams();
    const [batch, setBatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = async (id) => {
        try {
            setLoading(true);
            const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL;
            let derivedApiBase = '';
            if (graphqlUrl) {
                try {
                    derivedApiBase = new URL(graphqlUrl).origin;
                } catch (_) {
                    derivedApiBase = '';
                }
            }
            const apiBase =
                process.env.NEXT_PUBLIC_API_URL ||
                derivedApiBase ||
                'http://localhost:4000';

            const response = await fetch(`${apiBase}/api/batch/${id}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || t('batch_not_found', 'Batch not found'));
            }

            setBatch(data);
        } catch (err) {
            console.error('Error fetching batch:', err);
            setError(err.message || t('verify_load_error', 'Failed to load verification data. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchData(params.id);
        }
    }, [params.id, t]);

    if (loading) return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-green-600" />
                <p className="text-stone-500 font-medium">{t('verifying_records')}</p>
            </div>
        </div>
    );

    if (error || !batch) return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-md w-full">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-xl font-bold text-stone-800 mb-2">{t('verification_failed')}</h1>
                <p className="text-stone-500">{error || t('invalid_qr')}</p>
            </div>
        </div>
    );

    const isOrganic = batch?.blockchain?.isOrganic && batch?.blockchain?.verified;
    const locationLabel = batch?.farm?.location?.pinCode
        ? `PIN ${batch.farm.location.pinCode}`
        : batch?.farm?.location?.latitude != null && batch?.farm?.location?.longitude != null
            ? `${batch.farm.location.latitude.toFixed(4)}, ${batch.farm.location.longitude.toFixed(4)}`
            : t('location_unavailable', 'Location unavailable');
    const etherscanUrl = batch?.blockchain?.latestTxEtherscanUrl || batch?.blockchain?.contractEtherscanUrl;

    return (
        <div className="min-h-screen bg-[#ecfdf5] pb-12 font-sans">
            {/* Header */}
            <div className="bg-[#064e3b] text-white pt-8 pb-20 px-4 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(255,255,255,0.8)_0%,transparent_60%)] animate-pulse-glow" />
                </div>
                
                <div className="max-w-md mx-auto relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-white/20">
                        <Leaf className="w-4 h-4 text-green-300" />
                        <span>{t('farmchain_verified')}</span>
                    </div>
                    
                    <h1 className="text-3xl font-bold mb-2 font-display">{batch.cropName}</h1>
                    <p className="text-green-100 text-lg opacity-90">{batch.variety} • {batch.cropCategory}</p>

                    {isOrganic && (
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mt-6 inline-flex items-center gap-2 bg-white text-[#064e3b] px-6 py-2.5 rounded-full font-bold shadow-lg"
                        >
                            <Shield className="w-5 h-5 text-emerald-500 fill-emerald-500" />
                            {t('certified_organic', '100% Certified Organic')}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Content & Timeline */}
            <div className="max-w-md mx-auto px-4 -mt-12 relative z-20 space-y-6">
                
                {/* Farm Card */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/50"
                >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-xs text-stone-500 mb-1">{t('farm_name')}</p>
                            <p className="font-semibold text-stone-800">{batch.farm?.name || t('unknown_farm', 'Unknown farm')}</p>
                        </div>
                        <div>
                            <p className="text-xs text-stone-500 mb-1">{t('location')}</p>
                            <p className="font-semibold text-stone-800 flex items-center gap-1">
                                <MapPin className="w-4 h-4 text-green-600" />
                                {locationLabel}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-stone-500 mb-1">{t('sowing_date')}</p>
                            <p className="font-semibold text-stone-800 flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-green-600" />
                                {new Date(batch.sowingDate).toLocaleDateString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-stone-500 mb-1">{t('blockchain_status')}</p>
                            <p className="font-semibold text-stone-800">
                                {batch.blockchain?.verified ? t('verified_onchain') : t('not_verified')}
                            </p>
                        </div>
                    </div>

                    {etherscanUrl && (
                        <a
                            href={etherscanUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                        >
                            <ExternalLink className="h-4 w-4" />
                            {t('view_on_etherscan')}
                        </a>
                    )}
                </motion.div>

                {/* Journey Timeline */}
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-lg border border-white/50">
                    <h2 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-green-600" />
                        {t('farm_to_table')}
                    </h2>

                    <div className="relative pl-4 space-y-8">
                        {/* Line */}
                        <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-green-100" />

                        {batch.timeline?.map((activity, index) => {
                            const Icon = ACTIVITY_ICONS[activity.type] || Sprout;
                            const colorClass = ACTIVITY_COLORS[activity.type] || 'bg-gray-100 text-gray-700';
                            
                            return (
                                <motion.div 
                                    key={`${activity.type}-${activity.date}-${index}`}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.1 + 0.3 }}
                                    className="relative flex gap-4"
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-sm ${colorClass}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 pb-2">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-stone-800 capitalize">
                                                {activity.type.toLowerCase()}
                                            </h3>
                                            <span className="text-xs text-stone-400 font-medium">
                                                {new Date(activity.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        
                                        <p className="text-sm text-stone-600 mt-1">
                                            {activity.notes}
                                            {activity.notes && activity.quantity && ' • '}
                                            {activity.quantity && `${activity.quantity} ${activity.type === 'WATERING' ? 'L' : 'kg'}`}
                                        </p>

                                        {/* Blockchain Badges */}
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {activity.blockchainStatus === 'confirmed' && (
                                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] text-emerald-700 font-medium">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    {t('on_chain')}
                                                </div>
                                            )}
                                            {activity.isOrganic && (
                                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 border border-green-100 text-[10px] text-green-700 font-medium">
                                                    <Leaf className="w-3 h-3" />
                                                    {t('organic')}
                                                </div>
                                            )}
                                            
                                            {activity.blockchainTxHash && (
                                                <a 
                                                    href={`https://sepolia.etherscan.io/tx/${activity.blockchainTxHash}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[10px] text-blue-600 font-medium hover:bg-blue-100 transition-colors"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                    {t('proof')}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center pb-8 opacity-60">
                    <p className="text-xs text-[#064e3b] font-medium flex items-center justify-center gap-1">
                        <Shield className="w-3 h-3" />
                        {t('secured_by_blockchain')}
                    </p>
                </div>
            </div>
        </div>
    );
}
