import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  Car,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Filter,
  Layers,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { useAdminAuth } from "../contexts/AdminAuthContext";

type PortalType = "municipality" | "transport";
type AuditStatus = "verified" | "fraudulent";
type AssetCategory = "all" | "land" | "house" | "business";

interface ApiPendingItem {
  id: number;
  title?: string;
  category: string;
  location_label_am?: string | null;
  location_label_en?: string | null;
  seller_name?: string | null;
  cata_registry?: string | null;
  plate_code?: string | null;
  chassis_number?: string | null;
  legal_document_url?: string | null;
  images?: unknown;
}

interface PendingResponse {
  success: boolean;
  data?: ApiPendingItem[];
  message?: string;
}

interface LandRecord {
  id: number;
  propertyId: string;
  sellerName: string;
  kebeleZoneLocation: string;
  deedImageUrl: string | null;
  registryCode: string;
  assetCategory: Exclude<AssetCategory, "all">;
  categoryLabelAm: string;
  code: string;
  docName: string;
  submittedDate: string;
}

interface VehicleRecord {
  id: number;
  vehicleType: string;
  sellerName: string;
  plateNumber: string;
  chassisNumber: string;
  libreImageUrl: string | null;
}

interface LandFormState {
  registryMatch: boolean;
  noCourtInjunctions: boolean;
  taxClear: boolean;
  digitalSignature: string;
  notes: string;
}

interface VehicleFormState {
  crimeCheck: boolean;
  ownershipMatch: boolean;
  digitalSignature: string;
  notes: string;
}

const createLandForm = (): LandFormState => ({
  registryMatch: false,
  noCourtInjunctions: false,
  taxClear: false,
  digitalSignature: "",
  notes: ""
});

const createVehicleForm = (): VehicleFormState => ({
  crimeCheck: false,
  ownershipMatch: false,
  digitalSignature: "",
  notes: ""
});

const fallbackLandRecords: LandRecord[] = [
  {
    id: 8104,
    propertyId: "MAL-LAND-8812",
    sellerName: "ታደሰ ገብረማርያም",
    kebeleZoneLocation: "ሐዋሳ፣ ታቦር ክፍለ-ከተማ",
    deedImageUrl: "https://placehold.co/960x720/f8fafc/0f172a?text=የሰነድ+ምስል",
    registryCode: "HAW-L-9921",
    assetCategory: "land",
    categoryLabelAm: "የመሬት ይዞታ (ቦታ)",
    code: "የካርታ ቁጥር: HAW-L-9921",
    docName: "የመሬት_ይዞታ_ማረጋገጫ_ደብተር.pdf",
    submittedDate: "ሰኔ 09/2018"
  },
  {
    id: 8112,
    propertyId: "MAL-HS-4011",
    sellerName: "አልማዝ በቀለ",
    kebeleZoneLocation: "ሐዋሳ፣ ሚሊኒየም ሰፈር",
    deedImageUrl: "https://placehold.co/960x720/f8fafc/0f172a?text=የሰነድ+ምስል",
    registryCode: "HAW-PL-0045",
    assetCategory: "house",
    categoryLabelAm: "የመኖሪያ ቤት",
    code: "የፕላን ቁጥር: HAW-PL-0045",
    docName: "የቤት_ባለቤትነት_ስምምነት_ሰነድ.jpg",
    submittedDate: "ሰኔ 12/2018"
  },
  {
    id: 8118,
    propertyId: "MAL-BZ-2201",
    sellerName: "ሮቤል ተስፋዬ",
    kebeleZoneLocation: "ሐዋሳ፣ ሜን ማርኬት ቀበሌ 04",
    deedImageUrl: "https://placehold.co/960x720/f8fafc/0f172a?text=የሰነድ+ምስል",
    registryCode: "HAW-BZ-7712",
    assetCategory: "business",
    categoryLabelAm: "የንግድ ድርጅት",
    code: "የካርታ / የፕላን ቁጥር: HAW-BZ-7712",
    docName: "የንግድ_ቦታ_ይዞታ_ማረጋገጫ.pdf",
    submittedDate: "ሰኔ 15/2018"
  }
];

const fallbackVehicleRecords: VehicleRecord[] = [
  {
    id: 9201,
    vehicleType: "Car",
    sellerName: "Abel Tadesse",
    plateNumber: "03-A-45891",
    chassisNumber: "JH4KA9650MC012845",
    libreImageUrl: "https://placehold.co/960x720/f8fafc/0f172a?text=የሰነድ+ምስል"
  },
  {
    id: 9207,
    vehicleType: "Bajaj",
    sellerName: "Rahel Mulugeta",
    plateNumber: "01-B-77214",
    chassisNumber: "MD2A76AZ8PWA44102",
    libreImageUrl: "https://placehold.co/960x720/f8fafc/0f172a?text=የሰነድ+ምስል"
  }
];

const parseImages = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.length > 0);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === "string" && item.length > 0)
        : [];
    } catch {
      return value.length > 0 ? [value] : [];
    }
  }

  return [];
};

const categoryLabelMap: Record<Exclude<AssetCategory, "all">, string> = {
  land: "የመሬት ካርታ",
  house: "የቤት ፕላን",
  business: "የንግድ ድርጅት"
};

