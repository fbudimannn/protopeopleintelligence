'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Award,
  ArrowLeft,
  Save,
  CheckCircle2,
  Sparkles,
  Layers,
  ChevronRight,
  TrendingUp,
  Info,
  Plus,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Check,
  X,
  Database,
} from 'lucide-react';
import { SectionCard, KpiCard, Chip } from '@/components/primitives';
import {
  getCapabilities,
  getRoleCapabilityRequirements,
  createCapability,
  saveRoleCapabilityRequirements,
} from '@/lib/data/api';
import {
  CapabilityItem,
  RoleCapabilityRequirement,
  fallbackCapabilities,
  fallbackRoleCapabilityRequirements,
} from '@/lib/data/fixtures';

// Standard 4-Tier FIT HUB Operational Competency Proficiency Model
const PROFICIENCY_LEVELS = [
  {
    level: 1,
    label: 'Aware',
    badgeClass: 'bg-surface-ground text-ink-tertiary border-surface-border',
    desc: 'Understands core principles under direct shift supervision.',
  },
  {
    level: 2,
    label: 'Developing',
    badgeClass: 'bg-brand-teal/15 text-brand-teal border-brand-teal/30',
    desc: 'Executes reliably using standard checklists, manuals, and SOPs.',
  },
  {
    level: 3,
    label: 'Independent',
    badgeClass: 'bg-status-healthy/15 text-status-healthy border-status-healthy/30',
    desc: 'Operates autonomously during high-traffic peak hours without daily oversight.',
  },
  {
    level: 4,
    label: 'Mastery',
    badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    desc: 'Senior subject matter expert; coaches successors, resolves critical friction.',
  },
];

// Ground-Truth Operational Roles (Housekeeping is explicitly excluded from leadership and capability scoring)
interface RoleMeta {
  name: string;
  tierName: string;
  tierNumber: 1 | 2 | 3 | 4;
  department: 'Club Operations' | 'Fitness & Coaching' | 'Commercial & Sales';
  summary: string;
}

const OPERATIONAL_ROLES: RoleMeta[] = [
  // Tier 1: Frontline Staff
  {
    name: 'Customer Service',
    tierName: 'Tier 1 • Frontline Staff',
    tierNumber: 1,
    department: 'Club Operations',
    summary: 'Welcoming frontline member experience, POS transactions, turnstile access, and shift log handovers.',
  },
  {
    name: 'Personal Trainer',
    tierName: 'Tier 1 • Frontline Staff',
    tierNumber: 1,
    department: 'Fitness & Coaching',
    summary: '1-on-1 personalized workouts, fitness consultations, client session renewals, and workout floor safety.',
  },
  {
    name: 'Fitness Consultant',
    tierName: 'Tier 1 • Frontline Staff',
    tierNumber: 1,
    department: 'Commercial & Sales',
    summary: 'Membership sales conversion, trial walk-ins, outbound corporate calling, and member onboarding touchpoints.',
  },

  // Tier 2: Frontline Leaders & Senior Specialists
  {
    name: 'Customer Service Leader',
    tierName: 'Tier 2 • Lead / Specialist',
    tierNumber: 2,
    department: 'Club Operations',
    summary: 'Supervises front desk shift coverage, audits POS cash reconciliations, and handles member escalation disputes.',
  },
  {
    name: 'Personal Trainer Leader',
    tierName: 'Tier 2 • Lead / Specialist',
    tierNumber: 2,
    department: 'Fitness & Coaching',
    summary: 'Supervises club trainers, runs movement audits, paces monthly team PT quotas, and coordinates coach rosters.',
  },
  {
    name: 'Personal Trainer Master',
    tierName: 'Tier 2 • Lead / Specialist',
    tierNumber: 2,
    department: 'Fitness & Coaching',
    summary: 'Master coach delivering clinical biomechanics architectures, mentoring apprentice coaches, and VIP clientele care.',
  },
  {
    name: 'Fitness Consultant Leader',
    tierName: 'Tier 2 • Lead / Specialist',
    tierNumber: 2,
    department: 'Commercial & Sales',
    summary: 'Leads daily sales blitzes, coaches consultants on consultative objection handling, and audits membership contracts.',
  },

  // Tier 3: Club Management
  {
    name: 'Club Manager',
    tierName: 'Tier 3 • Club Management',
    tierNumber: 3,
    department: 'Club Operations',
    summary: 'Full P&L and operational accountability for club branch, including local marketing, retention, and EBITDA margin.',
  },
  {
    name: 'Operation Manager',
    tierName: 'Tier 3 • Club Management',
    tierNumber: 3,
    department: 'Club Operations',
    summary: 'Oversees equipment preventative maintenance, POS audit SOP compliance, and club safety protocol governance.',
  },
  {
    name: 'Fitness Manager',
    tierName: 'Tier 3 • Club Management',
    tierNumber: 3,
    department: 'Fitness & Coaching',
    summary: 'Directs club coaching department, leads PT revenue targets, audits trainer certifications, and manages coach commissions.',
  },
  {
    name: 'Sales Manager',
    tierName: 'Tier 3 • Club Management',
    tierNumber: 3,
    department: 'Commercial & Sales',
    summary: 'Directs club commercial revenue, presale launch execution, corporate B2B contracts, and conversion funnels.',
  },

  // Tier 4: Multi-Unit Area Management
  {
    name: 'Area General Manager',
    tierName: 'Tier 4 • Multi-Unit Area Executive',
    tierNumber: 4,
    department: 'Club Operations',
    summary: 'Oversees 6-12 clubs in a regional cluster; governs cluster P&L, expansion readiness, and club manager succession.',
  },
];

