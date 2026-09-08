'use client';

import React, { useState } from 'react';
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
  Download,
  Info,
} from 'lucide-react';
import { SectionCard, KpiCard, Chip } from '@/components/primitives';

interface CapabilityDefinition {
  id: string;
  name: string;
  category: 'CORE_OPERATIONAL' | 'TECHNICAL_FITNESS' | 'COMMERCIAL' | 'LEADERSHIP';
  description: string;
  // Required level (1-5) per job tier
  levelRequirements: {
    fdo: number; // Front Desk Officer (Tier 1)
    fc: number;  // Fitness Consultant (Tier 2)
    pt: number;  // Personal Trainer (Tier 2)
    lead: number; // Team Leader (Tier 4)
    cm: number;  // Club Manager (Tier 5)
  };
}

const INITIAL_CAPABILITIES: CapabilityDefinition[] = [
  {
    id: 'cap-1',
    name: 'Member Experience & Hospitality Mindset',
    category: 'CORE_OPERATIONAL',
    description: 'Menyambut member dengan ramah, mengelola komplain check-in, dan menjaga kenyamanan gym floor.',
    levelRequirements: { fdo: 4, fc: 4, pt: 4, lead: 5, cm: 5 },
  },
  {
    id: 'cap-2',
    name: 'Gym Floor Safety & Equipment Hygiene',
    category: 'CORE_OPERATIONAL',
    description: 'Disiplin SOP sanitasi beban, inspeksi kelayakan kabel mesin, dan protokol pertolongan pertama (P3K).',
    levelRequirements: { fdo: 3, fc: 3, pt: 4, lead: 4, cm: 5 },
  },
  {
    id: 'cap-3',
    name: 'Consultative Sales & Value Closing',
    category: 'COMMERCIAL',
    description: 'Menggali fitness goals calon member, menghandle keberatan harga, dan closing membership/PT packages.',
    levelRequirements: { fdo: 2, fc: 5, pt: 4, lead: 5, cm: 5 },
  },
  {
    id: 'cap-4',
    name: 'Biomechanics & Fitness Programming',
    category: 'TECHNICAL_FITNESS',
    description: 'Penguasaan anatomi gerak, evaluasi postur tubuh, perancangan periodisasi latihan hipertrofi dan fat loss.',
    levelRequirements: { fdo: 1, fc: 2, pt: 5, lead: 4, cm: 3 },
  },
  {
    id: 'cap-5',
    name: 'Team Collaboration & Shift Handover',
    category: 'CORE_OPERATIONAL',
    description: 'Komunikasi transparan saat pergantian shift (opening/closing), log POS, dan koordinasi antar departemen.',
    levelRequirements: { fdo: 3, fc: 3, pt: 3, lead: 4, cm: 5 },
  },
  {
    id: 'cap-6',
    name: 'Floor Crisis & Problem Solving',
    category: 'CORE_OPERATIONAL',
    description: 'Ketangkasan mengatasi mati listrik, kebocoran air, konflik member, atau kendala sistem pembayaran POS.',
    levelRequirements: { fdo: 2, fc: 2, pt: 2, lead: 4, cm: 5 },
  },
  {
    id: 'cap-7',
    name: 'People Coaching & Leadership Mentoring',
    category: 'LEADERSHIP',
    description: 'Membimbing junior joiners (buddy onboarding), evaluasi KPI 1-on-1, dan menjaga motivasi shift floor.',
    levelRequirements: { fdo: 1, fc: 1, pt: 1, lead: 4, cm: 5 },
  },
];

const PROFICIENCY_LEVELS = [
  { level: 1, label: 'Aware', desc: 'Memahami prinsip dasar di bawah supervisi langsung' },
  { level: 2, label: 'Developing', desc: 'Mampu mengeksekusi dengan bantuan checklist/SOP' },
  { level: 3, label: 'Capable', desc: 'Eksekusi mandiri tanpa perlu diawasi secara harian' },
  { level: 4, label: 'Independent', desc: 'Menguasai variasi kasus rumit & menyelesaikan friksi' },
  { level: 5, label: 'Coaches Others', desc: 'Menjadi role model, mentor, dan melatih staf lain' },
];

