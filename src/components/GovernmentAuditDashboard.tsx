import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
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

interface LandFormState {
  registryMatch: boolean;
  noCourtInjunctions: boolean;
  taxClear: boolean;
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
        <h2 className="flex items-center gap-3 text-lg font-black tracking-tight text-slate-900">
          <span className="rounded-2xl bg-emerald-50 p-2 text-[#00A86B]">{icon}</span>
          {title}
        </h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-[#00A86B]">
        {countLabel}
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

export default function GovernmentAuditDashboard(props: { overrideTab?: string }) {
  const { user } = useAdminAuth();
  const [propertyQueue, setPropertyQueue] = useState<LandRecord[]>(fallbackLandRecords);
  const [municipalityCategory, setMunicipalityCategory] = useState<AssetCategory>("all");
  const [municipalitySearch, setMunicipalitySearch] = useState("");
  const [municipalityReviewId, setMunicipalityReviewId] = useState<number | null>(null);
  const [landForms, setLandForms] = useState<Record<number, LandFormState>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [submittingKey, setSubmittingKey] = useState<string | null>(null);
  const [selectedDocUrl, setSelectedDocUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [municipalityApprovedCount, setMunicipalityApprovedCount] = useState(0);
  const [municipalityRejectedCount, setMunicipalityRejectedCount] = useState(0);

  const officerProfile = useMemo(() => {
    const fallback = { officerName: "Tigist A.", bureau: "Hawassa City Municipality" };

    if (!user) {
      return fallback;
    }

    const bureau =
      user.role === "g2b_municipality"
        ? "Hawassa City Municipality"
        : "Hawassa City Municipality";

    return {
      officerName: user.full_name || fallback.officerName,
      bureau
    };
  }, [user]);

  const municipalityReviewRecord = useMemo(
    () => propertyQueue.find((record) => record.id === municipalityReviewId) ?? null,
    [municipalityReviewId, propertyQueue]
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

      setPropertyQueue(land.length > 0 ? land : fallbackLandRecords);
    } catch (error) {
      console.error("Failed to fetch pending G2B audits:", error);
      setPropertyQueue(fallbackLandRecords);
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

  const submitAudit = async (
    id: number,
    status: AuditStatus,
    notes: string
  ) => {
    setSubmittingKey(`land-${id}-${status}`);
    setStatusMessage(null);

    try {
      const response = await fetch(`/api/g2b/audit/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officer_name: officerProfile.officerName,
          audit_type: "land",
          status,
          notes
        })
      });

      const payload = (await response.json()) as { success: boolean; message?: string };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Audit submission failed.");
      }

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

  const landSignatureMatches =
    currentLandForm !== null &&
    currentLandForm.digitalSignature.trim().toLowerCase() === officerProfile.officerName.trim().toLowerCase();

  const canVerifyLand = !!municipalityReviewRecord && !!currentLandForm;
  const canFlagLand =
    !!municipalityReviewRecord &&
    !!currentLandForm &&
    landSignatureMatches &&
    currentLandForm.notes.trim().length >= 10;

  return (
    <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-slate-50 text-slate-900 shadow-sm" style={ethiopicFont}>
      <div className="border-b border-slate-200 bg-white px-6 py-6 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div>
              <p className="text-3xl font-black tracking-tight text-[#00A86B]">
                malazone
              </p>
              <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
                የማዘጋጃ ቤት የሰነድ ማረጋገጫ ማዕከል | G2B Compliance Ledger
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 min-w-[200px]">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">የሰራተኛ ክፍለ-ጊዜ (Officer Session)</p>
              <p className="mt-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                <UserCheck className="h-4 w-4 text-[#00A86B]" />
                {officerProfile.officerName}
              </p>
              <p className="mt-2 text-xs text-slate-500">{officerProfile.bureau}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 min-w-[160px]">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">የተላኩ ማህደሮች</p>
              <p className="mt-3 text-3xl font-black text-slate-900">{propertyQueue.length}</p>
              <p className="mt-1 text-xs text-slate-500">በማዘጋጃ ቤቱ ማህደር ውስጥ የሚጠበቁ</p>
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

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-2xl bg-[#00A86B] px-5 py-3 text-sm font-black text-black shadow-lg shadow-emerald-500/20">
              <Building2 className="h-4 w-4" />
              የማዘጋጃ ቤት ማህደር ማረጋገጫ
            </span>
          </div>
          <button
            type="button"
            onClick={() => void fetchPending()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            ያድሱ (Refresh)
          </button>
        </div>

        <div className="mx-auto max-w-6xl space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  ጠቅላላ የሚጠበቁ ማረጋገጫዎች
                </p>
                <p className="mt-2 text-3xl font-black text-slate-900">{propertyQueue.length}</p>
                <p className="mt-1 text-xs text-slate-500">የመሬት ካርታ፣ የቤት ፕላን እና የንግድ ድርጅት ሰነዶች</p>
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
                    <p className="mt-2 text-sm font-black text-slate-900">{officerProfile.officerName}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">{officerProfile.bureau}</p>
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
                    <div className="mr-1 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
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
                              : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                          }`}
                        >
                          {category.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="relative w-full lg:w-80">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={municipalitySearch}
                      onChange={(event) => setMunicipalitySearch(event.target.value)}
                      placeholder="በስም፣ በመለያ ቁጥር ወይም በካርታ ቁጥር ይፈልጉ..."
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#00A86B]"
                    />
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
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
                      <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
                        {filteredMunicipalityQueue.map((record) => (
                          <tr key={record.id} className="transition hover:bg-slate-50/80">
                            <td className="px-4 py-[14px] font-black text-slate-900">{record.propertyId}</td>
                            <td className="px-4 py-[14px] font-semibold text-slate-800">{record.sellerName}</td>
                            <td className="px-4 py-[14px]">
                              <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-black text-slate-700">
                                {record.categoryLabelAm}
                              </span>
                            </td>
                            <td className="px-4 py-[14px] text-slate-500">{record.kebeleZoneLocation}</td>
                            <td className="px-4 py-[14px] font-mono text-xs font-bold text-slate-800">{record.code}</td>
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
                                className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-700 transition hover:border-[#00A86B]/30 hover:text-[#00A86B]"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                መርምርና ወስን
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredMunicipalityQueue.length === 0 && !loading && (
                          <tr>
                            <td colSpan={7} className="px-5 py-14 text-center text-sm text-slate-500">
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
                  <p className="text-sm font-black text-slate-900">የሰነድ ቅድመ-እይታ መስኮት</p>
                  <p className="text-xs text-slate-500">ለመንግስት የሰነድ ማረጋገጫ የሚውል የተጠበቀ ቅድመ-እይታ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDocUrl(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
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
                <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
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
                  <p className="text-sm font-black text-slate-900">የማዘጋጃ ቤት የሰነድ ማረጋገጫ መስኮት</p>
                  <p className="text-xs text-slate-500">malazone ላይ በAdmin የተጫነ ፋይል ላይ የሚሰጥ የመንግስት ውሳኔ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMunicipalityReviewId(null)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                ዝጋ
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 overflow-auto p-6 md:grid-cols-12">
              <div className="space-y-5 md:col-span-7">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">የሰነዱ ዝርዝር መረጃ</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <p className="text-sm text-slate-600">
                      ባለቤት: <span className="font-black text-slate-900">{municipalityReviewRecord.sellerName}</span>
                    </p>
                    <p className="text-sm text-slate-600">
                      ዓይነት: <span className="font-black text-slate-900">{municipalityReviewRecord.categoryLabelAm}</span>
                    </p>
                    <p className="text-sm text-slate-600">
                      መለያ ቁጥር: <span className="font-black text-slate-900">{municipalityReviewRecord.code}</span>
                    </p>
                    <p className="text-sm text-slate-600">
                      የመጣበት ቀን: <span className="font-black text-slate-900">{municipalityReviewRecord.submittedDate}</span>
                    </p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                    <p className="text-sm font-black text-slate-900">{municipalityReviewRecord.docName}</p>
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
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <FileText className="h-12 w-12" />
                        <p className="text-sm font-semibold">የሰነዱ ምስል አልተገኘም።</p>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    ከላይ ከተጠቀሰው መለያ ኮድ ጋር ማህደር ላይ ያለውን ዋና ሰነድ ያመሳክሩ።
                  </div>
                </div>
              </div>

              <div className="space-y-5 md:col-span-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">የማረጋገጫ መስፈርቶች ዝርዝር</p>

                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-slate-900">ማህደር ፍለጋ ሁኔታ</p>
                          <p className="text-xs text-slate-500">በማዘጋጃ ቤቱ ማህደር ውስጥ የተገኘ</p>
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
                              : "bg-white text-slate-600 ring-1 ring-slate-200"
                          }`}
                        >
                          {currentLandForm.registryMatch ? "ተገኝቷል" : "ማጣራት ላይ ያለ"}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-black text-slate-900">የንብረት ነፃነት ማረጋገጫ (ክሊራንስ)</p>
                      <div className="mt-3 space-y-3">
                        <label className="flex items-start gap-3 text-sm text-slate-700">
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
                        <label className="flex items-start gap-3 text-sm text-slate-700">
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
                      <label className="mb-2 block text-sm font-black text-slate-900">የአረጋጋጩ ዲጂታል ፊርማ</label>
                      <input
                        type="text"
                        value={currentLandForm.digitalSignature}
                        onChange={(event) =>
                          updateLandForm(municipalityReviewRecord.id, {
                            digitalSignature: event.target.value
                          })
                        }
                        placeholder={`ለማረጋገጥ "${officerProfile.officerName}" ብለው ይተይቡ`}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#00A86B] focus:bg-white"
                      />
                      <p className={`mt-2 text-xs font-semibold ${landSignatureMatches ? "text-[#00A86B]" : "text-slate-500"}`}>
                        የአውዲተሩን ሙሉ ስም በትክክል ያስገቡ: {officerProfile.officerName}
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-black text-slate-900">
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
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#00A86B] focus:bg-white"
                      />
                      <p className="mt-2 text-xs text-slate-500">
                        ውድቅ ሲደረግ የጉድለቱን ምክንያት በዝርዝር መጻፍ ግዴታ ነው።
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setMunicipalityReviewId(null)}
                        className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                      >
                        ዝጋ (Close)
                      </button>
                      <button
                        type="button"
                        disabled={!canFlagLand || submittingKey === `land-${municipalityReviewRecord.id}-fraudulent`}
                        onClick={() =>
                          void submitAudit(
                            municipalityReviewRecord.id,
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
                            "verified",
                            `Registry Match: ${currentLandForm.registryMatch ? "yes" : "no"} | No Active Court Injunctions: ${
                              currentLandForm.noCourtInjunctions ? "yes" : "no"
                            } | Tax Clear: ${currentLandForm.taxClear ? "yes" : "no"} | Notes: ${
                              currentLandForm.notes.trim() || "የጸደቀ"
                            }`
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00A86B] px-5 py-3 text-sm font-black text-black shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-emerald-200 disabled:text-black/50"
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