const inferMunicipalityCategory = (title?: string): Exclude<AssetCategory, "all"> => {
  const normalized = (title || "").toLowerCase();

  if (normalized.includes("house") || normalized.includes("home") || normalized.includes("villa")) {
    return "house";
  }

  if (
    normalized.includes("business") ||
    normalized.includes("commercial") ||
    normalized.includes("shop") ||
    normalized.includes("company") ||
    normalized.includes("warehouse")
  ) {
    return "business";
  }

  return "land";
};

const normalizeLandRecord = (item: ApiPendingItem): LandRecord => {
  const fallbackImage = parseImages(item.images)[0] ?? null;
  const assetCategory = inferMunicipalityCategory(item.title);
  const registryCode = item.cata_registry || `MUN-ARCH-${item.id}`;

  return {
    id: item.id,
    propertyId: `PROP-${item.id}`,
    sellerName: item.seller_name || "Unknown Seller",
    kebeleZoneLocation:
      [item.location_label_en, item.location_label_am].filter(Boolean).join(" / ") || "Unspecified location",
    deedImageUrl: item.legal_document_url || fallbackImage,
    registryCode,
    assetCategory,
    categoryLabelAm: categoryLabelMap[assetCategory],
    code: `የካርታ ቁጥር: ${registryCode}`,
    docName: item.legal_document_url ? item.legal_document_url.split("/").pop() || "legal-document" : "municipality-upload",
    submittedDate: "በስርዓቱ የተጫነ"
  };
};

const normalizeVehicleRecord = (item: ApiPendingItem): VehicleRecord => {
  const fallbackImage = parseImages(item.images)[0] ?? null;

  return {
    id: item.id,
    vehicleType: item.title || "Vehicle",
    sellerName: item.seller_name || "Unknown Seller",
    plateNumber: item.plate_code || "PLATE-PENDING",
    chassisNumber: item.chassis_number || "VIN-PENDING",
    libreImageUrl: item.legal_document_url || fallbackImage
  };
};

const getDefaultOfficerProfile = (portal: PortalType) => {
  if (portal === "transport") {
    return {
      officerName: "Tigist A.",
      bureau: "Hawassa Transport Dept"
    };
  }

  return {
    officerName: "Tigist A.",
    bureau: "Hawassa City Municipality"
  };
};

const isPdfDocument = (url: string) => /\.pdf($|\?)/i.test(url);

const ethiopicFont = {
  fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans Ethiopic', Nyala, 'Power Nyala', sans-serif"
} as const;

