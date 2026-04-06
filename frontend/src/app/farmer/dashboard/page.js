"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import FarmerLayout from "@/components/farmer/FarmerLayout";
import CreateBatchModal from "@/components/farmer/CreateBatchModal";
import { useAuth } from "@/context/AuthContext";
import { graphqlRequest } from "@/lib/apollo-client";
import { MY_FARMS_QUERY } from "@/lib/graphql/farm";
import { LIST_BATCHES_QUERY } from "@/lib/graphql/batch";
import { MY_PRODUCTS_QUERY } from "@/lib/graphql/product";
import { usePrediction } from "@/hooks/usePrediction";
import {
  TrendingUp,
  Package,
  Activity,
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  DollarSign,
} from "lucide-react";

export default function FarmerDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  const [farmId, setFarmId] = useState(null);
  const [loadingFarm, setLoadingFarm] = useState(true);
  const [batches, setBatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [predictionMode, setPredictionMode] = useState("adaptive");

  useEffect(() => {
    if (!user) return; // Wait for auth

    const fetchFarm = async () => {
      try {
        const data = await graphqlRequest(MY_FARMS_QUERY);
        if (data?.myFarms?.length > 0) {
          setFarmId(data.myFarms[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch farms:", err);
      } finally {
        setLoadingFarm(false);
      }
    };
    fetchFarm();
  }, [user]);

  // Fetch batches and products when farmId is available
  useEffect(() => {
    const fetchData = async () => {
      if (!farmId) {
        setLoadingData(false);
        return;
      }
      
      try {
        const [batchesData, productsData] = await Promise.all([
          graphqlRequest(LIST_BATCHES_QUERY, { farm: farmId }),
          graphqlRequest(MY_PRODUCTS_QUERY)
        ]);
        
        setBatches(batchesData?.listBatches || []);
        setProducts(productsData?.myProducts || []);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoadingData(false);
      }
    };
    
    if (!loadingFarm) {
      fetchData();
    }
  }, [farmId, loadingFarm]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("good_morning");
    if (hour < 17) return t("good_afternoon");
    return t("good_evening");
  };

  const getFirstName = (name) => {
    if (!name) return "Farmer";
    return name.split(" ")[0];
  };

  // Calculate real stats from data
  const totalBatches = batches.length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  // Hardcoded display values for demo
  const totalSold = 2; // Hardcoded: 2 kg
  const totalEarnings = 120; // Hardcoded: $120

  const stats = [
    {
      label: t("total_batches"),
      value: totalBatches.toString(),
      change: totalBatches > 0 ? `${totalBatches} active` : "Start now",
      trend: "up",
      icon: Package,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-200",
    },
    {
      label: t("active_products"),
      value: activeProducts.toString(),
      change: products.length > 0 ? `of ${products.length} total` : "Create products",
      trend: "up",
      icon: Activity,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-200",
    },
    {
      label: t("total_sold"),
      value: `${totalSold.toFixed(0)} kg`,
      change: totalSold > 0 ? "Units sold" : "No sales yet",
      trend: totalSold > 0 ? "up" : "down",
      icon: DollarSign,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
      border: "border-violet-200",
    },
    {
      label: t("estimated_revenue"),
      value: `$${totalEarnings.toFixed(0)}`,
      change: totalEarnings > 0 ? "From sales" : "Pending",
      trend: totalEarnings > 0 ? "up" : "down",
      icon: TrendingUp,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-200",
    },
  ];

  // Get recent batches (last 5)
  const recentBatches = batches.slice(0, 5).map(batch => ({
    id: batch.id?.substring(0, 8) || 'N/A',
    product: batch.cropName || batch.cropCategory || 'Unknown',
    variety: batch.variety || '',
    status: batch.stateLabel || batch.currentState || 'Unknown',
    date: batch.sowingDate ? new Date(batch.sowingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'
  }));

  // Map status to colors
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('harvest') || statusLower.includes('complete')) return { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-600' };
    if (statusLower.includes('ship') || statusLower.includes('transit')) return { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-600' };
    if (statusLower.includes('grow') || statusLower.includes('process')) return { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-600' };
    return { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-600' };
  };

  // Recent activity from batches (inferred)
  const activityData = batches.slice(0, 4).map((batch, index) => ({
    action: index === 0 ? "Batch created" : batch.stateLabel || "Activity logged",
    batch: batch.cropName || batch.id?.substring(0, 8),
    time: batch.sowingDate ? `Sowed ${new Date(batch.sowingDate).toLocaleDateString()}` : "Recently",
    icon: index % 2 === 0 ? Package : CheckCircle2,
    color: index % 2 === 0 ? "bg-blue-500" : "bg-emerald-500",
  }));

  const latestBatch = batches[0] || null;
  const latestBatchActivities = latestBatch?.activities || [];
  const marketConditions = useMemo(() => {
    const activeProductsList = products.filter((product) => product.status === "active");
    const totalAvailableQty = products.reduce(
      (sum, product) => sum + Number(product.availableQty || 0),
      0,
    );
    const totalSoldQty = products.reduce(
      (sum, product) => sum + Number(product.soldQuantity || 0),
      0,
    );
    const totalPrice = products.reduce(
      (sum, product) => sum + Number(product.pricePerKg || 0),
      0,
    );
    const averageListingPrice = products.length > 0 ? totalPrice / products.length : 0;

    return {
      activeProducts: activeProductsList.length,
      totalProducts: products.length,
      totalAvailableQty,
      totalSoldQty,
      averageListingPrice,
      activeListingRatio: products.length > 0 ? activeProductsList.length / products.length : 0,
      inventoryPressure:
        totalAvailableQty > 0 || totalSoldQty > 0
          ? totalAvailableQty / Math.max(totalAvailableQty + totalSoldQty, 1)
          : 0,
    };
  }, [products]);

  const predictionInput = useMemo(() => ({
    crop: latestBatch?.cropName || latestBatch?.cropCategory || "default",
    location: latestBatch?.farmInfo?.pinCode || "",
    activities: latestBatchActivities,
    timeline: latestBatchActivities,
    quantity: latestBatch?.quantity || latestBatch?.availableQty || "",
    weather: latestBatch?.weather || null,
    soil: latestBatch?.soilType || null,
    sowingDate: latestBatch?.sowingDate || null,
    expectedHarvestDate: latestBatch?.expectedHarvestDate || null,
    history: latestBatchActivities.length > 0 ? latestBatchActivities : null,
    marketConditions
  }), [latestBatch, latestBatchActivities, marketConditions]);

  const prediction = usePrediction(predictionInput, predictionMode);

  const predictionSourceSummary = useMemo(() => {
    const logCount = latestBatchActivities.length;
    const activeListings = marketConditions.activeProducts;
    const pressure = marketConditions.inventoryPressure;
    const pressureLabel = pressure >= 0.66 ? "high market pressure" : pressure <= 0.33 ? "low market pressure" : "balanced market pressure";

    return `Derived from ${logCount} activity log${logCount === 1 ? "" : "s"} and ${activeListings} active listing${activeListings === 1 ? "" : "s"} with ${pressureLabel}.`;
  }, [latestBatchActivities.length, marketConditions.activeProducts, marketConditions.inventoryPressure]);

  const greetingText = getGreeting();
  const greetingClassName =
    greetingText === t("good_afternoon") ? "text-white" : "text-[#e6dbc4]";

  const modeBadgeLabel =
    prediction.modeUsed === "ai"
      ? "AI Mode"
      : predictionMode === "adaptive"
        ? "Adaptive Mode"
        : "Cache Mode";

  const modeOptions = [
    { value: "ai", label: "AI" },
    { value: "cache", label: "Cache" },
    { value: "adaptive", label: "Adaptive" }
  ];

  return (
    <FarmerLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          className="relative overflow-hidden bg-(--color-kombu-green) rounded-3xl p-8 md:p-10 text-(--color-tan) shadow-lg border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-(--color-tan)/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-(--color-moss-green)/12 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className={`text-3xl md:text-4xl font-bold mb-3 tracking-tight ${greetingClassName}`}>
                {greetingText}, {getFirstName(user?.name)}! 👋
              </h1>
              <p className="text-(--color-tan)/90 text-lg max-w-xl">
                {batches.length > 0 ? (
                  <>You have <span className="text-(--color-tan) font-bold">{batches.length} batches</span> and <span className="text-(--color-tan) font-bold">{activeProducts} active products</span>.</>
                ) : (
                  <>Get started by creating your first batch to track your farm production.</>
                )}
              </p>
            </div>
            <div className="flex gap-3">
              <motion.button
                onClick={() => setIsCreateBatchOpen(true)}
                className={`px-6 py-3.5 bg-(--color-kombu-green) hover:bg-(--color-moss-green) text-(--color-bone) rounded-xl font-bold shadow-lg shadow-black/10 transition-all flex items-center gap-2 ${loadingFarm ? 'opacity-70 cursor-wait' : ''}`}
                whileHover={{ scale: loadingFarm ? 1 : 1.05 }}
                whileTap={{ scale: loadingFarm ? 1 : 0.95 }}
                disabled={loadingFarm}
              >
                {loadingFarm ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Package className="w-5 h-5" />
                )}
                {t("create_batch")}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-emerald-100 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${
                    stat.trend === "up" ? "text-emerald-600" : "text-slate-500"
                  } bg-slate-50 px-2 py-1 rounded-lg`}
                >
                  {stat.change}
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">
                  {loadingData ? <Loader2 className="w-6 h-6 animate-spin" /> : stat.value}
                </h3>
                <p className="text-sm font-medium text-slate-500">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid lg:grid-cols-4 gap-8 items-start">
          {/* Recent Batches */}
          <motion.div
            className="lg:col-span-3 self-start bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {t("recent_batches")}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {t("track_latest_production")}
                </p>
              </div>
              <button 
                onClick={() => router.push('/farmer/batch-tracking')}
                className="text-emerald-600 hover:text-emerald-700 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-lg transition-colors"
              >
                {t("view_all")}
              </button>
            </div>
            <div className="overflow-hidden">
              {loadingData ? (
                <div className="flex justify-center items-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
              ) : recentBatches.length > 0 ? (
                <table className="w-full table-fixed">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Batch ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Variety
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Sowing Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentBatches.map((batch, index) => {
                      const statusColors = getStatusColor(batch.status);
                      return (
                        <motion.tr
                          key={index}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                          onClick={() => router.push('/farmer/batch-tracking')}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 + index * 0.05 }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-mono text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                              {batch.id}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-slate-900">
                              {batch.product}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-500">
                              {batch.variety || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusColors.bg} ${statusColors.text}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`}></span>
                              {batch.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Clock className="w-4 h-4" />
                              {batch.date}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
                  <p className="text-slate-500 font-medium">No batches yet</p>
                  <p className="text-slate-400 text-sm mt-1">Create your first batch to get started</p>
                  <button
                    onClick={() => setIsCreateBatchOpen(true)}
                    className="mt-4 px-4 py-2 bg-(--color-kombu-green) text-(--color-bone) rounded-lg font-medium text-sm hover:bg-(--color-moss-green) transition"
                  >
                    Create Batch
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <div className="space-y-6 self-start">
            <motion.div
              className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Recent Activity
              </h2>
              {activityData.length > 0 ? (
                <div className="space-y-6 relative">
                  {/* Timeline Line */}
                  <div className="absolute left-4.75 top-2 bottom-2 w-0.5 bg-slate-100"></div>

                  {activityData.map((activity, index) => (
                    <motion.div
                      key={index}
                      className="relative flex gap-4"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <div
                        className={`relative z-10 w-10 h-10 rounded-full ${activity.color} shadow-lg shadow-black/5 flex items-center justify-center text-white shrink-0`}
                      >
                        <activity.icon className="w-5 h-5" />
                      </div>
                      <div className="pt-1">
                        <p className="text-sm font-bold text-slate-900">
                          {activity.action}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                          {activity.batch} • {activity.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400 text-sm">No recent activity</p>
                </div>
              )}
            </motion.div>

            <motion.div
              className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="mb-4">
                <div className="inline-flex bg-slate-100 rounded-xl p-1 gap-1">
                  {modeOptions.map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => setPredictionMode(mode.value)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                        predictionMode === mode.value
                          ? "bg-emerald-600 text-white"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-slate-900 text-lg">📈 Prediction Insights</h3>
                <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-700">
                  {modeBadgeLabel}
                </span>
              </div>

              <p className="mb-4 text-xs font-medium text-slate-500 leading-5">
                {predictionSourceSummary}
              </p>

              <div className="space-y-4">
                <div className="rounded-xl border border-slate-100 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Expected Yield</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{prediction.yield}</p>
                </div>

                <div className="rounded-xl border border-slate-100 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Demand Forecast</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{prediction.demand}</p>
                </div>

                <div className="rounded-xl border border-slate-100 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Price Suggestion</p>
                  <p className="text-sm text-slate-700 mt-1">
                    Sell now: <span className="font-bold text-slate-900">{prediction.price?.sellNow}</span>
                  </p>
                  <p className="text-sm text-slate-700 mt-1">
                    Wait: <span className="font-bold text-emerald-700">{prediction.price?.wait}</span>
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-linear-to-br from-indigo-600 to-violet-700 rounded-3xl shadow-lg p-6 text-white relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <h3 className="font-bold text-lg mb-2">Pro Tip</h3>
                <p className="text-indigo-100 text-sm mb-4">
                  Log activities regularly to maintain accurate crop tracking and blockchain records.
                </p>
                <button 
                  onClick={() => router.push('/farmer/profile')}
                  className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition-colors"
                >
                  Verify Now
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <CreateBatchModal
        isOpen={isCreateBatchOpen}
        onClose={() => setIsCreateBatchOpen(false)}
        farmId={farmId}
        onSuccess={() => {
          // Refresh batches after creation
          if (farmId) {
            graphqlRequest(LIST_BATCHES_SIMPLE_QUERY, { farm: farmId })
              .then(data => setBatches(data?.listBatches || []))
              .catch(console.error);
          }
        }}
      />
    </FarmerLayout>
  );
}
