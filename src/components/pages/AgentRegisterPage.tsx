/**
 * AgentRegisterPage.tsx
 * Malazone.com — Standalone Mala-Agent registration page (direct link).
 * Opens the registration form immediately; on success routes to agent sign-in.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import AgentRegistrationModal from "../AgentRegistrationModal";
import { useLanguage } from "@/contexts/ZoneLanguageContext";

const AgentRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isAm = language === "amharic";

  return (
    <div className="min-h-screen w-full bg-slate-900 text-white flex flex-col items-center justify-center">
      <AgentRegistrationModal
        isOpen
        onClose={() => navigate("/")}
        onSuccess={() => navigate("/agent/login")}
      />
      <div className="relative z-10 max-w-md text-center space-y-2 px-6">
        <div className="tracking-tight font-black text-2xl">
          <span className="text-[#00A86B]">MALA</span>
          <span className="text-white">ZONE</span>
        </div>
        <p className="text-white/40 text-sm font-semibold">
          {isAm ? "የማላ-ኤጀንት ምዝገባ" : "Mala-Agent Registration"}
        </p>
      </div>
    </div>
  );
};

export default AgentRegisterPage;