interface QueuePanelProps {
  title: string;
  subtitle: string;
  countLabel: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const QueuePanel: React.FC<QueuePanelProps> = ({ title, subtitle, countLabel, icon, children }) => (
  <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
      <div className="space-y-1">
        <h2 className="flex items-center gap-3 text-lg font-black tracking-tight text-malazone-navy">
          <span className="rounded-2xl bg-emerald-50 p-2 text-[#00A86B]">{icon}</span>
          {title}
        </h2>
        <p className="text-sm text-malazone-navy">{subtitle}</p>
      </div>
      <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-[#00A86B]">
        {countLabel}
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

export default function GovernmentAuditDashboard({ overrideTab }: { overrideTab?: PortalType }) {
  const { user } = useAdminAuth();
  const [activePortal, setActivePortal] = useState<PortalType>(overrideTab || "municipality");
  const [propertyQueue, setPropertyQueue] = useState<LandRecord[]>(fallbackLandRecords);
  const [vehicleQueue, setVehicleQueue] = useState<VehicleRecord[]>(fallbackVehicleRecords);
  const [municipalityCategory, setMunicipalityCategory] = useState<AssetCategory>("all");
  const [municipalitySearch, setMunicipalitySearch] = useState("");
  const [municipalityReviewId, setMunicipalityReviewId] = useState<number | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(fallbackVehicleRecords[0]?.id ?? null);
  const [landForms, setLandForms] = useState<Record<number, LandFormState>>({});
  const [vehicleForms, setVehicleForms] = useState<Record<number, VehicleFormState>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [submittingKey, setSubmittingKey] = useState<string | null>(null);
  const [selectedDocUrl, setSelectedDocUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [municipalityApprovedCount, setMunicipalityApprovedCount] = useState(0);
  const [municipalityRejectedCount, setMunicipalityRejectedCount] = useState(0);

  useEffect(() => {
    if (overrideTab) {
      setActivePortal(overrideTab);
    }
  }, [overrideTab]);

  const officerProfile = useMemo(() => {
    const fallback = getDefaultOfficerProfile(activePortal);

    if (!user) {
      return fallback;
    }

    const bureau =
      user.role === "g2b_transport"
        ? "Hawassa Transport Dept"
        : user.role === "g2b_municipality"
          ? "Hawassa City Municipality"
          : activePortal === "transport"
            ? "Hawassa Transport Dept"
            : "Hawassa City Municipality";

    return {
      officerName: user.full_name || fallback.officerName,
      bureau
    };
  }, [activePortal, user]);

  const municipalityReviewRecord = useMemo(
    () => propertyQueue.find((record) => record.id === municipalityReviewId) ?? null,
    [municipalityReviewId, propertyQueue]
  );
  const selectedVehicle = useMemo(
    () => vehicleQueue.find((record) => record.id === selectedVehicleId) ?? null,
    [vehicleQueue, selectedVehicleId]
  );
  const filteredMunicipalityQueue = useMemo(() => {
    const query = municipalitySearch.trim().toLowerCase();

    return propertyQueue.filter((record) => {
      const matchesCategory = municipalityCategory === "all" ? true : record.assetCategory === municipalityCategory;
      const matchesSearch =
        query.length === 0
          ? true
          : [
              record.propertyId,
              record.sellerName,
              record.kebeleZoneLocation,
              record.code,
              record.categoryLabelAm,
              record.docName
            ]
              .join(" ")
              .toLowerCase()
              .includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [municipalityCategory, municipalitySearch, propertyQueue]);

  useEffect(() => {
    setLandForms((previous) => {
      const next = { ...previous };
      propertyQueue.forEach((record) => {
        if (!next[record.id]) {
          next[record.id] = createLandForm();
        }
      });
      return next;
    });
  }, [propertyQueue]);

  useEffect(() => {
    setVehicleForms((previous) => {
      const next = { ...previous };
      vehicleQueue.forEach((record) => {
        if (!next[record.id]) {
          next[record.id] = createVehicleForm();
        }
      });
      return next;
    });
  }, [vehicleQueue]);

  useEffect(() => {
    setSelectedVehicleId((current) => {
      if (current !== null && vehicleQueue.some((record) => record.id === current)) {
        return current;
      }
      return vehicleQueue[0]?.id ?? null;
    });
  }, [vehicleQueue]);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/g2b/pending");
      const payload = (await response.json()) as PendingResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to load pending compliance records.");
      }

      const incoming = payload.data ?? [];
      const land = incoming.filter((item) => item.category === "property").map(normalizeLandRecord);
      const vehicles = incoming.filter((item) => item.category === "motors").map(normalizeVehicleRecord);

      setPropertyQueue(land.length > 0 ? land : fallbackLandRecords);
      setVehicleQueue(vehicles.length > 0 ? vehicles : fallbackVehicleRecords);
    } catch (error) {
      console.error("Failed to fetch pending G2B audits:", error);
      setPropertyQueue(fallbackLandRecords);
      setVehicleQueue(fallbackVehicleRecords);
      setStatusMessage({
        tone: "error",
        text: "የቀጥታ የማረጋገጫ ወረፋ አልተገኘም። በምትኩ የውሳኔ ዝግጁ ምዝግቦች ታይተዋል።"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPending();
  }, [fetchPending]);

  const updateLandForm = (id: number, patch: Partial<LandFormState>) => {
    setLandForms((previous) => ({
      ...previous,
      [id]: {
        ...(previous[id] ?? createLandForm()),
        ...patch
      }
    }));
  };

  const updateVehicleForm = (id: number, patch: Partial<VehicleFormState>) => {
    setVehicleForms((previous) => ({
      ...previous,
      [id]: {
        ...(previous[id] ?? createVehicleForm()),
        ...patch
      }
    }));
  };

  const submitAudit = async (
    id: number,
    auditType: "land" | "vehicle",
    status: AuditStatus,
    notes: string
  ) => {
    setSubmittingKey(`${auditType}-${id}-${status}`);
    setStatusMessage(null);

    try {
      const response = await fetch(`/api/g2b/audit/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officer_name: officerProfile.officerName,
          audit_type: auditType,
          status,
          notes
        })
      });

      const payload = (await response.json()) as { success: boolean; message?: string };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Audit submission failed.");
      }

      if (auditType === "land") {
        setPropertyQueue((previous) => previous.filter((record) => record.id !== id));
        setLandForms((previous) => {
          const next = { ...previous };
          delete next[id];
          return next;
        });
        setMunicipalityReviewId((current) => (current === id ? null : current));
        if (status === "verified") {
          setMunicipalityApprovedCount((current) => current + 1);
        } else {
          setMunicipalityRejectedCount((current) => current + 1);
        }
      } else {
        setVehicleQueue((previous) => previous.filter((record) => record.id !== id));
        setVehicleForms((previous) => {
          const next = { ...previous };
          delete next[id];
          return next;
        });
      }

      setStatusMessage({
        tone: "success",
        text:
          status === "verified"
            ? "የማረጋገጫ ውሳኔ ተመዝግቧል እና ማረጋገጫ ጥያቄ ቀርቧል።"
            : "የማጭበርበር ማንቂያ ተመዝግቧል እና የክስ ጥያቄ ቀርቧል።"
      });
    } catch (error) {
      console.error("Failed to submit audit:", error);
      setStatusMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Unexpected audit submission error."
      });
    } finally {
      setSubmittingKey(null);
    }
  };

  const currentLandForm = municipalityReviewRecord ? landForms[municipalityReviewRecord.id] ?? createLandForm() : null;
  const currentVehicleForm = selectedVehicle ? vehicleForms[selectedVehicle.id] ?? createVehicleForm() : null;

  const landSignatureMatches =
    currentLandForm !== null &&
    currentLandForm.digitalSignature.trim().toLowerCase() === officerProfile.officerName.trim().toLowerCase();
  const vehicleSignatureMatches =
    currentVehicleForm !== null &&
    currentVehicleForm.digitalSignature.trim().toLowerCase() === officerProfile.officerName.trim().toLowerCase();

  const canVerifyLand = !!municipalityReviewRecord && !!currentLandForm;
  const canFlagLand =
    !!municipalityReviewRecord &&
    !!currentLandForm &&
    landSignatureMatches &&
    currentLandForm.notes.trim().length >= 10;

  const canVerifyVehicle =
    !!selectedVehicle &&
    !!currentVehicleForm &&
    currentVehicleForm.crimeCheck &&
    currentVehicleForm.ownershipMatch &&
    vehicleSignatureMatches;
  const canRejectVehicle =
    !!selectedVehicle &&
    !!currentVehicleForm &&
    vehicleSignatureMatches &&
    currentVehicleForm.notes.trim().length >= 10;

  return (
    <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-slate-50 text-malazone-navy shadow-sm" style={ethiopicFont}>
      <div className="border-b border-slate-200 bg-white px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div>
              <p className="text-3xl font-black tracking-tight text-[#00A86B]">
                malazone
              </p>
              <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-malazone-navy">
                የማዘጋጃ ቤት የሰነድ ማረጋገጫ ማዕከል | G2B Compliance Ledger
              </p>
            </div>
          </div>

          <div className="grid w-full gap-4 sm:grid-cols-3 lg:w-auto lg:min-w-[430px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-malazone-navy">Officer Session</p>
              <p className="mt-3 flex items-center gap-2 text-sm font-bold text-malazone-navy">
                <UserCheck className="h-4 w-4 text-[#00A86B]" />
                Officer: {officerProfile.officerName}
              </p>
              <p className="mt-2 text-xs text-malazone-navy">Bureau: {officerProfile.bureau}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-malazone-navy">Pending Deeds</p>
              <p className="mt-3 text-3xl font-black text-malazone-navy">{propertyQueue.length}</p>
              <p className="mt-1 text-xs text-malazone-navy">Municipality archive cross-check queue</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-malazone-navy">Pending Transport Logs</p>
              <p className="mt-3 text-3xl font-black text-malazone-navy">{vehicleQueue.length}</p>
              <p className="mt-1 text-xs text-malazone-navy">Vehicle ownership and crime status queue</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-100 px-6 py-6 sm:px-8">
        {statusMessage && statusMessage.tone === "success" && (
          <div
            className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800"
          >
            {statusMessage.text}
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#00A86B] bg-[#00A86B] px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/20"
            >
              <Building2 className="h-4 w-4" />
              Land & Deed Registry
            </button>
          </div>

          <button
            type="button"
            onClick={() => void fetchPending()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-malazone-navy transition hover:border-slate-300 hover:bg-slate-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh Queue
          </button>
        </div>

        {activePortal === "municipality" && (
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-malazone-navy">
                  ጠቅላላ የሚጠበቁ ማረጋገጫዎች
                </p>
                <p className="mt-2 text-3xl font-black text-malazone-navy">{propertyQueue.length}</p>
                <p className="mt-1 text-xs text-malazone-navy">የመሬት ካርታ፣ የቤት ፕላን እና የንግድ ድርጅት ሰነዶች</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600">
                  ዛሬ የጸደቁ መዝገቦች
                </p>
                <p className="mt-2 text-3xl font-black text-emerald-800">{municipalityApprovedCount}</p>
                <p className="mt-1 text-xs text-emerald-700">በ`malazone` ላይ ወደ verified badge የተላኩ</p>
              </div>
              <div className="rounded-2xl border border-red-100 bg-red-50 p-5 shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-red-600">ጉድለት ያለባቸው / ውድቅ የተደረጉ</p>
                <p className="mt-2 text-3xl font-black text-red-800">{municipalityRejectedCount}</p>
                <p className="mt-1 text-xs text-red-700">ጉድለት አለበት በሚል ለred alert የተላኩ</p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-white p-2 text-[#00A86B] shadow-sm">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">Auditor Security Session Key</p>
                    <p className="mt-2 text-sm font-black text-malazone-navy">{officerProfile.officerName}</p>
                    <p className="mt-1 text-xs font-medium text-malazone-navy">{officerProfile.bureau}</p>
                  </div>
                </div>
              </div>
            </div>

            <QueuePanel
              title="የማዘጋጃ ቤት የሰነድ ማረጋገጫ ማዕከል"
              subtitle="የይዞታ ማረጋገጫ ደብተር፣ የቤት ፕላን እና የንግድ ድርጅት ሰነዶችን በተለያዩ ምድቦች ያጣሩ፣ ይመርምሩ እና ውሳኔ ይስጡ።"
              countLabel={`${filteredMunicipalityQueue.length} በማጣሪያው ውስጥ`}
              icon={<Building2 className="h-5 w-5" />}
            >
              <div className="space-y-5">
                <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="mr-1 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-malazone-navy">
                      <Filter className="h-4 w-4" />
                      ምድብ ማጣሪያ
                    </div>
                    {([
                      { key: "all", label: "ሁሉም ማህደሮች" },
                      { key: "land", label: "የመሬት ካርታ" },
                      { key: "house", label: "የቤት ፕላን" },
                      { key: "business", label: "የንግድ ድርጅት" }
                    ] as const).map((category) => {
                      const isActive = municipalityCategory === category.key;

                      return (
                        <button
                          key={category.key}
                          type="button"
                          onClick={() => setMunicipalityCategory(category.key)}
                          className={`rounded-xl px-4 py-2 text-xs font-black transition ${
                            isActive
                              ? "bg-[#00A86B] text-white shadow"
                              : "border border-slate-200 bg-white text-malazone-navy hover:border-slate-300 hover:text-malazone-navy"
                          }`}
                        >
                          {category.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="relative w-full lg:w-80">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-malazone-navy" />
                    <input
                      type="text"
                      value={municipalitySearch}
                      onChange={(event) => setMunicipalitySearch(event.target.value)}
                      placeholder="በስም፣ በመለያ ቁጥር ወይም በካርታ ቁጥር ይፈልጉ..."
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-semibold text-malazone-navy outline-none transition focus:border-[#00A86B]"
                    />
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.2em] text-malazone-navy">
                        <tr>
                          <th className="px-4 py-[14px]">የማህደር ቁጥር (ID)</th>
                          <th className="px-4 py-[14px]">የባለይዞታው ሙሉ ስም</th>
                          <th className="px-4 py-[14px]">የንብረቱ ዓይነት</th>
                          <th className="px-4 py-[14px]">የይዞታው አድራሻ (ክፍለ-ከተማ/ቀበሌ)</th>
                          <th className="px-4 py-[14px]">የካርታ / የፕላን ቁጥር</th>
                          <th className="px-4 py-[14px]">የተጫነ ይፋዊ ሰነድ</th>
                          <th className="px-4 py-[14px] text-right">የኦዲት ውሳኔ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white text-malazone-navy">
                        {filteredMunicipalityQueue.map((record) => (
                          <tr key={record.id} className="transition hover:bg-slate-50/80">
                            <td className="px-4 py-[14px] font-black text-malazone-navy">{record.propertyId}</td>
                            <td className="px-4 py-[14px] font-semibold text-malazone-navy">{record.sellerName}</td>
                            <td className="px-4 py-[14px]">
                              <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-black text-malazone-navy">
                                {record.categoryLabelAm}
                              </span>
                            </td>
                            <td className="px-4 py-[14px] text-malazone-navy">{record.kebeleZoneLocation}</td>
                            <td className="px-4 py-[14px] font-mono text-xs font-bold text-malazone-navy">{record.code}</td>
                            <td className="px-4 py-[14px]">
                              <button
                                type="button"
                                onClick={() => setMunicipalityReviewId(record.id)}
                                className="inline-flex items-center gap-1.5 text-xs font-black text-blue-600 underline decoration-2 transition hover:text-blue-800"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                ይንኩትና ይመልከቱ
                              </button>
                            </td>
                            <td className="px-4 py-[14px] text-right">
                              <button
                                type="button"
                                onClick={() => setMunicipalityReviewId(record.id)}
                                className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black text-malazone-navy transition hover:border-[#00A86B]/30 hover:text-[#00A86B]"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                መርምርና ወስን
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredMunicipalityQueue.length === 0 && !loading && (
                          <tr>
                            <td colSpan={7} className="px-5 py-14 text-center text-sm text-malazone-navy">
                              በአሁኑ ማጣሪያ ውስጥ የሚጠበቁ ማረጋገጫ ሰነዶች የሉም።
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </QueuePanel>
          </div>
        )}

        {activePortal === "transport" && (
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <QueuePanel
              title="Vehicle Transport Log"
              subtitle="Validate transport records before certifying a verified badge request for a listed vehicle."
              countLabel={`${vehicleQueue.length} pending`}
              icon={<Car className="h-5 w-5" />}
            >
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.25em] text-malazone-navy">
                      <tr>
                        <th className="px-5 py-4">Vehicle Type</th>
                        <th className="px-5 py-4">Plate Number</th>
                        <th className="px-5 py-4">Chassis (VIN) Number</th>
                        <th className="px-5 py-4">Libre Image</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white text-sm text-malazone-navy">
                      {vehicleQueue.map((record) => (
                        <tr
                          key={record.id}
                          onClick={() => setSelectedVehicleId(record.id)}
                          className={`cursor-pointer transition ${
                            selectedVehicleId === record.id ? "bg-emerald-50/80" : "hover:bg-slate-50"
                          }`}
                        >
                          <td className="px-5 py-5 font-black text-malazone-navy">{record.vehicleType}</td>
                          <td className="px-5 py-5">{record.plateNumber}</td>
                          <td className="px-5 py-5 font-mono text-xs font-bold text-malazone-navy">{record.chassisNumber}</td>
                          <td className="px-5 py-5">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                if (record.libreImageUrl) {
                                  setSelectedDocUrl(record.libreImageUrl);
                                }
                              }}
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-malazone-navy transition hover:border-slate-300 hover:bg-slate-100"
                            >
                              <FileText className="h-4 w-4 text-[#00A86B]" />
                              {record.libreImageUrl ? "Preview Libre" : "No Upload"}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {vehicleQueue.length === 0 && !loading && (
                        <tr>
                          <td colSpan={4} className="px-5 py-12 text-center text-sm text-malazone-navy">
                            No vehicle transport logs are waiting for review.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </QueuePanel>

            <QueuePanel
              title="Transport Workbench"
              subtitle="Confirm crime status, ownership, and signature before certifying or rejecting the transport file."
              countLabel="Secure officer attestation"
              icon={<ShieldCheck className="h-5 w-5" />}
            >
              {selectedVehicle && currentVehicleForm ? (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-malazone-navy">Input Data</p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-malazone-navy">Vehicle Type</p>
                        <p className="mt-1 text-sm font-black text-malazone-navy">{selectedVehicle.vehicleType}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-malazone-navy">Seller Name</p>
                        <p className="mt-1 text-sm font-semibold text-malazone-navy">{selectedVehicle.sellerName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-malazone-navy">Plate Number</p>
                        <p className="mt-1 text-sm font-semibold text-malazone-navy">{selectedVehicle.plateNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-malazone-navy">Chassis (VIN) Number</p>
                        <p className="mt-1 rounded-full border border-slate-200 bg-white px-3 py-1 font-mono text-xs font-black text-malazone-navy">
                          {selectedVehicle.chassisNumber}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                      <p className="text-sm font-black text-malazone-navy">Libre Image</p>
                      {selectedVehicle.libreImageUrl && (
                        <button
                          type="button"
                          onClick={() => setSelectedDocUrl(selectedVehicle.libreImageUrl)}
                          className="inline-flex items-center gap-2 text-sm font-bold text-[#00A86B] transition hover:text-emerald-700"
                        >
                          <Eye className="h-4 w-4" />
                          Open Preview
                        </button>
                      )}
                    </div>
                    <div className="flex min-h-[240px] items-center justify-center bg-slate-100 p-4">
                      {selectedVehicle.libreImageUrl ? (
                        <img
                          src={selectedVehicle.libreImageUrl}
                          alt={`${selectedVehicle.plateNumber} libre preview`}
                          className="max-h-64 rounded-2xl border border-slate-200 bg-white object-contain shadow-sm"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-3 text-malazone-navy">
                          <FileText className="h-12 w-12" />
                          <p className="text-sm font-semibold">No libre image uploaded for preview.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-malazone-navy">የማረጋገጫ መስፈርቶች</p>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-black text-malazone-navy">Crime Check</p>
                          <p className="text-xs text-malazone-navy">Not Reported Stolen</p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateVehicleForm(selectedVehicle.id, {
                              crimeCheck: !currentVehicleForm.crimeCheck
                            })
                          }
                          className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-black transition ${
                            currentVehicleForm.crimeCheck
                              ? "bg-[#00A86B] text-white"
                              : "bg-white text-malazone-navy ring-1 ring-slate-200"
                          }`}
                        >
                          {currentVehicleForm.crimeCheck ? "Cleared" : "Pending Check"}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <label className="flex items-start gap-3 text-sm text-malazone-navy">
                        <input
                          type="checkbox"
                          checked={currentVehicleForm.ownershipMatch}
                          onChange={(event) =>
                            updateVehicleForm(selectedVehicle.id, {
                              ownershipMatch: event.target.checked
                            })
                          }
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#00A86B] focus:ring-[#00A86B]"
                        />
                        <span>
                          <span className="block font-black text-malazone-navy">Ownership Match</span>
                          Confirm the seller name matches the Libre record.
                        </span>
                      </label>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-black text-malazone-navy">የአረጋጋጩ ዲጂታል ፊርማ</label>
                      <input
                        type="text"
                        value={currentVehicleForm.digitalSignature}
                        onChange={(event) =>
                          updateVehicleForm(selectedVehicle.id, {
                            digitalSignature: event.target.value
                          })
                        }
                        placeholder={`ለማረጋገጥ "${officerProfile.officerName}" ብለው ይተይቡ`}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-malazone-navy outline-none transition focus:border-[#00A86B] focus:bg-white"
                      />
                      <p className={`mt-2 text-xs font-semibold ${vehicleSignatureMatches ? "text-[#00A86B]" : "text-malazone-navy"}`}>
                        Officer must type full name exactly: {officerProfile.officerName}
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-black text-malazone-navy">Audit Notes</label>
                      <textarea
                        rows={4}
                        value={currentVehicleForm.notes}
                        onChange={(event) =>
                          updateVehicleForm(selectedVehicle.id, {
                            notes: event.target.value
                          })
                        }
                        placeholder="Add certification notes or impound rationale."
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-malazone-navy outline-none transition focus:border-[#00A86B] focus:bg-white"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3">
                      <button
                        type="button"
                        disabled={!canRejectVehicle || submittingKey === `vehicle-${selectedVehicle.id}-fraudulent`}
                        onClick={() =>
                          void submitAudit(
                            selectedVehicle.id,
                            "vehicle",
                            "fraudulent",
                            `Reject / Impound Alert raised by ${officerProfile.officerName}. ${currentVehicleForm.notes.trim()}`
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-black text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:border-rose-100 disabled:bg-rose-50/70 disabled:text-rose-300"
                      >
                        {submittingKey === `vehicle-${selectedVehicle.id}-fraudulent` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                        Reject / Impound Alert
                      </button>
                      <button
                        type="button"
                        disabled={!canVerifyVehicle || submittingKey === `vehicle-${selectedVehicle.id}-verified`}
                        onClick={() =>
                          void submitAudit(
                            selectedVehicle.id,
                            "vehicle",
                            "verified",
                            `Crime Check: ${currentVehicleForm.crimeCheck ? "clear" : "pending"} | Ownership Match: ${
                              currentVehicleForm.ownershipMatch ? "confirmed" : "not confirmed"
                            } | Notes: ${currentVehicleForm.notes.trim() || "Transport record certified."}`
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00A86B] px-5 py-3 text-sm font-black text-malazone-navy shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-emerald-200 disabled:text-malazone-navy/50"
                      >
                        {submittingKey === `vehicle-${selectedVehicle.id}-verified` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        Certify Transport Record
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center">
                  <Search className="h-10 w-10 text-malazone-navy" />
                  <div>
                    <p className="text-sm font-black text-malazone-navy">No transport record selected</p>
                    <p className="mt-1 text-sm text-malazone-navy">Choose a vehicle file from the audit queue to begin.</p>
                  </div>
                </div>
              )}
            </QueuePanel>
          </div>
        )}
      </div>

      {selectedDocUrl && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-50 p-2 text-[#00A86B]">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-malazone-navy">የሰነድ ቅድመ-እይታ መስኮት</p>
                  <p className="text-xs text-malazone-navy">ለመንግስት የሰነድ ማረጋገጫ የሚውል የተጠበቀ ቅድመ-እይታ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDocUrl(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-malazone-navy transition hover:bg-slate-50 hover:text-malazone-navy"
              >
                ዝጋ (Close)
              </button>
            </div>

            <div className="flex min-h-[540px] flex-1 items-center justify-center bg-slate-100 p-6">
              {isPdfDocument(selectedDocUrl) ? (
                <iframe title="Government document preview" src={selectedDocUrl} className="h-[72vh] w-full rounded-2xl border-0 bg-white shadow-inner" />
              ) : (
                <img
                  src={selectedDocUrl}
                  alt="Government document preview"
                  className="max-h-[72vh] max-w-full rounded-2xl border border-slate-200 bg-white object-contain shadow-sm"
                />
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-malazone-navy">
                  የመንግስት የሰነድ ቅድመ-እይታ
                </p>
                <a
                  href={selectedDocUrl}
                  download
                  className="inline-flex items-center gap-2 text-sm font-black text-[#00A86B] transition hover:text-emerald-700"
                >
                  <Download className="h-4 w-4" />
                  ሰነዱን አውርድ
                </a>
            </div>
          </div>
        </div>
      )}

      {municipalityReviewRecord && currentLandForm && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-50 p-2 text-[#00A86B]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-malazone-navy">የማዘጋጃ ቤት የሰነድ ማረጋገጫ መስኮት</p>
                  <p className="text-xs text-malazone-navy">malazone ላይ በAdmin የተጫነ ፋይል ላይ የሚሰጥ የመንግስት ውሳኔ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMunicipalityReviewId(null)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-malazone-navy transition hover:bg-slate-50"
              >
                ዝጋ
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 overflow-auto p-6 md:grid-cols-12">
              <div className="space-y-5 md:col-span-7">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-malazone-navy">የሰነዱ ዝርዝር መረጃ</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <p className="text-sm text-malazone-navy">
                      ባለቤት: <span className="font-black text-malazone-navy">{municipalityReviewRecord.sellerName}</span>
                    </p>
                    <p className="text-sm text-malazone-navy">
                      ዓይነት: <span className="font-black text-malazone-navy">{municipalityReviewRecord.categoryLabelAm}</span>
                    </p>
                    <p className="text-sm text-malazone-navy">
                      መለያ ቁጥር: <span className="font-black text-malazone-navy">{municipalityReviewRecord.code}</span>
                    </p>
                    <p className="text-sm text-malazone-navy">
                      የመጣበት ቀን: <span className="font-black text-malazone-navy">{municipalityReviewRecord.submittedDate}</span>
                    </p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                    <p className="text-sm font-black text-malazone-navy">{municipalityReviewRecord.docName}</p>
                    {municipalityReviewRecord.deedImageUrl && (
                      <button
                        type="button"
                        onClick={() => setSelectedDocUrl(municipalityReviewRecord.deedImageUrl)}
                        className="inline-flex items-center gap-2 text-sm font-bold text-[#00A86B] transition hover:text-emerald-700"
                      >
                        <Download className="h-4 w-4" />
                        ትልቅ ቅድመ-እይታ
                      </button>
                    )}
                  </div>
                  <div className="flex min-h-[280px] items-center justify-center bg-slate-100 p-4">
                    {municipalityReviewRecord.deedImageUrl ? (
                      <img
                        src={municipalityReviewRecord.deedImageUrl}
                        alt={municipalityReviewRecord.docName}
                        className="max-h-72 rounded-2xl border border-slate-200 bg-white object-contain shadow-sm"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-malazone-navy">
                        <FileText className="h-12 w-12" />
                        <p className="text-sm font-semibold">የሰነዱ ምስል አልተገኘም።</p>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-malazone-navy">
                    ከላይ ከተጠቀሰው መለያ ኮድ ጋር ማህደር ላይ ያለውን ዋና ሰነድ ያመሳክሩ።
                  </div>
                </div>
              </div>

              <div className="space-y-5 md:col-span-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-malazone-navy">የማረጋገጫ መስፈርቶች ዝርዝር</p>

                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-malazone-navy">ማህደር ፍለጋ ሁኔታ</p>
                          <p className="text-xs text-malazone-navy">በማዘጋጃ ቤቱ ማህደር ውስጥ የተገኘ</p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateLandForm(municipalityReviewRecord.id, {
                              registryMatch: !currentLandForm.registryMatch
                            })
                          }
                          className={`rounded-full px-4 py-2 text-xs font-black transition ${
                            currentLandForm.registryMatch
                              ? "bg-[#00A86B] text-white"
                              : "bg-white text-malazone-navy ring-1 ring-slate-200"
                          }`}
                        >
                          {currentLandForm.registryMatch ? "ተገኝቷል" : "ማጣራት ላይ ያለ"}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-black text-malazone-navy">የንብረት ነፃነት ማረጋገጫ (ክሊራንስ)</p>
                      <div className="mt-3 space-y-3">
                        <label className="flex items-start gap-3 text-sm text-malazone-navy">
                          <input
                            type="checkbox"
                            checked={currentLandForm.noCourtInjunctions}
                            onChange={(event) =>
                              updateLandForm(municipalityReviewRecord.id, {
                                noCourtInjunctions: event.target.checked
                              })
                            }
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#00A86B] focus:ring-[#00A86B]"
                          />
                          <span>ከዕገዳና ከክስ ነፃ የሆነ</span>
                        </label>
                        <label className="flex items-start gap-3 text-sm text-malazone-navy">
                          <input
                            type="checkbox"
                            checked={currentLandForm.taxClear}
                            onChange={(event) =>
                              updateLandForm(municipalityReviewRecord.id, {
                                taxClear: event.target.checked
                              })
                            }
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#00A86B] focus:ring-[#00A86B]"
                          />
                          <span>የዘመኑ የቤት/የመሬት ግብር የተከፈለበት</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-black text-malazone-navy">የአረጋጋጩ ዲጂታል ፊርማ</label>
                      <input
                        type="text"
                        value={currentLandForm.digitalSignature}
                        onChange={(event) =>
                          updateLandForm(municipalityReviewRecord.id, {
                            digitalSignature: event.target.value
                          })
                        }
                        placeholder={`ለማረጋገጥ "${officerProfile.officerName}" ብለው ይተይቡ`}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-malazone-navy outline-none transition focus:border-[#00A86B] focus:bg-white"
                      />
                      <p className={`mt-2 text-xs font-semibold ${landSignatureMatches ? "text-[#00A86B]" : "text-malazone-navy"}`}>
                        የአውዲተሩን ሙሉ ስም በትክክል ያስገቡ: {officerProfile.officerName}
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-black text-malazone-navy">
                        <MessageSquare className="h-4 w-4 text-[#00A86B]" />
                        የአረጋጋጩ አስተያየት
                      </label>
                      <textarea
                        rows={4}
                        value={currentLandForm.notes}
                        onChange={(event) =>
                          updateLandForm(municipalityReviewRecord.id, {
                            notes: event.target.value
                          })
                        }
                        placeholder="ሰነዱ ትክክል ከሆነ 'የጸደቀ' ወይም ጉድለት ካለ 'የዘመኑ ግብር አልተከፈለም' ያሉ ዝርዝሮችን ያስፍሩ..."
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-malazone-navy outline-none transition focus:border-[#00A86B] focus:bg-white"
                      />
                      <p className="mt-2 text-xs text-malazone-navy">
                        ውድቅ ሲደረግ የጉድለቱን ምክንያት በዝርዝር መጻፍ ግዴታ ነው።
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setMunicipalityReviewId(null)}
                        className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-malazone-navy transition hover:bg-slate-50 hover:text-malazone-navy"
                      >
                        ዝጋ (Close)
                      </button>
                      <button
                        type="button"
                        disabled={!canFlagLand || submittingKey === `land-${municipalityReviewRecord.id}-fraudulent`}
                        onClick={() =>
                          void submitAudit(
                            municipalityReviewRecord.id,
                            "land",
                            "fraudulent",
                            `ጉድለት አለበት: ${currentLandForm.notes.trim()}`
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-black text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:border-rose-100 disabled:bg-rose-50/70 disabled:text-rose-300"
                      >
                        {submittingKey === `land-${municipalityReviewRecord.id}-fraudulent` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                        ጉድለት አለበት (Flag Defect)
                      </button>
                      <button
                        type="button"
                        disabled={!canVerifyLand || submittingKey === `land-${municipalityReviewRecord.id}-verified`}
                        onClick={() =>
                          void submitAudit(
                            municipalityReviewRecord.id,
                            "land",
                            "verified",
                            `Registry Match: ${currentLandForm.registryMatch ? "yes" : "no"} | No Active Court Injunctions: ${
                              currentLandForm.noCourtInjunctions ? "yes" : "no"
                            } | Tax Clear: ${currentLandForm.taxClear ? "yes" : "no"} | Notes: ${
                              currentLandForm.notes.trim() || "የጸደቀ"
                            }`
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00A86B] px-5 py-3 text-sm font-black text-malazone-navy shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-emerald-200 disabled:text-malazone-navy/50"
                      >
                        {submittingKey === `land-${municipalityReviewRecord.id}-verified` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        ሰነዱ ትክክል ነው (Verify Asset)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
