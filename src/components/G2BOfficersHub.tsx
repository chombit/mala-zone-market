/**
 * G2BOfficersHub.tsx
 * Malazone.com — G2B Officers Management Dashboard
 * Shows municipality and transport officers organized by cities
 * © 2026 Malazone Technologies PLC
 */

import React, { useState, useEffect } from "react";
import { MapPin, Users, Shield, ChevronRight, Activity, TrendingUp, CheckCircle } from "lucide-react";
import OfficerDetailModal from "./OfficerDetailModal";

interface AdminUser {
  id: number;
  username: string;
  full_name: string;
  role: string;
  city: string;
  sub_cities: string[];
  is_active: boolean;
  last_login: string;
  created_at: string;
}

interface Location {
  id: number;
  key_name: string;
  label_en: string;
  label_am: string;
  sub_zones: any[];
}

interface CityGroup {
  cityKey: string;
  cityLabel: string;
  officers: AdminUser[];
  totalOfficers: number;
  activeOfficers: number;
  municipalityCount: number;
  transportCount: number;
}

interface G2BOfficersHubProps {
  type: "municipality" | "transport";
}

const G2BOfficersHub: React.FC<G2BOfficersHubProps> = ({ type }) => {
  const [officers, setOfficers] = useState<AdminUser[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [cityGroups, setCityGroups] = useState<CityGroup[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedOfficer, setSelectedOfficer] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [type]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load both officers and locations
      const [officersRes, locationsRes] = await Promise.all([
        fetch("/api/admin/users", { credentials: "include" }),
        fetch("/api/admin/jurisdictions", { credentials: "include" })
      ]);

      const officersData = await officersRes.json();
      const locationsData = await locationsRes.json();

      if (officersData.success && locationsData.success) {
        setLocations(locationsData.jurisdictions);

        // Filter by role
        const roleFilter = type === "municipality" ? "g2b_municipality" : "g2b_transport";
        const filteredOfficers = officersData.users.filter((u: AdminUser) => u.role === roleFilter);
        setOfficers(filteredOfficers);

        // Group by city
        const grouped = filteredOfficers.reduce((acc: { [key: string]: AdminUser[] }, officer: AdminUser) => {
          const city = officer.city || "unassigned";
          if (!acc[city]) acc[city] = [];
          acc[city].push(officer);
          return acc;
        }, {});

        // Create city groups with analytics and proper labels
        const groups: CityGroup[] = Object.keys(grouped).map(cityKey => {
          const cityOfficers = grouped[cityKey];
          const locationData = locationsData.jurisdictions.find((loc: Location) => loc.key === cityKey);
          
          return {
            cityKey,
            cityLabel: locationData ? `${locationData.label_en} - ${locationData.label_am}` : cityKey === "unassigned" ? "Unassigned" : cityKey,
            officers: cityOfficers,
            totalOfficers: cityOfficers.length,
            activeOfficers: cityOfficers.filter(o => o.is_active).length,
            municipalityCount: cityOfficers.filter(o => o.role === "g2b_municipality").length,
            transportCount: cityOfficers.filter(o => o.role === "g2b_transport").length,
          };
        });

        setCityGroups(groups.sort((a, b) => b.totalOfficers - a.totalOfficers));
      }
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedCityData = cityGroups.find(g => g.cityKey === selectedCity);
  const selectedCityLabel = selectedCityData?.cityLabel || "";

  const handleEditOfficer = (officer: AdminUser) => {
    // This will be handled by parent component
    console.log("Edit officer:", officer);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-[#00A86B]" />
          <h1 className="text-2xl font-black text-malazone-navy tracking-tight">
            {type === "municipality" ? "Municipality Officers" : "Transport Officers"}
          </h1>
        </div>
        <p className="text-sm text-malazone-navy/60">
          Manage {type} officers organized by cities and jurisdictions
        </p>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#00A86B]/30 border-t-[#00A86B]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* City List */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-sm font-black text-malazone-navy uppercase tracking-wider px-1">
              Cities ({cityGroups.length})
            </h2>
            <div className="space-y-2">
              {cityGroups.map((group) => (
                <button
                  key={group.cityKey}
                  onClick={() => setSelectedCity(group.cityKey === selectedCity ? null : group.cityKey)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedCity === group.cityKey
                      ? "border-[#00A86B] bg-[#00A86B]/5"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className={`w-5 h-5 ${selectedCity === group.cityKey ? "text-[#00A86B]" : "text-malazone-navy/60"}`} />
                      <span className="font-bold text-malazone-navy">
                        {group.cityLabel}
                      </span>
                    </div>
                    <ChevronRight className={`w-5 h-5 transition-transform ${selectedCity === group.cityKey ? "rotate-90 text-[#00A86B]" : "text-malazone-navy/40"}`} />
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-malazone-navy/60" />
                      <span className="font-bold text-malazone-navy">{group.totalOfficers}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="w-4 h-4 text-green-600" />
                      <span className="font-bold text-green-700">{group.activeOfficers}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-2">
            {selectedCityData ? (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                {/* City Header */}
                <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-[#00A86B]/5 to-transparent">
                  <h2 className="text-2xl font-black text-malazone-navy mb-4">
                    {selectedCityData.cityLabel}
                  </h2>
                  
                  {/* Analytics Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-malazone-navy/60" />
                        <span className="text-xs font-bold text-malazone-navy/60 uppercase">Total</span>
                      </div>
                      <p className="text-2xl font-black text-malazone-navy">{selectedCityData.totalOfficers}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-bold text-green-700 uppercase">Active</span>
                      </div>
                      <p className="text-2xl font-black text-green-700">{selectedCityData.activeOfficers}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-[#00A86B]" />
                        <span className="text-xs font-bold text-[#00A86B] uppercase">Rate</span>
                      </div>
                      <p className="text-2xl font-black text-[#00A86B]">
                        {selectedCityData.totalOfficers > 0 
                          ? Math.round((selectedCityData.activeOfficers / selectedCityData.totalOfficers) * 100)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Officers List */}
                <div className="p-6">
                  <h3 className="text-sm font-black text-malazone-navy uppercase tracking-wider mb-4">
                    Officers ({selectedCityData.officers.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedCityData.officers.map((officer) => (
                      <button
                        key={officer.id}
                        onClick={() => setSelectedOfficer(officer)}
                        className="w-full p-4 rounded-xl border border-slate-200 hover:border-[#00A86B] hover:bg-[#00A86B]/5 transition-all text-left"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="h-12 w-12 bg-gradient-to-br from-[#00A86B] to-[#008F5B] rounded-full flex items-center justify-center text-white font-bold">
                              {officer.full_name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-malazone-navy">{officer.full_name}</p>
                              <p className="text-sm text-malazone-navy/60 font-mono">@{officer.username}</p>
                              {officer.sub_cities && officer.sub_cities.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {officer.sub_cities.map((subCity, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 text-xs font-bold bg-slate-100 text-malazone-navy rounded-md"
                                    >
                                      {subCity}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span
                              className={`px-3 py-1 text-xs font-black rounded-full ${
                                officer.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {officer.is_active ? "Active" : "Inactive"}
                            </span>
                            {officer.last_login && (
                              <span className="text-xs text-malazone-navy/60">
                                Last: {new Date(officer.last_login).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-20 text-center">
                <MapPin className="w-16 h-16 text-malazone-navy/20 mx-auto mb-4" />
                <p className="text-lg font-bold text-malazone-navy/60">
                  Select a city to view officers
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Officer Detail Modal */}
      {selectedOfficer && (
        <OfficerDetailModal
          officer={selectedOfficer}
          cityLabel={selectedCityLabel}
          onClose={() => setSelectedOfficer(null)}
          onEdit={handleEditOfficer}
        />
      )}
    </div>
  );
};

export default G2BOfficersHub;
