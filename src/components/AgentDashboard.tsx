/**
 * AgentDashboard.tsx
 * Malazone.com — Agent Dashboard Component
 * Comprehensive dashboard for Mala-Agents with earnings, listings, and profile management
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, 
  TrendingUp, 
  Package, 
  Phone, 
  MapPin, 
  Calendar, 
  LogOut, 
  RefreshCw,
  Plus,
  Eye,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useAgentAuth } from '../contexts/AgentAuthContext';
import { useLanguage } from '../contexts/ZoneLanguageContext';

interface Listing {
  id: number;
  title_en: string;
  title_am: string;
  category: string;
  price: number;
  price_suffix: string;
  is_active: boolean;
  view_count: number;
  created_at: string;
}

const AgentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { agent, logout, refreshAgent } = useAgentAuth();
  const { language } = useLanguage();
  const isAmharic = language === 'amharic';

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'earnings'>('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createFormData, setCreateFormData] = useState({
    title_en: '',
    title_am: '',
    category: 'property' as string,
    price: '',
    price_suffix: 'fixed',
    location_key: 'hawassa_piassa',
    description_en: '',
    description_am: '',
    whatsapp: '',
  });
  const [createImages, setCreateImages] = useState<File[]>([]);

  useEffect(() => {
    if (agent) {
      fetchAgentListings();
    }
  }, [agent]);

  const fetchAgentListings = async () => {
    try {
      const response = await fetch(`/api/listings?limit=50`);
      const data = await response.json();
      if (data.success) {
        // Filter listings for this agent
        const agentListings = data.data.filter((l: any) => l.phone === agent?.phone_number);
        setListings(agentListings);
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshAgent();
    await fetchAgentListings();
    setRefreshing(false);
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');
    try {
      const fd = new FormData();
      fd.append('phone', agent?.phone_number || '');
      fd.append('title_en', createFormData.title_en);
      fd.append('title_am', createFormData.title_am);
      fd.append('category', createFormData.category);
      fd.append('price', createFormData.price);
      fd.append('price_suffix', createFormData.price_suffix);
      fd.append('location_key', createFormData.location_key);
      fd.append('description_en', createFormData.description_en);
      fd.append('description_am', createFormData.description_am);
      fd.append('whatsapp', createFormData.whatsapp);
      createImages.forEach((file) => fd.append('images', file));

      const response = await fetch('/api/agents/listings', {
        method: 'POST',
        credentials: 'include',
        body: fd,
      });
      const data = await response.json();
      if (data.success) {
        setShowCreateModal(false);
        setCreateFormData({
          title_en: '', title_am: '', category: 'property', price: '',
          price_suffix: 'fixed', location_key: 'hawassa_piassa',
          description_en: '', description_am: '', whatsapp: '',
        });
        setCreateImages([]);
        await fetchAgentListings();
      } else {
        setCreateError(data.message || 'Failed to create listing');
      }
    } catch {
      setCreateError('Network error');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/agent/login');
  };

  const formatPrice = (price: number, suffix: string) => {
    const formatted = price.toLocaleString();
    if (suffix === 'per_day') return `${formatted} ETB/Day`;
    if (suffix === 'per_month') return `${formatted} ETB/Month`;
    if (suffix === 'per_hour') return `${formatted} ETB/Hour`;
    return `${formatted} ETB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isAmharic ? 'et-ET' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00A86B]" />
      </div>
    );
  }

  const t = {
    overview: isAmharic ? 'አጠቃላይ እይታ' : 'Overview',
    listings: isAmharic ? 'ዝርዝሮች' : 'My Listings',
    earnings: isAmharic ? 'ገቢዎች' : 'Earnings',
    totalEarnings: isAmharic ? 'ጠቅላላ ገቢ' : 'Total Earnings',
    activeListings: isAmharic ? 'ተግባራዊ ዝርዝሮች' : 'Active Listings',
    totalViews: isAmharic ? 'ጠቅላላ መመልከቻዎች' : 'Total Views',
    phone: isAmharic ? 'ስልክ' : 'Phone',
    location: isAmharic ? 'አካባቢ' : 'Location',
    status: isAmharic ? 'ሁኔታ' : 'Status',
    registered: isAmharic ? 'ተመዝግበዋል' : 'Registered',
    logout: isAmharic ? 'ውጣ' : 'Logout',
    refresh: isAmharic ? 'አድስ' : 'Refresh',
    addListing: isAmharic ? 'አዳስግም' : 'Add Listing',
    noListings: isAmharic ? 'ምንም ዝርዝሮች የሎትም' : 'No listings yet',
    active: isAmharic ? 'ተግባራዊ' : 'Active',
    inactive: isAmharic ? 'ተርፍ' : 'Inactive',
    views: isAmharic ? 'መመልከቻዎች' : 'Views',
    date: isAmharic ? 'ቀን' : 'Date',
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-black text-[#00A86B]">
                {isAmharic ? 'የማላ-ኤጀንት ዳሽቦርድ' : 'Mala-Agent Dashboard'}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {agent.full_name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={t.refresh}
              >
                <RefreshCw className={`w-5 h-5 text-slate-600 dark:text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors font-medium text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t.logout}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1">
            {(['overview', 'listings', 'earnings'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-[#00A86B] text-[#00A86B]'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {t[tab]}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Earnings Card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                    <Wallet className="w-6 h-6 text-[#00A86B]" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t.totalEarnings}
                  </span>
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">
                  {agent.earnings_total_etb.toLocaleString()} ETB
                </p>
              </div>

              {/* Listings Card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t.activeListings}
                  </span>
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">
                  {listings.filter(l => l.is_active).length}
                </p>
              </div>

              {/* Views Card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                    <Eye className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t.totalViews}
                  </span>
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white">
                  {listings.reduce((sum, l) => sum + (l.view_count || 0), 0)}
                </p>
              </div>
            </div>

            {/* Profile Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">
                {isAmharic ? 'የኤጀንት መገለጫ' : 'Agent Profile'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.phone}</p>
                    <p className="font-medium text-slate-900 dark:text-white">{agent.phone_number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.location}</p>
                    <p className="font-medium text-slate-900 dark:text-white">{agent.sub_city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.status}</p>
                    <p className="font-medium text-emerald-600">{agent.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.registered}</p>
                    <p className="font-medium text-slate-900 dark:text-white">{formatDate(agent.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {t.listings}
              </h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#00A86B] text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                {t.addListing}
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#00A86B]" />
              </div>
            ) : listings.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-12 border border-slate-200 dark:border-slate-800 text-center">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400 font-medium">{t.noListings}</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {isAmharic ? 'ርዕስ' : 'Title'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {isAmharic ? 'ምድብ' : 'Category'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {isAmharic ? 'ዋጋ' : 'Price'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {t.views}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {t.status}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {t.date}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {listings.map((listing) => (
                        <tr key={listing.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-medium text-slate-900 dark:text-white">
                              {isAmharic ? listing.title_am : listing.title_en}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded">
                              {listing.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-slate-900 dark:text-white">
                              {formatPrice(listing.price, listing.price_suffix)}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-600 dark:text-slate-400">{listing.view_count || 0}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {listing.is_active ? (
                              <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                                <CheckCircle2 className="w-4 h-4" />
                                {t.active}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-slate-400 text-sm font-medium">
                                <Clock className="w-4 h-4" />
                                {t.inactive}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {formatDate(listing.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'earnings' && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {t.earnings}
            </h2>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
                  <Wallet className="w-8 h-8 text-[#00A86B]" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t.totalEarnings}</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">
                    {agent.earnings_total_etb.toLocaleString()} ETB
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100 text-sm">
                      {isAmharic 
                        ? 'ገቢዎች በቴሌብር ይክፈላሉ' 
                        : 'Earnings are paid via TeleBirr'}
                    </p>
                    <p className="text-blue-700 dark:text-blue-300 text-xs mt-1">
                      {isAmharic 
                        ? 'የኮሚሽን ክፍያዎች በዝርዝር ይፈለግላሉ እና ቀጥታ ወደ ቴሌብር አካውንትዎ ይላካሉ።' 
                        : 'Commission payouts are processed regularly and sent directly to your TeleBirr account.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Placeholder for earnings history */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-12 border border-slate-200 dark:border-slate-800 text-center">
              <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                {isAmharic ? 'የገቢ ታሪክ በመጠናቀቅ ላይ ነው' : 'Earnings history coming soon'}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Create Listing Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{t.addListing}</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <span className="text-slate-400 text-xl">&times;</span>
              </button>
            </div>
            <form onSubmit={handleCreateListing} className="p-6 space-y-4">
              {createError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                  {createError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {isAmharic ? 'ርዕስ (እንግሊዝኛ)' : 'Title (English)'} *
                </label>
                <input
                  type="text"
                  required
                  value={createFormData.title_en}
                  onChange={(e) => setCreateFormData({...createFormData, title_en: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none"
                  placeholder="e.g. 3 Bedroom House in Tabor"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {isAmharic ? 'ርዕስ (አማርኛ)' : 'Title (Amharic)'} *
                </label>
                <input
                  type="text"
                  required
                  value={createFormData.title_am}
                  onChange={(e) => setCreateFormData({...createFormData, title_am: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none"
                  placeholder="e.g. በታቦር 3 መኝታ ክፍል ቤት"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    {isAmharic ? 'ምድብ' : 'Category'} *
                  </label>
                  <select
                    value={createFormData.category}
                    onChange={(e) => setCreateFormData({...createFormData, category: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none"
                  >
                    <option value="property">{isAmharic ? 'ንብረት' : 'Property'}</option>
                    <option value="motors">{isAmharic ? 'መኪና' : 'Motors'}</option>
                    <option value="stay">{isAmharic ? 'ማረፊያ' : 'Stay'}</option>
                    <option value="ceremony">{isAmharic ? 'ስርዓት' : 'Ceremony'}</option>
                    <option value="heavy">{isAmharic ? 'ከባድ ማሽን' : 'Heavy Machinery'}</option>
                    <option value="electronics">{isAmharic ? 'ኤሌክትሮኒክስ' : 'Electronics'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    {isAmharic ? 'አካባቢ' : 'Location'}
                  </label>
                  <select
                    value={createFormData.location_key}
                    onChange={(e) => setCreateFormData({...createFormData, location_key: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none"
                  >
                    <option value="hawassa_piassa">Piassa</option>
                    <option value="hawassa_tabor">Tabor</option>
                    <option value="hawassa_lakefront">Lakefront</option>
                    <option value="yirgalem">Yirgalem</option>
                    <option value="bensa">Bensa</option>
                    <option value="chuko">Chuko</option>
                    <option value="aleta_wondo">Aleta Wondo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    {isAmharic ? 'ዋጋ (ETB)' : 'Price (ETB)'}
                  </label>
                  <input
                    type="number"
                    value={createFormData.price}
                    onChange={(e) => setCreateFormData({...createFormData, price: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    {isAmharic ? 'ዋጋ ዘይቤ' : 'Price Type'}
                  </label>
                  <select
                    value={createFormData.price_suffix}
                    onChange={(e) => setCreateFormData({...createFormData, price_suffix: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none"
                  >
                    <option value="fixed">{isAmharic ? 'የተወሰነ' : 'Fixed'}</option>
                    <option value="per_day">{isAmharic ? 'በቀን' : 'Per Day'}</option>
                    <option value="per_month">{isAmharic ? 'በወራት' : 'Per Month'}</option>
                    <option value="per_hour">{isAmharic ? 'በሰዓት' : 'Per Hour'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {isAmharic ? 'ፎቶዎች (ከ4 በላይ)' : 'Photos (up to 4)'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setCreateImages(prev => [...prev, ...files].slice(0, 4));
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[#00A86B] file:text-white file:text-xs file:font-bold file:cursor-pointer"
                />
                {createImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {createImages.map((file, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt=""
                          className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                        />
                        <button
                          type="button"
                          onClick={() => setCreateImages(prev => prev.filter((_, j) => j !== i))}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {isAmharic ? 'መግለጫ (እንግሊዝኛ)' : 'Description (English)'}
                </label>
                <textarea
                  rows={3}
                  value={createFormData.description_en}
                  onChange={(e) => setCreateFormData({...createFormData, description_en: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {isAmharic ? 'መግለጫ (አማርኛ)' : 'Description (Amharic)'}
                </label>
                <textarea
                  rows={3}
                  value={createFormData.description_am}
                  onChange={(e) => setCreateFormData({...createFormData, description_am: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  WhatsApp
                </label>
                <input
                  type="text"
                  value={createFormData.whatsapp}
                  onChange={(e) => setCreateFormData({...createFormData, whatsapp: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none"
                  placeholder={isAmharic ? 'ቻርት ቴሌፍונו ቁጥር' : 'WhatsApp number'}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  {isAmharic ? 'ሰርዝ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#00A86B] text-white text-sm font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  {createLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {createLoading ? (isAmharic ? 'በመስራት ላይ...' : 'Creating...') : (isAmharic ? 'ያስገባ' : 'Create Listing')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;