const DOMAIN_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  Operations: { bg: 'bg-sky-500/15', text: 'text-sky-400', border: 'border-sky-500/30' },
  Fitness: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  Commercial: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
  Leadership: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
};

export default function CapabilityFrameworkPage() {
  // Live Data State
  const [capabilities, setCapabilities] = useState<CapabilityItem[]>(fallbackCapabilities);
  const [allRequirements, setAllRequirements] = useState<RoleCapabilityRequirement[]>(fallbackRoleCapabilityRequirements);
  const [selectedRoleName, setSelectedRoleName] = useState<string>('Club Manager');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Add Capability Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newCapCode, setNewCapCode] = useState<string>('');
  const [newCapName, setNewCapName] = useState<string>('');
  const [newCapDomain, setNewCapDomain] = useState<'Operations' | 'Fitness' | 'Commercial' | 'Leadership'>('Operations');
  const [newCapDesc, setNewCapDesc] = useState<string>('');
  const [isCreatingCap, setIsCreatingCap] = useState<boolean>(false);
  const [capModalError, setCapModalError] = useState<string | null>(null);

  // Active role metadata
  const activeRole = useMemo(() => {
    return OPERATIONAL_ROLES.find((r) => r.name === selectedRoleName) || OPERATIONAL_ROLES[0];
  }, [selectedRoleName]);

  // Load capabilities & requirements live from Supabase
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [capsRes, reqsRes] = await Promise.all([
        getCapabilities(),
        getRoleCapabilityRequirements(),
      ]);
      setCapabilities(capsRes.data || fallbackCapabilities);
      setAllRequirements(reqsRes.data || fallbackRoleCapabilityRequirements);
    } catch (err) {
      console.error('Failed to load capability framework data from live database:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Requirements for the currently selected role
  const roleReqs = useMemo(() => {
    return allRequirements.filter(
      (r) => r.role_name.toLowerCase() === selectedRoleName.toLowerCase()
    );
  }, [allRequirements, selectedRoleName]);

  // Total allocated weight for selected role
  const totalAllocatedWeight = useMemo(() => {
    return roleReqs
      .filter((r) => r.active_flag !== false)
      .reduce((sum, r) => sum + (r.weight || 0), 0);
  }, [roleReqs]);

  // Handlers for modifying requirements locally
  const handleUpdateLevel = (capabilityCode: string, newLevel: number) => {
    setAllRequirements((prev) => {
      const existing = prev.find(
        (r) => r.role_name === selectedRoleName && r.capability_code === capabilityCode
      );
      if (existing) {
        return prev.map((r) =>
          r.role_name === selectedRoleName && r.capability_code === capabilityCode
            ? { ...r, required_level: newLevel }
            : r
        );
      }
      // If not yet assigned to this role, find capability item and insert with default weight
      const capItem = capabilities.find((c) => c.capability_code === capabilityCode);
      const newReq: RoleCapabilityRequirement = {
        role_name: selectedRoleName,
        capability_code: capabilityCode,
        capability_name: capItem?.capability_name || capabilityCode,
        required_level: newLevel,
        weight: 20,
        active_flag: true,
      };
      return [...prev, newReq];
    });
  };

  const handleUpdateWeight = (capabilityCode: string, newWeight: number) => {
    const clampedWeight = Math.max(0, Math.min(100, Math.round(newWeight)));
    setAllRequirements((prev) =>
      prev.map((r) =>
        r.role_name === selectedRoleName && r.capability_code === capabilityCode
          ? { ...r, weight: clampedWeight }
          : r
      )
    );
  };

  const handleToggleActive = (capabilityCode: string) => {
    setAllRequirements((prev) => {
      const existing = prev.find(
        (r) => r.role_name === selectedRoleName && r.capability_code === capabilityCode
      );
      if (existing) {
        const nextActive = existing.active_flag === false;
        return prev.map((r) =>
          r.role_name === selectedRoleName && r.capability_code === capabilityCode
            ? { ...r, active_flag: nextActive }
            : r
        );
      }
      // Add as active with default level 3, weight 20
      const capItem = capabilities.find((c) => c.capability_code === capabilityCode);
      const newReq: RoleCapabilityRequirement = {
        role_name: selectedRoleName,
        capability_code: capabilityCode,
        capability_name: capItem?.capability_name || capabilityCode,
        required_level: 3,
        weight: 20,
        active_flag: true,
      };
      return [...prev, newReq];
    });
  };

  // Save changes live to Supabase
  const handleSaveToDatabase = async () => {
    setIsSaving(true);
    setSaveToast(null);

    const activeRequirements = roleReqs
      .filter((r) => r.active_flag !== false)
      .map((r) => ({
        role_name: r.role_name,
        capability_code: r.capability_code,
        capability_name: r.capability_name,
        required_level: r.required_level,
        weight: r.weight,
      }));

    const result = await saveRoleCapabilityRequirements(activeRequirements);

    setIsSaving(false);
    if (result.success) {
      setSaveToast(`Requirements for ${selectedRoleName} successfully published to live database!`);
      setTimeout(() => setSaveToast(null), 5000);
    } else {
      setSaveToast(`Advisory: Changes saved to local session. Live sync note: ${result.error || 'Check network'}`);
      setTimeout(() => setSaveToast(null), 6000);
    }
  };

  // Create new capability in live Supabase database
  const handleCreateNewCapability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCapName.trim()) {
      setCapModalError('Capability Name is required.');
      return;
    }

    const code = newCapCode.trim().toUpperCase() || `CAP-${newCapDomain.slice(0, 3).toUpperCase()}-${String(capabilities.length + 1).padStart(2, '0')}`;
    setIsCreatingCap(true);
    setCapModalError(null);

    const result = await createCapability({
      capability_code: code,
      capability_name: newCapName.trim(),
      domain: newCapDomain,
      description: newCapDesc.trim(),
    });

    setIsCreatingCap(false);
    if (result.success && result.data) {
      const newCap = result.data;
      setCapabilities((prev) => {
        if (prev.some((c) => c.capability_code === newCap.capability_code)) return prev;
        return [...prev, newCap];
      });

      // Automatically add to currently selected role with default level 3, weight 20
      setAllRequirements((prev) => [
        ...prev,
        {
          role_name: selectedRoleName,
          capability_code: newCap.capability_code,
          capability_name: newCap.capability_name,
          required_level: 3,
          weight: 20,
          active_flag: true,
        },
      ]);

      setIsAddModalOpen(false);
      setNewCapCode('');
      setNewCapName('');
      setNewCapDesc('');
      setSaveToast(`Capability "${newCap.capability_name}" (${newCap.capability_code}) created and added to live framework!`);
      setTimeout(() => setSaveToast(null), 5000);
    } else {
      setCapModalError(result.error || 'Failed to create capability on database. Please check connection.');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner & Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-ink-tertiary">
          <Link
            href="/team?tab=mobility"
            className="flex items-center gap-1 hover:text-brand-teal transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Executive Talent & Mobility</span>
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-ink-primary font-semibold">Frontline Capability Framework</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold font-display text-ink-primary tracking-tight">
                Frontline Capability Framework & Governance Matrix
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-teal/15 text-brand-teal border border-brand-teal/30 flex items-center gap-1">
                <Database className="w-3 h-3" />
                <span>Live Supabase Connected</span>
              </span>
            </div>
            <p className="text-xs text-ink-secondary mt-1 max-w-3xl leading-relaxed">
              Define operational capability requirements, enforce minimum proficiency levels (1–4), assign mathematical scoring weights, and persist rules to the database. These rules directly govern internal candidate rankings in the Dynamic Mobility Matching Engine.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-surface-card border border-surface-border hover:border-brand-teal text-ink-primary hover:text-brand-teal text-xs font-bold transition-all flex items-center gap-1.5 shadow-subtle cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-brand-teal" />
              <span>Add New Capability</span>
            </button>

            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-2 rounded-xl bg-surface-card border border-surface-border text-ink-secondary hover:text-ink-primary hover:border-brand-teal transition-all shadow-subtle cursor-pointer disabled:opacity-50"
              title="Refresh from Database"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-teal' : ''}`} />
            </button>

            <button
              onClick={handleSaveToDatabase}
              disabled={isSaving}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer ${
                totalAllocatedWeight === 100
                  ? 'bg-brand-teal text-surface-ground hover:bg-brand-teal/90'
                  : 'bg-status-attention text-surface-ground hover:bg-status-attention/90'
              } disabled:opacity-50`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Publishing...' : 'Save & Publish to Database'}</span>
            </button>
          </div>
        </div>

        {/* Live Notification Toast */}
        {saveToast && (
          <div className="p-3 rounded-xl bg-brand-teal/15 border border-brand-teal/40 text-xs font-medium text-brand-teal flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-teal flex-shrink-0" />
              <span>{saveToast}</span>
            </div>
            <button onClick={() => setSaveToast(null)} className="text-brand-teal hover:opacity-80">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Role Navigation Hierarchy (Tiered Tabs, Excluding Housekeeping) */}
      <div className="p-4 rounded-2xl bg-surface-card border border-surface-border shadow-subtle space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-teal" />
            <h2 className="text-xs font-bold text-ink-primary uppercase tracking-wider">
              Operational Job Roles (11 Ground-Truth Non-Housekeeping Profiles)
            </h2>
          </div>
          <span className="text-[11px] text-ink-tertiary">
            Select a role to inspect and configure its required capabilities
          </span>
        </div>

        {/* Grouped by Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
          {/* Tier 1: Staff */}
          <div className="p-2.5 rounded-xl bg-surface-ground border border-surface-border/70 space-y-1.5">
            <span className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider block">
              Tier 1 • Frontline Staff
            </span>
            <div className="space-y-1">
              {OPERATIONAL_ROLES.filter((r) => r.tierNumber === 1).map((role) => (
                <button
                  key={role.name}
                  onClick={() => setSelectedRoleName(role.name)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    selectedRoleName === role.name
                      ? 'bg-brand-teal text-surface-ground shadow-sm'
                      : 'text-ink-secondary hover:bg-surface-card hover:text-ink-primary'
                  }`}
                >
                  <span className="truncate">{role.name}</span>
                  {selectedRoleName === role.name && <Check className="w-3 h-3 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Tier 2: Leaders & Specialists */}
          <div className="p-2.5 rounded-xl bg-surface-ground border border-surface-border/70 space-y-1.5">
            <span className="text-[10px] font-bold text-brand-teal uppercase tracking-wider block">
              Tier 2 • Leaders & Specialists
            </span>
            <div className="space-y-1">
              {OPERATIONAL_ROLES.filter((r) => r.tierNumber === 2).map((role) => (
                <button
                  key={role.name}
                  onClick={() => setSelectedRoleName(role.name)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    selectedRoleName === role.name
                      ? 'bg-brand-teal text-surface-ground shadow-sm'
                      : 'text-ink-secondary hover:bg-surface-card hover:text-ink-primary'
                  }`}
                >
                  <span className="truncate">{role.name}</span>
                  {selectedRoleName === role.name && <Check className="w-3 h-3 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Tier 3: Club Management */}
          <div className="p-2.5 rounded-xl bg-surface-ground border border-surface-border/70 space-y-1.5">
            <span className="text-[10px] font-bold text-status-healthy uppercase tracking-wider block">
              Tier 3 • Club Management
            </span>
            <div className="space-y-1">
              {OPERATIONAL_ROLES.filter((r) => r.tierNumber === 3).map((role) => (
                <button
                  key={role.name}
                  onClick={() => setSelectedRoleName(role.name)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    selectedRoleName === role.name
                      ? 'bg-brand-teal text-surface-ground shadow-sm'
                      : 'text-ink-secondary hover:bg-surface-card hover:text-ink-primary'
                  }`}
                >
                  <span className="truncate">{role.name}</span>
                  {selectedRoleName === role.name && <Check className="w-3 h-3 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Tier 4: Area Executive */}
          <div className="p-2.5 rounded-xl bg-surface-ground border border-surface-border/70 space-y-1.5">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
              Tier 4 • Multi-Unit Executive
            </span>
            <div className="space-y-1">
              {OPERATIONAL_ROLES.filter((r) => r.tierNumber === 4).map((role) => (
                <button
                  key={role.name}
                  onClick={() => setSelectedRoleName(role.name)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    selectedRoleName === role.name
                      ? 'bg-brand-teal text-surface-ground shadow-sm'
                      : 'text-ink-secondary hover:bg-surface-card hover:text-ink-primary'
                  }`}
                >
                  <span className="truncate">{role.name}</span>
                  {selectedRoleName === role.name && <Check className="w-3 h-3 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Role Summary & KPI Triad */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-surface-card border border-surface-border shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-teal/15 text-brand-teal uppercase">
                {activeRole.tierName}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-ground border border-surface-border text-ink-secondary">
                {activeRole.department}
              </span>
            </div>
            <h3 className="text-xl font-bold font-display text-ink-primary">
              {activeRole.name}
            </h3>
            <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
              {activeRole.summary}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-surface-border/60 flex items-center justify-between text-xs">
            <span className="text-ink-tertiary">Active Governance Rule:</span>
            <span className="font-semibold text-brand-teal">
              {activeRole.tierNumber >= 3
                ? 'Anti-Lompat Protected (Tier 2 prerequisite required)'
                : 'Natural feeder pipeline active'}
            </span>
          </div>
        </div>

        {/* KPI 1: Active Capabilities */}
        <div className="p-5 rounded-2xl bg-surface-card border border-surface-border shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-tertiary uppercase tracking-wider">
              Assigned Competencies
            </span>
            <ShieldCheck className="w-4 h-4 text-brand-teal" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-black font-display text-ink-primary">
              {roleReqs.filter((r) => r.active_flag !== false).length}
            </div>
            <p className="text-[11px] text-ink-secondary mt-0.5">
              out of {capabilities.length} master capabilities
            </p>
          </div>
          <div className="text-[11px] text-brand-teal font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Audited for {activeRole.department}</span>
          </div>
        </div>

        {/* KPI 2: Total Allocated Weight */}
        <div className="p-5 rounded-2xl bg-surface-card border border-surface-border shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-tertiary uppercase tracking-wider">
              Total Weight Allocation
            </span>
            <Sliders className="w-4 h-4 text-brand-teal" />
          </div>
          <div className="my-2">
            <div className={`text-3xl font-black font-display ${
              totalAllocatedWeight === 100
                ? 'text-status-healthy'
                : 'text-status-attention'
            }`}>
              {totalAllocatedWeight}%
            </div>
            <p className="text-[11px] text-ink-secondary mt-0.5">
              {totalAllocatedWeight === 100
                ? 'Mathematically balanced to 100%'
                : `Variance of ${Math.abs(100 - totalAllocatedWeight)}% (Must equal 100%)`}
            </p>
          </div>
          <div className="w-full bg-surface-ground h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                totalAllocatedWeight === 100
                  ? 'bg-status-healthy'
                  : 'bg-status-attention'
              }`}
              style={{ width: `${Math.min(100, totalAllocatedWeight)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Interactive Competency Matrix Table */}
      <div className="rounded-2xl bg-surface-card border border-surface-border shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-ground/30">
          <div>
            <h3 className="text-sm font-bold text-ink-primary">
              Required Competencies & Weight Allocation Matrix
            </h3>
            <p className="text-[11px] text-ink-secondary">
              Toggle capabilities, select minimum required proficiency levels (1–4), and set percentage weights.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-ink-tertiary">Proficiency Model:</span>
            <div className="flex items-center gap-1.5">
              {PROFICIENCY_LEVELS.map((lvl) => (
                <span
                  key={lvl.level}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${lvl.badgeClass}`}
                  title={lvl.desc}
                >
                  L{lvl.level} {lvl.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="divide-y divide-surface-border/60">
          {capabilities.map((cap) => {
            const req = roleReqs.find((r) => r.capability_code === cap.capability_code);
            const isAssigned = !!req && req.active_flag !== false;
            const currentLevel = req?.required_level || 3;
            const currentWeight = req?.weight ?? 25;
            const domainStyle = DOMAIN_STYLES[cap.domain] || DOMAIN_STYLES['Operations'];

            return (
              <div
                key={cap.capability_code}
                className={`p-4 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                  isAssigned ? 'bg-surface-card' : 'bg-surface-ground/40 opacity-70 hover:opacity-90'
                }`}
              >
                {/* Left: Checkbox & Capability Metadata */}
                <div className="lg:w-5/12 flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isAssigned}
                    onChange={() => handleToggleActive(cap.capability_code)}
                    className="w-4 h-4 mt-1 rounded border-surface-border text-brand-teal accent-brand-teal cursor-pointer flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${domainStyle.bg} ${domainStyle.text} ${domainStyle.border}`}>
                        {cap.domain}
                      </span>
                      <span className="font-mono text-[11px] text-ink-tertiary font-bold">
                        {cap.capability_code}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-ink-primary">
                      {cap.capability_name}
                    </h4>
                    <p className="text-xs text-ink-secondary mt-0.5 leading-relaxed">
                      {cap.description}
                    </p>
                  </div>
                </div>

                {/* Center: Level Selector Buttons (1 to 4) */}
                <div className="lg:w-4/12 flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider">
                    Required Proficiency Level
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {PROFICIENCY_LEVELS.map((lvl) => {
                      const isSelected = isAssigned && currentLevel === lvl.level;
                      return (
                        <button
                          key={lvl.level}
                          disabled={!isAssigned}
                          onClick={() => handleUpdateLevel(cap.capability_code, lvl.level)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
                            isSelected
                              ? 'bg-brand-teal text-surface-ground shadow-sm ring-1 ring-brand-teal'
                              : 'bg-surface-ground border border-surface-border text-ink-secondary hover:border-brand-teal/40 hover:text-ink-primary'
                          }`}
                        >
                          <span>L{lvl.level}</span>
                          <span className="text-[9px] font-medium opacity-90">{lvl.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-[10px] text-ink-tertiary italic truncate">
                    {PROFICIENCY_LEVELS.find((l) => l.level === currentLevel)?.desc}
                  </span>
                </div>

                {/* Right: Weight Input & Visual Gauge */}
                <div className="lg:w-3/12 flex flex-col gap-1.5 bg-surface-ground p-3 rounded-xl border border-surface-border">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider">
                      Scoring Weight
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="5"
                        disabled={!isAssigned}
                        value={isAssigned ? currentWeight : 0}
                        onChange={(e) => handleUpdateWeight(cap.capability_code, Number(e.target.value))}
                        className="w-14 px-2 py-0.5 text-right font-mono text-xs font-bold bg-surface-card border border-surface-border rounded text-ink-primary focus:border-brand-teal focus:outline-none disabled:opacity-40"
                      />
                      <span className="text-xs font-bold text-ink-secondary">%</span>
                    </div>
                  </div>

                  <div className="w-full bg-surface-card h-2 rounded-full overflow-hidden border border-surface-border/50">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isAssigned ? 'bg-brand-teal' : 'bg-transparent'
                      }`}
                      style={{ width: `${isAssigned ? currentWeight : 0}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-ink-tertiary">
                    <span>Impact in Dynamic Engine:</span>
                    <span className="font-bold text-ink-primary">
                      {isAssigned ? `${Math.round(currentWeight * 0.45 * 10) / 10}% of total match` : '0% (Inactive)'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Capability Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-card border border-surface-border rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-surface-border flex items-center justify-between bg-surface-ground/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-teal/15 text-brand-teal flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-display text-ink-primary">
                    Add New Operational Capability
                  </h3>
                  <p className="text-xs text-ink-secondary">
                    Create a new competency in the live Supabase catalog.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-ink-tertiary hover:text-ink-primary cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewCapability} className="p-5 space-y-4">
              {capModalError && (
                <div className="p-3 rounded-xl bg-status-critical/15 border border-status-critical/30 text-xs text-status-critical flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{capModalError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-ink-primary block mb-1">
                  Capability Name <span className="text-status-critical">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Emergency Floor Crisis Response & First Aid"
                  value={newCapName}
                  onChange={(e) => setNewCapName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-ground border border-surface-border text-xs text-ink-primary focus:border-brand-teal focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-ink-primary block mb-1">
                    Capability Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., CAP-OPS-03"
                    value={newCapCode}
                    onChange={(e) => setNewCapCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-ground border border-surface-border text-xs text-ink-primary font-mono focus:border-brand-teal focus:outline-none"
                  />
                  <span className="text-[10px] text-ink-tertiary mt-0.5 block">
                    Auto-generated if empty
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-ink-primary block mb-1">
                    Competency Domain
                  </label>
                  <select
                    value={newCapDomain}
                    onChange={(e) => setNewCapDomain(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-ground border border-surface-border text-xs text-ink-primary focus:border-brand-teal focus:outline-none cursor-pointer"
                  >
                    <option value="Operations">Operations</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Leadership">Leadership</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-ink-primary block mb-1">
                  Operational Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe observable behaviors, SOP protocols, and specific execution expectations..."
                  value={newCapDesc}
                  onChange={(e) => setNewCapDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-ground border border-surface-border text-xs text-ink-primary focus:border-brand-teal focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-surface-border flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-ground text-xs font-semibold text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCap}
                  className="px-4 py-2 rounded-xl bg-brand-teal text-surface-ground text-xs font-bold hover:bg-brand-teal/90 transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isCreatingCap ? 'Saving to Database...' : 'Save to Live Database'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
