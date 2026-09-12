"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getRequisitions,
  getTalentPoolCandidates,
  getInternalMobilityMatches,
  saveRequisitionSourcing,
} from "@/lib/data/api";
import {
  RequisitionItem,
  TalentPoolCandidate,
  InternalMobilityMatch,
  fallbackIncomingRequisitions,
  fallbackTalentPool,
  fallbackMobilityMatches,
} from "@/lib/data/fixtures";
import {
  Inbox,
  Zap,
  Sparkles,
  Globe,
  ArrowRight,
  ChevronRight,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  ExternalLink,
  Users,
  Check,
  X,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  FileSpreadsheet,
  Link as LinkIcon,
  RefreshCw,
} from "lucide-react";

export default function RequisitionIntakePage() {
  const router = useRouter();

  // Data states
  const [incomingRequisitions, setIncomingRequisitions] = useState<RequisitionItem[]>([]);
  const [talentPool, setTalentPool] = useState<TalentPoolCandidate[]>([]);
  const [mobilityMatches, setMobilityMatches] = useState<InternalMobilityMatch[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<"ALL" | "TIER_1" | "TIER_2_PLUS">("ALL");
  const [locationFilter, setLocationFilter] = useState("ALL");

  // Drawer / Allocation state
  const [selectedReq, setSelectedReq] = useState<RequisitionItem | null>(null);
  const [fulfillmentPathway, setFulfillmentPathway] = useState<"TALENT_POOL" | "INTERNAL_MOBILITY" | "CONVENTIONAL">("TALENT_POOL");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("");
  const [selectedCandidateName, setSelectedCandidateName] = useState<string>("");
  const [selectedCandidateFit, setSelectedCandidateFit] = useState<number | undefined>(undefined);

  // Conventional multi-channel state
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["LinkedIn", "Employee Referral"]);
  const [trackerUrl, setTrackerUrl] = useState<string>("");
  const [initialApplicants, setInitialApplicants] = useState<number>(0);
  const [sourcingNotes, setSourcingNotes] = useState<string>("");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load incoming data live from Supabase with fallback
  const loadData = async () => {
    setLoading(true);
    try {
      const [reqsRes, poolRes, mobRes] = await Promise.all([
        getRequisitions({ status: "PENDING_SOURCING" }),
        getTalentPoolCandidates(),
        getInternalMobilityMatches(),
      ]);
      setIncomingRequisitions(reqsRes.data || fallbackIncomingRequisitions);
      setTalentPool(poolRes.data || fallbackTalentPool);
      setMobilityMatches(mobRes.data || fallbackMobilityMatches);
    } catch (err) {
      console.error("Failed to load incoming requisitions:", err);
      setIncomingRequisitions(fallbackIncomingRequisitions);
      setTalentPool(fallbackTalentPool);
      setMobilityMatches(fallbackMobilityMatches);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered incoming requisitions
  const filteredRequisitions = useMemo(() => {
    return incomingRequisitions.filter((req) => {
      // Search
      const matchSearch =
        !searchQuery ||
        req.req_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.role_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (req.club_name && req.club_name.toLowerCase().includes(searchQuery.toLowerCase()));

      // Tier filter
      const tier = req.tier_number || (["Customer Service", "Personal Trainer", "Fitness Consultant", "Housekeeping"].includes(req.role_name) ? 1 : 2);
      const matchTier =
        tierFilter === "ALL" ||
        (tierFilter === "TIER_1" && tier === 1) ||
        (tierFilter === "TIER_2_PLUS" && tier >= 2);

      // Location filter
      const matchLoc = locationFilter === "ALL" || req.location_name.toLowerCase() === locationFilter.toLowerCase();

      return matchSearch && matchTier && matchLoc;
    });
  }, [incomingRequisitions, searchQuery, tierFilter, locationFilter]);

  // Unique locations for dropdown
  const uniqueLocations = useMemo(() => {
    const locs = new Set<string>();
    incomingRequisitions.forEach((r) => locs.add(r.location_name));
    return Array.from(locs);
  }, [incomingRequisitions]);

  // Summary counts
  const summaryCounts = useMemo(() => {
    const total = incomingRequisitions.length;
    const tier1 = incomingRequisitions.filter((r) => {
      const tier = r.tier_number || (["Customer Service", "Personal Trainer", "Fitness Consultant", "Housekeeping"].includes(r.role_name) ? 1 : 2);
      return tier === 1;
    }).length;
    const tier2Plus = total - tier1;
    return { total, tier1, tier2Plus };
  }, [incomingRequisitions]);

  // Open Allocation Drawer
  const handleOpenAllocation = (req: RequisitionItem) => {
    setSelectedReq(req);
    setSelectedCandidateId("");
    setSelectedCandidateName("");
    setSelectedCandidateFit(undefined);
    setTrackerUrl(req.external_tracker_url || "");
    setSourcingNotes("");
    setInitialApplicants(0);

    const tier = req.tier_number || (["Customer Service", "Personal Trainer", "Fitness Consultant", "Housekeeping"].includes(req.role_name) ? 1 : 2);
    if (tier === 1) {
      setFulfillmentPathway("TALENT_POOL");
    } else if (tier >= 2) {
      setFulfillmentPathway("INTERNAL_MOBILITY");
    } else {
      setFulfillmentPathway("CONVENTIONAL");
    }
  };

  // Channel toggle helper
  const toggleChannel = (channel: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  };

  // Confirm and Launch Requisition
  const handleConfirmAllocation = async () => {
    if (!selectedReq) return;
    setIsSubmitting(true);

    try {
      let sourcingChannelLabel = "";
      let assignedCandidatesPayload: any[] = [];
      let sourcingDetailsPayload: any[] = [];
      let startingStage = "HR Screening";

      if (fulfillmentPathway === "TALENT_POOL") {
        sourcingChannelLabel = "⚡ Frontline Ready Pool";
        startingStage = "Manager Interview"; // Fast-tracked
        if (selectedCandidateName) {
          assignedCandidatesPayload = [
            {
              id: selectedCandidateId || "TP-SELECTED",
              name: selectedCandidateName,
              source_type: "TALENT_POOL",
              stage: "Manager Interview",
              fit_score: selectedCandidateFit,
              applied_at: new Date().toISOString().split("T")[0],
              notes: "Fast-tracked directly to Club GM Interview",
            },
          ];
        }
        sourcingDetailsPayload = [
          {
            channel: "Frontline Ready Pool",
            applicants: assignedCandidatesPayload.length || 1,
            notes: "Pre-qualified candidate fast-tracked from local pool",
          },
        ];
      } else if (fulfillmentPathway === "INTERNAL_MOBILITY") {
        sourcingChannelLabel = "✨ Internal Mobility";
        startingStage = "Offering Stage"; // Succession interview passed
        if (selectedCandidateName) {
          assignedCandidatesPayload = [
            {
              id: selectedCandidateId || "EMP-MOBILITY",
              name: selectedCandidateName,
              source_type: "INTERNAL_MOBILITY",
              stage: "Offering Stage",
              fit_score: selectedCandidateFit,
              applied_at: new Date().toISOString().split("T")[0],
              notes: "Succession match approved by HR & Area GM",
            },
          ];
        }
        sourcingDetailsPayload = [
          {
            channel: "Internal Mobility",
            applicants: assignedCandidatesPayload.length || 1,
            notes: "Internal promotion / lateral transfer match",
          },
        ];
      } else {
        sourcingChannelLabel = "🌐 Conventional ATS";
        startingStage = "HR Screening";
        sourcingDetailsPayload = selectedChannels.map((ch) => ({
          channel: ch,
          url: trackerUrl || undefined,
          applicants: Math.floor(initialApplicants / Math.max(1, selectedChannels.length)),
          notes: sourcingNotes || undefined,
        }));
      }

      await saveRequisitionSourcing(selectedReq.req_code, {
        sourcing_channel: sourcingChannelLabel,
        sourcing_details: sourcingDetailsPayload,
        assigned_candidates: assignedCandidatesPayload,
        current_stage: startingStage,
        external_tracker_url: trackerUrl || undefined,
      });

      // Remove from incoming queue locally
      setIncomingRequisitions((prev) => prev.filter((r) => r.req_code !== selectedReq.req_code));
      setSuccessMessage(
        `Lowongan ${selectedReq.req_code} (${selectedReq.role_name}) berhasil dialokasikan ke ${sourcingChannelLabel} dan telah aktif di monitoring!`
      );
      setSelectedReq(null);
    } catch (err) {
      console.error("Failed to confirm sourcing allocation:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header & Stage Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-brand-teal/15 text-brand-teal border border-brand-teal/30">
              Stage 1 • Pre-Monitoring
            </span>
            <span className="text-xs text-ink-tertiary">
              Exit-to-Vacancy Lifecycle
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-primary flex items-center gap-2.5">
            <Inbox className="w-7 h-7 text-brand-teal" />
            <span>Requisition Intake & Sourcing Assessment</span>
          </h1>
          <p className="text-sm text-ink-secondary mt-1 max-w-2xl">
            Gerbang awal lowongan baru masuk (akibat turnover exit atau ekspansi klub). Tentukan kanal pemenuhan tercepat dan paling efisien sebelum masuk ke pipeline aktif.
          </p>
        </div>

        {/* Primary Stage Switcher Navigation */}
        <div className="flex items-center gap-2 bg-surface-card p-1.5 rounded-2xl border border-surface-border shadow-sm flex-wrap">
          <button
            type="button"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-teal text-surface-ground flex items-center gap-2 shadow-md cursor-default"
          >
            <Inbox className="w-4 h-4" />
            <span>1. Intake Assessment ({summaryCounts.total})</span>
          </button>
          <Link
            href="/vacancy"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-ink-secondary hover:text-ink-primary hover:bg-surface-ground transition-colors flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-brand-teal" />
            <span>2. Active Monitoring</span>
          </Link>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-status-healthy/10 border border-status-healthy/30 flex items-center justify-between gap-3 text-status-healthy animate-fadeIn">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/vacancy"
              className="px-3 py-1 rounded-lg text-xs font-bold bg-status-healthy/20 hover:bg-status-healthy/30 text-status-healthy flex items-center gap-1 transition-colors"
            >
              <span>Lihat di Active Monitoring</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <button
              onClick={() => setSuccessMessage(null)}
              className="p-1 rounded hover:bg-status-healthy/20 text-status-healthy transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-surface-card border border-surface-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-ink-tertiary">
            <span>Antrean Lowongan Masuk</span>
            <Inbox className="w-4 h-4 text-brand-teal" />
          </div>
          <div className="text-3xl font-extrabold text-ink-primary">
            {summaryCounts.total} <span className="text-xs font-normal text-ink-tertiary">Lowongan</span>
          </div>
          <p className="text-[11px] text-ink-secondary">
            Memerlukan penentuan jalur sourcing sebelum SLA aging mulai dihitung.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-card border border-surface-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-ink-tertiary">
            <span>Tier 1 • Frontline Staff</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              ⚡ Ready Pool
            </span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">
            {summaryCounts.tier1} <span className="text-xs font-normal text-ink-tertiary">Req</span>
          </div>
          <p className="text-[11px] text-ink-secondary">
            CS, PT, FC, Housekeeping diarahkan langsung ke Frontline Ready Pool.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-card border border-surface-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-ink-tertiary">
            <span>Tier 2–4 • Leadership & Spv</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
              ✨ Internal Mobility
            </span>
          </div>
          <div className="text-3xl font-extrabold text-purple-400">
            {summaryCounts.tier2Plus} <span className="text-xs font-normal text-ink-tertiary">Req</span>
          </div>
          <p className="text-[11px] text-ink-secondary">
            Leads & Manager diselesaikan via jalur promosi & rotasi suksesi internal.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-card border border-surface-border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-ink-tertiary">
            <span>Target Time-to-Fill (TTF)</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-brand-teal">
            9 Hari <span className="text-xs font-normal text-ink-tertiary">vs 28d Conv</span>
          </div>
          <p className="text-[11px] text-ink-secondary">
            Pemenuhan pool & mobility memangkas 67% durasi kekosongan shift.
          </p>
        </div>
      </div>

      {/* 3. Incoming Queue Table */}
      <div className="p-5 rounded-2xl bg-surface-card border border-surface-border shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-ink-primary flex items-center gap-2">
              <span>Antrean Penilaian Jalur Sourcing (Incoming Requisitions)</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-brand-teal/15 text-brand-teal">
                {filteredRequisitions.length}
              </span>
            </h3>
            <p className="text-xs text-ink-secondary mt-0.5">
              Pilih lowongan untuk menganalisis kecocokan kandidat pool, suksesi internal, atau input kanal konvensional.
            </p>
          </div>

          {/* Table Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari posisi atau cabang..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-surface-ground border border-surface-border text-xs text-ink-primary focus:border-brand-teal focus:outline-none w-48 sm:w-56"
              />
            </div>

            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl bg-surface-ground border border-surface-border text-xs text-ink-primary focus:border-brand-teal focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Tier Role</option>
              <option value="TIER_1">Tier 1 • Frontline Staff</option>
              <option value="TIER_2_PLUS">Tier 2–4 • Leadership & Spv</option>
            </select>

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-surface-ground border border-surface-border text-xs text-ink-primary focus:border-brand-teal focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Lokasi</option>
              {uniqueLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto rounded-xl border border-surface-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-ground/70 border-b border-surface-border text-ink-tertiary uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-3">Req Code</th>
                <th className="py-3 px-3">Posisi & Job Family</th>
                <th className="py-3 px-3">Lokasi & Cabang</th>
                <th className="py-3 px-3">Alasan Kebutuhan / Exit Terkait</th>
                <th className="py-3 px-3">Tipe</th>
                <th className="py-3 px-3">SLA Target</th>
                <th className="py-3 px-3">Rekomendasi Jalur</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-ink-tertiary">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-teal mb-2" />
                    Memuat antrean lowongan masuk...
                  </td>
                </tr>
              ) : filteredRequisitions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-ink-tertiary">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-status-healthy mb-2" />
                    Tidak ada lowongan yang menunggu penilaian alokasi. Semua lowongan sudah aktif!
                  </td>
                </tr>
              ) : (
                filteredRequisitions.map((req) => {
                  const tier = req.tier_number || (["Customer Service", "Personal Trainer", "Fitness Consultant", "Housekeeping"].includes(req.role_name) ? 1 : 2);
                  const isTier1 = tier === 1;

                  const jobFamilyBadge =
                    req.job_family === "Fitness & Coaching"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : req.job_family === "Commercial & Sales"
                      ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                      : "bg-sky-500/10 text-sky-400 border-sky-500/20";

                  return (
                    <tr
                      key={req.req_code}
                      className="hover:bg-surface-ground/50 transition-colors group cursor-pointer"
                      onClick={() => handleOpenAllocation(req)}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-brand-teal whitespace-nowrap">
                        {req.req_code}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-ink-primary">{req.role_name}</div>
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold border mt-0.5 ${jobFamilyBadge}`}
                        >
                          {req.job_family || (isTier1 ? "Frontline Staff" : "Leadership")}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-semibold text-ink-primary">{req.location_name}</div>
                        <div className="text-[10px] text-ink-tertiary">{req.club_name || "Central / Regional"}</div>
                      </td>

                      <td className="py-3 px-3 max-w-xs">
                        <div className="text-ink-secondary text-[11px] line-clamp-2">
                          {req.urgency_reason}
                        </div>
                        {req.linked_exit_code && (
                          <span className="text-[10px] text-status-critical font-mono font-semibold">
                            Exited: {req.linked_exit_code}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            req.hiring_type === "Replacement"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          }`}
                        >
                          {req.hiring_type}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap font-mono text-ink-primary font-semibold">
                        {req.sla_target_days} Hari
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {isTier1 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <Zap className="w-3 h-3" />
                            <span>⚡ Frontline Ready Pool</span>
                          </span>
                        ) : req.recommended_fulfillment === "INTERNAL_MOBILITY" || tier >= 2 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                            <Sparkles className="w-3 h-3" />
                            <span>✨ Internal Mobility</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                            <Globe className="w-3 h-3" />
                            <span>🌐 Conventional ATS</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAllocation(req);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-brand-teal text-surface-ground text-xs font-bold hover:bg-brand-teal/90 transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Alokasikan</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Interactive Sourcing Allocation Drawer */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn">
          <div
            className="w-full max-w-2xl bg-surface-card border-l border-surface-border h-full shadow-2xl flex flex-col animate-slideLeft"
            role="dialog"
            aria-modal="true"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-surface-border flex items-start justify-between gap-4 bg-surface-ground/30">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-teal/15 text-brand-teal border border-brand-teal/30">
                    {selectedReq.req_code}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-ground text-ink-secondary border border-surface-border">
                    Tier {selectedReq.tier_number || (["Customer Service", "Personal Trainer", "Fitness Consultant", "Housekeeping"].includes(selectedReq.role_name) ? 1 : 2)}
                  </span>
                  <span className="text-[10px] font-semibold text-ink-tertiary">
                    {selectedReq.hiring_type} Requisition
                  </span>
                </div>
                <h3 className="text-lg font-bold text-ink-primary">
                  Alokasi Sourcing: {selectedReq.role_name}
                </h3>
                <p className="text-xs text-ink-secondary mt-1">
                  Lokasi: <span className="font-semibold text-ink-primary">{selectedReq.location_name}</span> ({selectedReq.club_name || "Central"}) • Hiring Manager: {selectedReq.hiring_manager}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="p-1.5 rounded-lg hover:bg-surface-ground text-ink-tertiary hover:text-ink-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Urgency Alert Banner */}
            <div className="px-5 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{selectedReq.urgency_reason}</span>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Pathway Option Selector */}
              <div>
                <label className="text-xs font-bold text-ink-tertiary uppercase tracking-wider block mb-2">
                  Pilih Jalur Pemenuhan (Fulfillment Pathway)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Option 1: Talent Pool */}
                  <button
                    type="button"
                    onClick={() => setFulfillmentPathway("TALENT_POOL")}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      fulfillmentPathway === "TALENT_POOL"
                        ? "bg-emerald-500/10 border-emerald-500/50 shadow-sm"
                        : "bg-surface-ground border-surface-border hover:border-surface-border/80"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      {selectedReq.tier_number === 1 || ["Customer Service", "Personal Trainer", "Fitness Consultant", "Housekeeping"].includes(selectedReq.role_name) ? (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          Rekomendasi
                        </span>
                      ) : null}
                    </div>
                    <div className="font-bold text-xs text-ink-primary">1. Frontline Ready Pool</div>
                    <p className="text-[10px] text-ink-secondary mt-1">
                      Kandidat lokal pre-screened. Fast-track GM interview (9d TTF).
                    </p>
                  </button>

                  {/* Option 2: Internal Mobility */}
                  <button
                    type="button"
                    onClick={() => setFulfillmentPathway("INTERNAL_MOBILITY")}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      fulfillmentPathway === "INTERNAL_MOBILITY"
                        ? "bg-purple-500/10 border-purple-500/50 shadow-sm"
                        : "bg-surface-ground border-surface-border hover:border-surface-border/80"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      {(selectedReq.tier_number || 2) >= 2 && !["Customer Service", "Personal Trainer", "Fitness Consultant", "Housekeeping"].includes(selectedReq.role_name) ? (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                          Rekomendasi
                        </span>
                      ) : null}
                    </div>
                    <div className="font-bold text-xs text-ink-primary">2. Internal Mobility</div>
                    <p className="text-[10px] text-ink-secondary mt-1">
                      Promosi & suksesi internal. Atasi turnover via jenjang karir.
                    </p>
                  </button>

                  {/* Option 3: Conventional ATS */}
                  <button
                    type="button"
                    onClick={() => setFulfillmentPathway("CONVENTIONAL")}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      fulfillmentPathway === "CONVENTIONAL"
                        ? "bg-sky-500/10 border-sky-500/50 shadow-sm"
                        : "bg-surface-ground border-surface-border hover:border-surface-border/80"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Globe className="w-4 h-4 text-sky-400" />
                    </div>
                    <div className="font-bold text-xs text-ink-primary">3. Conventional ATS</div>
                    <p className="text-[10px] text-ink-secondary mt-1">
                      Job portal multi-source (LinkedIn, Referral, Sheets).
                    </p>
                  </button>
                </div>
              </div>

              {/* Pathway Specific Content */}
              {fulfillmentPathway === "TALENT_POOL" && (
                <div className="space-y-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-ink-primary flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-emerald-400" />
                        <span>Kandidat Tersedia di Frontline Ready Pool</span>
                      </h4>
                      <p className="text-[11px] text-ink-secondary">
                        Pilih kandidat untuk langsung dikirimkan jadwal interview GM di cabang {selectedReq.location_name}.
                      </p>
                    </div>
                    <Link
                      href="/vacancy?tab=talent-pool"
                      target="_blank"
                      className="text-[11px] text-brand-teal hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <span>Buka Halaman Pool</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="space-y-2">
                    {talentPool.filter((c) => {
                      const locMatch =
                        c.location_preference.toLowerCase().includes(selectedReq.location_name.toLowerCase()) ||
                        selectedReq.location_name.toLowerCase().includes(c.location_preference.toLowerCase());
                      return locMatch;
                    }).length === 0 ? (
                      // If no strict location match, show top pool candidates
                      talentPool.slice(0, 3).map((candidate) => {
                        const isSelected = selectedCandidateId === candidate.candidate_id;
                        return (
                          <div
                            key={candidate.candidate_id}
                            onClick={() => {
                              setSelectedCandidateId(candidate.candidate_id);
                              setSelectedCandidateName(candidate.display_name);
                              setSelectedCandidateFit(Math.round(candidate.fit_score || 90));
                            }}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected
                                ? "bg-emerald-500/15 border-emerald-500"
                                : "bg-surface-card border-surface-border hover:border-emerald-500/40"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center justify-center">
                                {candidate.display_name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-xs text-ink-primary flex items-center gap-2">
                                  <span>{candidate.display_name}</span>
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-surface-ground text-ink-tertiary">
                                    {candidate.role_target}
                                  </span>
                                </div>
                                <div className="text-[10px] text-ink-tertiary mt-0.5 flex items-center gap-2">
                                  <span>{candidate.location_preference}</span>
                                  <span>•</span>
                                  <span>Verified: {candidate.verified_competencies?.length || 0} Skills</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <span className="font-bold text-xs text-emerald-400 block">
                                  {Math.round(candidate.fit_score || 90)}% Fit
                                </span>
                                <span className="text-[9px] text-ink-tertiary">{candidate.readiness_status}</span>
                              </div>
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  isSelected ? "bg-emerald-500 border-emerald-500 text-surface-ground" : "border-surface-border"
                                }`}
                              >
                                {isSelected && <Check className="w-2.5 h-2.5" />}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      talentPool
                        .filter((c) =>
                          c.location_preference.toLowerCase().includes(selectedReq.location_name.toLowerCase()) ||
                          selectedReq.location_name.toLowerCase().includes(c.location_preference.toLowerCase())
                        )
                        .map((candidate) => {
                          const isSelected = selectedCandidateId === candidate.candidate_id;
                          return (
                            <div
                              key={candidate.candidate_id}
                              onClick={() => {
                                setSelectedCandidateId(candidate.candidate_id);
                                setSelectedCandidateName(candidate.display_name);
                                setSelectedCandidateFit(Math.round(candidate.fit_score || 90));
                              }}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                isSelected
                                  ? "bg-emerald-500/15 border-emerald-500"
                                  : "bg-surface-card border-surface-border hover:border-emerald-500/40"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center justify-center">
                                  {candidate.display_name.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-bold text-xs text-ink-primary flex items-center gap-2">
                                    <span>{candidate.display_name}</span>
                                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-surface-ground text-ink-tertiary">
                                      {candidate.role_target}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-ink-tertiary mt-0.5 flex items-center gap-2">
                                    <span>{candidate.location_preference}</span>
                                    <span>•</span>
                                    <span>Verified: {candidate.verified_competencies?.length || 0} Competencies</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <span className="font-bold text-xs text-emerald-400 block">
                                    {Math.round(candidate.fit_score || 90)}% Fit
                                  </span>
                                  <span className="text-[9px] text-ink-tertiary">{candidate.readiness_status}</span>
                                </div>
                                <div
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                    isSelected ? "bg-emerald-500 border-emerald-500 text-surface-ground" : "border-surface-border"
                                  }`}
                                >
                                  {isSelected && <Check className="w-2.5 h-2.5" />}
                                </div>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              )}

              {fulfillmentPathway === "INTERNAL_MOBILITY" && (
                <div className="space-y-3 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-ink-primary flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span>Kandidat Suksesi Internal Match</span>
                      </h4>
                      <p className="text-[11px] text-ink-secondary">
                        Karyawan dengan rating performa tinggi dan skor kesiapan suksesi.
                      </p>
                    </div>
                    <Link
                      href="/team?tab=mobility"
                      target="_blank"
                      className="text-[11px] text-brand-teal hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <span>Buka Internal Mobility</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="space-y-2">
                    {mobilityMatches.slice(0, 3).map((match) => {
                      const isSelected = selectedCandidateId === match.match_id;
                      return (
                        <div
                          key={match.match_id}
                          onClick={() => {
                            setSelectedCandidateId(match.match_id);
                            setSelectedCandidateName(match.candidate_name);
                            setSelectedCandidateFit(Math.round(match.final_readiness_score));
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? "bg-purple-500/15 border-purple-500"
                              : "bg-surface-card border-surface-border hover:border-purple-500/40"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center">
                              {match.candidate_name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-xs text-ink-primary flex items-center gap-2">
                                <span>{match.candidate_name}</span>
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-surface-ground text-ink-tertiary">
                                  {match.current_role_name}
                                </span>
                              </div>
                              <div className="text-[10px] text-ink-tertiary mt-0.5 flex items-center gap-2">
                                <span>{match.current_location_name}</span>
                                <span>•</span>
                                <span>Rating: {match.performance_rating}/5.0</span>
                                <span>•</span>
                                <span>Tenure: {match.tenure_months}m</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="font-bold text-xs text-purple-400 block">
                                {Math.round(match.final_readiness_score)}% Ready
                              </span>
                              <span className="text-[9px] text-ink-tertiary">{match.readiness_status}</span>
                            </div>
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected ? "bg-purple-500 border-purple-500 text-surface-ground" : "border-surface-border"
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {fulfillmentPathway === "CONVENTIONAL" && (
                <div className="space-y-4 p-4 rounded-xl bg-sky-500/5 border border-sky-500/20 animate-fadeIn">
                  <div>
                    <h4 className="text-xs font-bold text-ink-primary flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-sky-400" />
                      <span>Konfigurasi Multi-Kanal Sourcing Konvensional</span>
                    </h4>
                    <p className="text-[11px] text-ink-secondary mt-0.5">
                      Pilih kanal eksternal yang diaktifkan, masukkan link Google Sheet tracker atau ATS portal, dan jumlah pendaftar.
                    </p>
                  </div>

                  {/* Multi-Channel Checkboxes */}
                  <div>
                    <label className="text-[11px] font-bold text-ink-tertiary block mb-1.5">
                      Kanal Sourcing Aktif (Pilih satu atau lebih):
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        "LinkedIn Jobs",
                        "JobStreet",
                        "Glints",
                        "Employee Referral",
                        "Campus Hiring / Job Fair",
                        "Recruitment Agency",
                      ].map((ch) => {
                        const isChecked = selectedChannels.includes(ch);
                        return (
                          <button
                            key={ch}
                            type="button"
                            onClick={() => toggleChannel(ch)}
                            className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                              isChecked
                                ? "bg-sky-500/15 border-sky-500 text-sky-300"
                                : "bg-surface-card border-surface-border text-ink-secondary hover:border-surface-border/80"
                            }`}
                          >
                            <div
                              className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                                isChecked ? "bg-sky-500 border-sky-500 text-surface-ground" : "border-surface-border"
                              }`}
                            >
                              {isChecked && <Check className="w-2.5 h-2.5" />}
                            </div>
                            <span className="truncate">{ch}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* External Tracker / Google Sheet URL Input */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-ink-primary flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-brand-teal" />
                      <span>Link Google Sheet / ATS Tracker URL</span>
                    </label>
                    <input
                      type="url"
                      value={trackerUrl}
                      onChange={(e) => setTrackerUrl(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/... atau link ATS"
                      className="w-full px-3 py-2 rounded-xl bg-surface-ground border border-surface-border text-xs text-ink-primary focus:border-brand-teal focus:outline-none"
                    />
                    <span className="text-[10px] text-ink-tertiary">
                      Dapat diakses langsung oleh tim TA & Club Manager di tabel monitoring.
                    </span>
                  </div>

                  {/* Initial Applicants count */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-ink-primary block mb-1">
                        Jumlah Pendaftar Awal (Opsional)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={initialApplicants}
                        onChange={(e) => setInitialApplicants(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-2 rounded-xl bg-surface-ground border border-surface-border text-xs text-ink-primary focus:border-brand-teal focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-ink-primary block mb-1">
                        Catatan Sourcing Tambahan
                      </label>
                      <input
                        type="text"
                        value={sourcingNotes}
                        onChange={(e) => setSourcingNotes(e.target.value)}
                        placeholder="Misal: Prioritas domisili sekitar gym"
                        className="w-full px-3 py-2 rounded-xl bg-surface-ground border border-surface-border text-xs text-ink-primary focus:border-brand-teal focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-surface-border bg-surface-ground/50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="px-4 py-2 rounded-xl bg-surface-card border border-surface-border text-xs font-semibold text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmAllocation}
                className="px-5 py-2.5 rounded-xl bg-brand-teal text-surface-ground text-xs font-bold hover:bg-brand-teal/90 transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan ke Database...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Setujui Strategi & Luncurkan ke Monitoring</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
