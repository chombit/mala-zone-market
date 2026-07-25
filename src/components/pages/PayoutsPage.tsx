import React from "react";
import { X } from "lucide-react";
import MalaAgentsPayoutHub from "../MalaAgentsPayoutHub";
import { useLanguage } from "@/contexts/ZoneLanguageContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Navigate } from "react-router-dom";

interface PayoutsPageProps {
  onBack: () => void;
}

const PayoutsPage: React.FC<PayoutsPageProps> = ({ onBack }) => {
  const { language } = useLanguage();
  const { isAuthenticated, loading } = useAdminAuth();
  const isAmharic = language === "amharic";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A86B]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Premium minimal header */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 relative z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-end">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all duration-300"
            title={isAmharic ? "ዝጋ" : "Close"}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <main className="py-8">
        <MalaAgentsPayoutHub />
      </main>
    </div>
  );
};

export default PayoutsPage;
