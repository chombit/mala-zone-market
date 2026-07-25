/**
 * AgentDashboard.tsx
 * Malazone.com — Agent Dashboard Component
 * Comprehensive dashboard for Mala-Agents with earnings, listings, and profile management
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useEffect, useMemo } from 'react';
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
  AlertCircle,
  Edit3,
  Save,
  X,
  Trash2
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
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'earnings' | 'payout'>('overview');
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

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: '', sub_city: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Listing edit state
  const [editingListingId, setEditingListingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({
    title_en: '', title_am: '', category: 'property', price: '',
    price_suffix: 'fixed', location_key: 'hawassa_piassa',
    description_en: '', description_am: '', whatsapp: '',
  });
  const [editExistingImages, setEditExistingImages] = useState<string[]>([]);
  const [editNewImages, setEditNewImages] = useState<File[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Earnings state
  const [earnings, setEarnings] = useState<any[]>([]);
  const [earningsSummary, setEarningsSummary] = useState({ total_earned: 0, total_paid: 0, total_pending: 0 });
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [earningsPage, setEarningsPage] = useState(1);
  const [earningsTotalPages, setEarningsTotalPages] = useState(1);

  // Payout state
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutPhone, setPayoutPhone] = useState('');
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutError, setPayoutError] = useState('');
  const [payoutSuccess, setPayoutSuccess] = useState('');
  const [payoutHistory, setPayoutHistory] = useState<any[]>([]);
  const [payoutHistoryLoading, setPayoutHistoryLoading] = useState(false);

  // Create and revoke object URLs for image previews to prevent memory leaks
  const imagePreviewUrls = useMemo(
    () => createImages.map((file) => URL.createObjectURL(file)),
    [createImages]
  );

  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviewUrls]);

  useEffect(() => {
    if (agent) {
      fetchAgentListings();
    }
  }, [agent]);

  useEffect(() => {
    if (activeTab === 'earnings' && agent) {
      fetchEarnings(1);
    }
    if (activeTab === 'payout' && agent) {
      fetchPayoutHistory();
    }
  }, [activeTab, agent]);

  const fetchAgentListings = async () => {
    try {
      const response = await fetch('/api/agents/me/listings', { credentials: 'include' });
      if (response.status === 401) {
        navigate('/agent/login');
        return;
      }
      const data = await response.json();
      if (data.success) {
        setListings(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEarnings = async (page: number = 1) => {
    setEarningsLoading(true);
    try {
      const response = await fetch(`/api/agents/me/earnings?page=${page}&limit=10`, { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setEarnings(data.data);
        setEarningsSummary(data.summary);
        setEarningsTotalPages(data.pagination.totalPages);
        setEarningsPage(page);
      }
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
    } finally {
      setEarningsLoading(false);
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

  const handleStartEditProfile = () => {
    setProfileForm({ full_name: agent?.full_name || '', sub_city: agent?.sub_city || '' });
    setProfileError('');
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!profileForm.full_name.trim() || profileForm.full_name.trim().length < 3) {
      setProfileError(isAmharic ? 'ሙሉ ስም ቢያንስ 3 ቁምፊ መሆን አለበት' : 'Name must be at least 3 characters');
      return;
    }
    if (!profileForm.sub_city.trim()) {
      setProfileError(isAmharic ? 'አካባቢ ያስፈልጋል' : 'Location is required');
      return;
    }
    setProfileSaving(true);
    setProfileError('');
    try {
      const response = await fetch('/api/agents/me/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profileForm),
      });
      const data = await response.json();
      if (data.success) {
        await refreshAgent();
        setIsEditingProfile(false);
      } else {
        setProfileError(data.message || 'Failed to update profile');
      }
    } catch {
      setProfileError('Network error');
    } finally {
      setProfileSaving(false);
    }
  };

  // Listing edit/delete handlers
  const handleStartEdit = async (listing: Listing) => {
    try {
      const response = await fetch(`/api/agents/listings/${listing.id}`, { credentials: 'include' });
      const data = await response.json();
      if (data.success && data.data) {
        const l = data.data;
        setEditFormData({
          title_en: l.title_en || '',
          title_am: l.title_am || '',
          category: l.category || 'property',
          price: l.price?.toString() || '',
          price_suffix: l.price_suffix || 'fixed',
          location_key: l.location_key || 'hawassa_piassa',
          description_en: l.description_en || '',
          description_am: l.description_am || '',
          whatsapp: l.whatsapp || '',
        });
        setEditExistingImages(l.images || []);
        setEditNewImages([]);
        setEditingListingId(listing.id);
        setEditError('');
      }
    } catch {
      setEditError('Failed to load listing');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListingId) return;
    setEditLoading(true);
    setEditError('');
    try {
      const fd = new FormData();
      fd.append('title_en', editFormData.title_en);
      fd.append('title_am', editFormData.title_am);
      fd.append('category', editFormData.category);
      fd.append('price', editFormData.price);
      fd.append('price_suffix', editFormData.price_suffix);
      fd.append('location_key', editFormData.location_key);
      fd.append('description_en', editFormData.description_en);
      fd.append('description_am', editFormData.description_am);
      fd.append('whatsapp', editFormData.whatsapp);
      fd.append('existing_images', JSON.stringify(editExistingImages));
      editNewImages.forEach((file) => fd.append('images', file));

      const response = await fetch(`/api/agents/listings/${editingListingId}`, {
        method: 'PUT',
        credentials: 'include',
        body: fd,
      });
      const data = await response.json();
      if (data.success) {
        setEditingListingId(null);
        await fetchAgentListings();
      } else {
        setEditError(data.message || 'Failed to update listing');
      }
    } catch {
      setEditError('Network error');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteListing = async (id: number) => {
    if (!window.confirm(isAmharic ? 'ይህንን ዝርዝር መሰረዝ መፈልግዎን እርግጠኛ ነዎት؟' : 'Are you sure you want to delete this listing?')) return;
    setDeletingId(id);
    try {
      const response = await fetch(`/api/agents/listings/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        await fetchAgentListings();
      }
    } catch {
      console.error('Failed to delete listing');
    } finally {
      setDeletingId(null);
    }
  };

  // Payout handlers
  const fetchPayoutHistory = async () => {
    setPayoutHistoryLoading(true);
    try {
      const response = await fetch('/api/agents/payout/history', { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setPayoutHistory(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch payout history:', error);
    } finally {
      setPayoutHistoryLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    const amount = Number(payoutAmount);
    if (!amount || amount <= 0) {
      setPayoutError(isAmharic ? 'ትክክለኛ መጠን ያስገቡ' : 'Enter a valid amount');
      return;
    }
    if (!payoutPhone.trim()) {
      setPayoutError(isAmharic ? 'የቴሌብር ስልክ ቁጥር ያስፈልጋል' : 'TeleBirr phone number is required');
      return;
    }
    setPayoutLoading(true);
    setPayoutError('');
    setPayoutSuccess('');
    try {
      const response = await fetch('/api/agents/payout/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount_etb: amount, telebirr_phone: payoutPhone }),
      });
      const data = await response.json();
      if (data.success) {
        setPayoutSuccess(isAmharic ? 'ጥያቄ ተልኳል! በ48 ሰዓት ውስጥ ይፈትኛል።' : 'Request submitted! Processing within 48 hours.');
        setPayoutAmount('');
        setPayoutPhone('');
        await refreshAgent();
        await fetchPayoutHistory();
      } else {
        setPayoutError(data.message || 'Failed to submit request');
      }
    } catch {
      setPayoutError('Network error');
    } finally {
      setPayoutLoading(false);
    }
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
    payout: isAmharic ? 'ክፍያ' : 'Payout',
    requestPayout: isAmharic ? 'ክፍያ ጠይቅ' : 'Request Payout',
    amount: isAmharic ? 'መጠን' : 'Amount',
    telebirrPhone: isAmharic ? 'የቴሌብር ስልክ' : 'TeleBirr Phone',
    payoutHistory: isAmharic ? 'የክፍያ ታሪክ' : 'Payout History',
    pending: isAmharic ? 'በመጠበቅ ላይ' : 'Pending',
    approved: isAmharic ? 'ተመዝግቧል' : 'Approved',
    paid: isAmharic ? 'ተከፍሏል' : 'Paid',
    rejected: isAmharic ? 'ተቋቋሟል' : 'Rejected',
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
            {(['overview', 'listings', 'earnings', 'payout'] as const).map((tab) => (
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {isAmharic ? 'የኤጀንት መገለጫ' : 'Agent Profile'}
                </h2>
                {!isEditingProfile && (
                  <button
                    onClick={handleStartEditProfile}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#00A86B] hover:bg-[#00A86B]/10 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    {isAmharic ? 'አርም' : 'Edit'}
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                <div className="space-y-4">
                  {profileError && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                      {profileError}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      {isAmharic ? 'ሙሉ ስም' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      {isAmharic ? 'አካባቢ' : 'Sub-City'}
                    </label>
                    <input
                      type="text"
                      value={profileForm.sub_city}
                      onChange={(e) => setProfileForm({ ...profileForm, sub_city: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      {isAmharic ? 'ሰርዝ' : 'Cancel'}
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={profileSaving}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00A86B] text-white text-sm font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
                    >
                      {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {isAmharic ? 'አስቀምጥ' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
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
                      <p className={`font-medium ${
                        agent.status === 'active' ? 'text-emerald-600' :
                        agent.status === 'pending' ? 'text-amber-600' :
                        'text-red-600'
                      }`}>{agent.status}</p>
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
              )}
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
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {isAmharic ? 'ተግባራት' : 'Actions'}
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
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleStartEdit(listing)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-[#00A86B] hover:bg-[#00A86B]/10 transition-colors"
                                title={isAmharic ? 'አርም' : 'Edit'}
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteListing(listing.id)}
                                disabled={deletingId === listing.id}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
                                title={isAmharic ? 'ሰርዝ' : 'Delete'}
                              >
                                {deletingId === listing.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
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

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                    <Wallet className="w-5 h-5 text-[#00A86B]" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {isAmharic ? 'ጠቅላላ ገቢ' : 'Total Earned'}
                  </span>
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {earningsSummary.total_earned.toLocaleString()} ETB
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {isAmharic ? 'የተከፈለ' : 'Paid'}
                  </span>
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {earningsSummary.total_paid.toLocaleString()} ETB
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {isAmharic ? 'በመጠበቅ ላይ' : 'Pending'}
                  </span>
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {earningsSummary.total_pending.toLocaleString()} ETB
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

            {/* Earnings History Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              {earningsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#00A86B]" />
                </div>
              ) : earnings.length === 0 ? (
                <div className="py-12 text-center">
                  <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 font-medium">
                    {isAmharic ? 'ገቢ ታሪክ የለም' : 'No earnings yet'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 dark:bg-slate-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {isAmharic ? 'ዝርዝር' : 'Listing'}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {isAmharic ? 'አይነት' : 'Type'}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {isAmharic ? 'መጠን' : 'Amount'}
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
                        {earnings.map((e) => (
                          <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-medium text-slate-900 dark:text-white text-sm">
                                {isAmharic ? e.title_am : e.title_en}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded">
                                {e.transaction_type === 'listing_sale' ? (isAmharic ? 'ሽያጭ' : 'Sale') : e.transaction_type}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-medium text-emerald-600 dark:text-emerald-400 text-sm">
                                +{Number(e.amount_etb).toLocaleString()} ETB
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-bold rounded ${
                                e.status === 'paid' 
                                  ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' 
                                  : 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
                              }`}>
                                {e.status === 'paid' ? (isAmharic ? 'የተከፈለ' : 'Paid') : (isAmharic ? 'በመጠበቅ ላይ' : 'Pending')}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                              {formatDate(e.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {earningsTotalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 dark:border-slate-800">
                      <button
                        onClick={() => fetchEarnings(earningsPage - 1)}
                        disabled={earningsPage <= 1}
                        className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-[#00A86B] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isAmharic ? 'ወደ ኋላ' : 'Previous'}
                      </button>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {earningsPage} / {earningsTotalPages}
                      </span>
                      <button
                        onClick={() => fetchEarnings(earningsPage + 1)}
                        disabled={earningsPage >= earningsTotalPages}
                        className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-[#00A86B] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isAmharic ? 'ወደ ፊት' : 'Next'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'payout' && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {t.payout}
            </h2>

            {/* Balance Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
                  <Wallet className="w-8 h-8 text-[#00A86B]" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{isAmharic ? 'ብድሮ ቀርቶ' : 'Available Balance'}</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">
                    {agent.earnings_total_etb.toLocaleString()} ETB
                  </p>
                </div>
              </div>

              {payoutSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm text-emerald-600 dark:text-emerald-400 mb-4">
                  {payoutSuccess}
                </div>
              )}
              {payoutError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 mb-4">
                  {payoutError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    {isAmharic ? 'መጠን (ETB)' : 'Amount (ETB)'}
                  </label>
                  <input
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none"
                    placeholder="0"
                    max={agent.earnings_total_etb}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    {isAmharic ? 'የቴሌብር ስልክ ቁጥር' : 'TeleBirr Phone Number'}
                  </label>
                  <input
                    type="text"
                    value={payoutPhone}
                    onChange={(e) => setPayoutPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none"
                    placeholder="09XXXXXXXX"
                  />
                </div>
                <button
                  onClick={handleRequestPayout}
                  disabled={payoutLoading || !payoutAmount || !payoutPhone}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#00A86B] text-white text-sm font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  {payoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                  {payoutLoading ? (isAmharic ? 'በመልቀቅ ላይ...' : 'Submitting...') : t.requestPayout}
                </button>
              </div>
            </div>

            {/* Payout History */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t.payoutHistory}</h3>
              </div>
              {payoutHistoryLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#00A86B]" />
                </div>
              ) : payoutHistory.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-slate-400 dark:text-slate-500 text-sm">
                    {isAmharic ? 'የክፍያ ታሪክ የለም' : 'No payout history yet'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{isAmharic ? 'መጠን' : 'Amount'}</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{isAmharic ? 'ስልክ' : 'Phone'}</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.status}</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.date}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {payoutHistory.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-medium text-slate-900 dark:text-white text-sm">{Number(p.amount_etb).toLocaleString()} ETB</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{p.telebirr_phone}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-bold rounded ${
                              p.status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                              : p.status === 'approved' ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400'
                              : p.status === 'rejected' ? 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                              : 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
                            }`}>
                              {p.status === 'paid' ? t.paid
                                : p.status === 'approved' ? t.approved
                                : p.status === 'rejected' ? t.rejected
                                : t.pending}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{formatDate(p.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
                          src={imagePreviewUrls[i]}
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

      {/* Edit Listing Modal */}
      {editingListingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditingListingId(null)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {isAmharic ? 'ዝርዝር አርም' : 'Edit Listing'}
              </h3>
              <button onClick={() => setEditingListingId(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <span className="text-slate-400 text-xl">&times;</span>
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                  {editError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {isAmharic ? 'ርዕስ (እንግሊዝኛ)' : 'Title (English)'} *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.title_en}
                  onChange={(e) => setEditFormData({...editFormData, title_en: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {isAmharic ? 'ርዕስ (አማርኛ)' : 'Title (Amharic)'} *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.title_am}
                  onChange={(e) => setEditFormData({...editFormData, title_am: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    {isAmharic ? 'ምድብ' : 'Category'}
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
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
                    value={editFormData.location_key}
                    onChange={(e) => setEditFormData({...editFormData, location_key: e.target.value})}
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
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    {isAmharic ? 'ዋጋ ዘይቤ' : 'Price Type'}
                  </label>
                  <select
                    value={editFormData.price_suffix}
                    onChange={(e) => setEditFormData({...editFormData, price_suffix: e.target.value})}
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
                {editExistingImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editExistingImages.map((url, i) => (
                      <div key={`existing-${i}`} className="relative group">
                        <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                        <button
                          type="button"
                          onClick={() => setEditExistingImages(prev => prev.filter((_, j) => j !== i))}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setEditNewImages(prev => [...prev, ...files].slice(0, 4 - editExistingImages.length));
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[#00A86B] file:text-white file:text-xs file:font-bold file:cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {isAmharic ? 'መግለጫ (እንግሊዝኛ)' : 'Description (English)'}
                </label>
                <textarea
                  rows={3}
                  value={editFormData.description_en}
                  onChange={(e) => setEditFormData({...editFormData, description_en: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {isAmharic ? 'መግለጫ (አማርኛ)' : 'Description (Amharic)'}
                </label>
                <textarea
                  rows={3}
                  value={editFormData.description_am}
                  onChange={(e) => setEditFormData({...editFormData, description_am: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  WhatsApp
                </label>
                <input
                  type="text"
                  value={editFormData.whatsapp}
                  onChange={(e) => setEditFormData({...editFormData, whatsapp: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#00A86B] outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingListingId(null)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  {isAmharic ? 'ሰርዝ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#00A86B] text-white text-sm font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  {editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editLoading ? (isAmharic ? 'በመስራት ላይ...' : 'Saving...') : (isAmharic ? 'አስቀምጥ' : 'Save Changes')}
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