export default function CapabilityFrameworkPage() {
  const [capabilities, setCapabilities] = useState<CapabilityDefinition[]>(INITIAL_CAPABILITIES);
  const [selectedRoleKey, setSelectedRoleKey] = useState<'fdo' | 'fc' | 'pt' | 'lead' | 'cm'>('fc');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const roleMeta = {
    fdo: { title: 'Front Desk Officer', tier: 'Tier 1 &bull; Frontline Associate', dept: 'Club Operations' },
    fc: { title: 'Fitness Consultant', tier: 'Tier 2 &bull; Commercial Specialist', dept: 'Sales & Membership' },
    pt: { title: 'Personal Trainer', tier: 'Tier 2 &bull; Fitness Specialist', dept: 'Fitness Training' },
    lead: { title: 'Team Leader (FC/PT)', tier: 'Tier 4 &bull; Floor Supervisor', dept: 'Leadership' },
    cm: { title: 'Club Manager', tier: 'Tier 5 &bull; Club Business Manager', dept: 'Management' },
  };

  const handleLevelChange = (capId: string, newLevel: number) => {
    setCapabilities(
      capabilities.map((c) => {
        if (c.id === capId) {
          return {
            ...c,
            levelRequirements: {
              ...c.levelRequirements,
              [selectedRoleKey]: newLevel,
            },
          };
        }
        return c;
      })
    );
  };

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 4000);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(capabilities, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', 'FITHUB_Capability_Framework_v2.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default pb-5">
        <div>
          <Link
            href="/team?tab=mobility"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-teal hover:text-brand-navy transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Modul Mobility &amp; Talent Match</span>
          </Link>
          <h1 className="font-spartan text-3xl font-extrabold text-ink-primary tracking-tight flex items-center gap-2.5">
            <Award className="w-7 h-7 text-brand-teal" />
            <span>Frontline Capability Framework Editor</span>
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1 max-w-3xl leading-relaxed">
            Standar kompetensi 5-level ala Paragon PDS &amp; Mercer untuk memperjelas ekspektasi jenjang karir frontline staff dan dasar promosi internal (*Operationalizing Notebook Section 5.3 Action 2*).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 rounded-xl bg-surface-soft border border-border-default text-xs font-bold text-ink-primary hover:border-brand-teal transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-brand-teal" />
            <span>Export Schema</span>
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-brand-teal text-white font-bold text-xs hover:bg-brand-teal/90 transition-all flex items-center gap-2 shadow-card"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Matriks</span>
          </button>
        </div>
      </div>

      {/* Save Toast */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-[#EBF7F0] border border-status-healthy/30 flex items-center gap-3 text-status-healthy animate-fadeIn shadow-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-xs font-bold">
            Perubahan standar kompetensi berhasil disimpan ke basis data Mobility Engine!
          </span>
        </div>
      )}

      {/* 5-Point Proficiency Scale Reference */}
      <div className="p-4 rounded-2xl bg-surface-soft border border-border-default/80">
        <span className="label-xs text-ink-secondary block mb-2">Panduan Standar 5 Level Profisiensi (Paragon PDS Style)</span>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {PROFICIENCY_LEVELS.map((p) => (
            <div key={p.level} className="p-3 rounded-xl bg-white border border-border-default/60 shadow-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-5 h-5 rounded-full bg-brand-navy text-white text-[10px] font-bold flex items-center justify-center">
                  {p.level}
                </span>
                <span className="font-spartan font-bold text-xs text-ink-primary">{p.label}</span>
              </div>
              <p className="text-[11px] text-ink-secondary leading-snug">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Role Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-border-default pb-2">
        {(['fc', 'pt', 'fdo', 'lead', 'cm'] as const).map((key) => {
          const isActive = selectedRoleKey === key;
          const meta = roleMeta[key];
          return (
            <button
              key={key}
              onClick={() => setSelectedRoleKey(key)}
              className={`p-3 rounded-xl border text-left transition-all shrink-0 min-w-[180px] ${
                isActive
                  ? 'bg-brand-navy text-white border-brand-navy shadow-card'
                  : 'bg-white border-border-default text-ink-secondary hover:border-brand-teal'
              }`}
            >
              <span className="text-[10px] uppercase font-bold block opacity-80">{meta.dept}</span>
              <span className={`font-spartan font-bold text-sm block ${isActive ? 'text-white' : 'text-ink-primary'}`}>
                {meta.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Capability Matrix per Selected Role */}
      <SectionCard
        title={`Matriks Ekspektasi: ${roleMeta[selectedRoleKey].title}`}
        description={`Tentukan tingkat profisiensi minimal (1-5) yang harus dikuasai oleh ${roleMeta[selectedRoleKey].title}.`}
        note="Insight Notebook: Karir staf frontline sering terhambat karena tidak ada transparansi kompetensi apa yang dibutuhkan untuk naik dari FC/PT ke Team Leader dan Club Manager."
      >
        <div className="space-y-4 pt-2">
          {capabilities.map((cap) => {
            const currentLevel = cap.levelRequirements[selectedRoleKey];
            const levelObj = PROFICIENCY_LEVELS.find((p) => p.level === currentLevel) || PROFICIENCY_LEVELS[2];

            return (
              <div
                key={cap.id}
                className="p-4 rounded-xl bg-surface-soft border border-border-default flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-brand-teal/50 transition-all"
              >
                <div className="max-w-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-spartan font-bold text-sm text-ink-primary">{cap.name}</span>
                    <Chip label={cap.category.replace('_', ' ')} tone="teal" size="sm" />
                  </div>
                  <p className="text-xs text-ink-secondary leading-relaxed">{cap.description}</p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                  {/* Visual Level Buttons */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-border-default">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => handleLevelChange(cap.id, lvl)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                          currentLevel === lvl
                            ? 'bg-brand-teal text-white shadow-sm'
                            : 'text-ink-secondary hover:bg-surface-soft'
                        }`}
                        title={`Set level to ${lvl}`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>

                  <div className="min-w-[130px] text-right">
                    <span className="text-xs font-bold text-brand-navy block">
                      Level {currentLevel}: {levelObj.label}
                    </span>
                    <span className="text-[10px] text-ink-muted leading-tight block">
                      Target Penguasaan
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Career Ladder Progression View */}
      <SectionCard
        title="Visualisasi Jalur Karir Frontline (Progression Ladder)"
        description="Peta lompatan kompetensi dari staff pemula hingga pimpinan cabang."
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-surface-soft border border-border-default">
            <span className="label-xs text-ink-secondary">Langkah 1</span>
            <h4 className="font-spartan font-bold text-sm text-ink-primary mt-1">Front Desk / Junior FC</h4>
            <p className="text-xs text-ink-secondary mt-1">Fokus Level 2-3: Disiplin floor, keramahan check-in, dan penutupan paket dasar.</p>
          </div>

          <div className="p-4 rounded-xl bg-surface-soft border border-border-default">
            <span className="label-xs text-brand-teal">Langkah 2</span>
            <h4 className="font-spartan font-bold text-sm text-ink-primary mt-1">Senior FC / Master Trainer</h4>
            <p className="text-xs text-ink-secondary mt-1">Fokus Level 4: Pencapaian target mandiri, penanganan klien VIP, dan program biomekanik kompleks.</p>
          </div>

          <div className="p-4 rounded-xl bg-surface-soft border border-border-default">
            <span className="label-xs text-status-attention">Langkah 3</span>
            <h4 className="font-spartan font-bold text-sm text-ink-primary mt-1">Floor Team Leader</h4>
            <p className="text-xs text-ink-secondary mt-1">Fokus Level 4-5: Supervisi shift, mentoring junior joiners (buddy system), dan audit safety gym floor.</p>
          </div>

          <div className="p-4 rounded-xl bg-surface-soft border border-border-default border-l-4 border-l-brand-yellow">
            <span className="label-xs text-status-healthy">Langkah 4 (Puncak Cabang)</span>
            <h4 className="font-spartan font-bold text-sm text-ink-primary mt-1">Club Manager</h4>
            <p className="text-xs text-ink-secondary mt-1">Fokus Level 5: P&amp;L revenue cabang, pencegahan turnover dini, dan kepemimpinan menyeluruh.</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
