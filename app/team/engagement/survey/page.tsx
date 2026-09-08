'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HeartHandshake,
  ArrowLeft,
  Plus,
  Trash2,
  Download,
  Play,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { SectionCard, KpiCard, Chip } from '@/components/primitives';
import { ColoredBar, StackedBarShare } from '@/components/charts';

interface QuestionItem {
  id: string;
  dimension: string;
  questionText: string;
  category: 'CULTURE' | 'LEADERSHIP' | 'ENVIRONMENT' | 'COMPENSATION' | 'WORKLOAD' | 'CUSTOM';
}

const DEFAULT_QUESTIONS: QuestionItem[] = [
  {
    id: 'q1',
    dimension: 'Company Culture & Pride',
    questionText: 'Seberapa bangga Anda merekomendasikan FIT HUB sebagai tempat bekerja kepada rekan Anda?',
    category: 'CULTURE',
  },
  {
    id: 'q2',
    dimension: 'Team Collaboration & Atmosphere',
    questionText: 'Apakah rekan satu shift Anda saling mendukung dalam menjaga operasional gym floor?',
    category: 'ENVIRONMENT',
  },
  {
    id: 'q3',
    dimension: 'Direct Supervisor Support',
    questionText: 'Apakah Club Manager Anda memberikan arahan dan bimbingan berkala secara transparan?',
    category: 'LEADERSHIP',
  },
  {
    id: 'q4',
    dimension: 'Gym Floor & Facilities',
    questionText: 'Apakah peralatan gym, kebersihan, dan sistem POS di club Anda mendukung kelancaran shift?',
    category: 'ENVIRONMENT',
  },
  {
    id: 'q5',
    dimension: 'Workload & Role Clarity',
    questionText: 'Apakah pembagian shift kerja dan target KPI sales/sesi personal training terasa jelas dan realistis?',
    category: 'WORKLOAD',
  },
  {
    id: 'q6',
    dimension: 'Compensation & Incentive Scheme',
    questionText: 'Seberapa kompetitif skema komisi dan insentif Anda dibandingkan beban target bulanan?',
    category: 'COMPENSATION',
  },
];

export default function SurveyBuilderPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>(DEFAULT_QUESTIONS);
  const [targetLocation, setTargetLocation] = useState<string>('Bali');
  const [targetRole, setTargetRole] = useState<string>('ALL');
  const [surveyTitle, setSurveyTitle] = useState<string>('FIT HUB Q3 Regional Pulse: Bali & East Java');
  
  // Custom Question Form State
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newDimension, setNewDimension] = useState('');

  // Simulation Results State
  const [isSimulating, setIsSimulating] = useState(false);
  const [surveyRunSuccess, setSurveyRunSuccess] = useState(false);
  const [simulationData, setSimulationData] = useState<{
    respondents: number;
    enpsScore: number;
    promotersPct: number;
    passivesPct: number;
    detractorsPct: number;
    dimensionResults: Array<{ label: string; value: number; color: string }>;
  } | null>(null);

  // Add Question
  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim() || !newDimension.trim()) return;

    const newQ: QuestionItem = {
      id: `custom-${Date.now()}`,
      dimension: newDimension,
      questionText: newQuestionText,
      category: 'CUSTOM',
    };

    setQuestions([...questions, newQ]);
    setNewQuestionText('');
    setNewDimension('');
  };

  // Remove Question
  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  // Run Simulation
  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      // Simulate realistic regional skew (Bali has lower comp satisfaction)
      const isBali = targetLocation === 'Bali';
      const enps = isBali ? 38.2 : 56.4;
      const compScore = isBali ? 4.12 : 5.05;

      setSimulationData({
        respondents: isBali ? 86 : 242,
        enpsScore: enps,
        promotersPct: isBali ? 54.0 : 68.2,
        passivesPct: isBali ? 30.2 : 20.0,
        detractorsPct: isBali ? 15.8 : 11.8,
        dimensionResults: [
          { label: 'Company Culture', value: 6.2, color: '#2E8B57' },
          { label: 'Team Atmosphere', value: 5.8, color: '#23C9D3' },
          { label: 'Supervisor Support', value: isBali ? 4.9 : 5.6, color: isBali ? '#C99400' : '#23C9D3' },
          { label: 'Gym Environment', value: 5.3, color: '#23C9D3' },
          { label: 'Role Clarity', value: isBali ? 4.8 : 5.2, color: isBali ? '#C99400' : '#23C9D3' },
          { label: 'Comp & Incentives', value: compScore, color: '#C65353' },
        ],
      });

      setIsSimulating(false);
      setSurveyRunSuccess(true);
    }, 700);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!simulationData) return;

    const headers = ['Dimension', 'Average_Score_OutOf_7', 'Category', 'Target_Location', 'Target_Role'];
    const rows = simulationData.dimensionResults.map((d) => [
      `"${d.label}"`,
      d.value,
      'Core Dimension',
      `"${targetLocation}"`,
      `"${targetRole}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FITHUB_Survey_Results_${targetLocation}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header with back navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default pb-5">
        <div>
          <Link
            href="/team?tab=engagement"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-teal hover:text-brand-navy transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Modul Team &amp; eNPS</span>
          </Link>
          <h1 className="font-spartan text-3xl font-extrabold text-ink-primary tracking-tight flex items-center gap-2.5">
            <HeartHandshake className="w-7 h-7 text-brand-teal" />
            <span>Localized eNPS Survey Builder &amp; Simulator</span>
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1 max-w-3xl leading-relaxed">
            Rancang dan simulasikan survei eNPS berbasis 6 dimensi untuk mendeteksi variasi kepuasan regional secara berkala (Operationalizing Notebook Section 5.3 Action 1).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="px-4 py-2 rounded-xl bg-brand-teal text-white font-bold text-xs hover:bg-brand-teal/90 transition-all flex items-center gap-2 shadow-card"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isSimulating ? 'Menjalankan Simulasi...' : 'Jalankan Survei Simulasi'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {surveyRunSuccess && (
        <div className="p-4 rounded-xl bg-[#EBF7F0] border border-status-healthy/30 flex items-center justify-between text-status-healthy animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold">Survei Berhasil Disimulasikan!</p>
              <p className="text-xs text-ink-secondary mt-0.5">
                {simulationData?.respondents} respons terkumpul untuk target wilayah <strong className="text-ink-primary">{targetLocation}</strong>. Hasil breakdown per dimensi telah diperbarui di bawah.
              </p>
            </div>
          </div>
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg bg-white border border-border-default text-xs font-bold text-ink-primary hover:border-brand-teal transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-brand-teal" />
            <span>Export CSV</span>
          </button>
        </div>
      )}

      {/* Survey Configuration Settings */}
      <SectionCard
        title="1. Konfigurasi Sasaran & Parameter Survei"
        description="Pilih segmen wilayah dan role target survei untuk mengisolasi kluster kepuasan frontline."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="label-xs text-ink-secondary block mb-1.5">Judul Survei</label>
            <input
              type="text"
              value={surveyTitle}
              onChange={(e) => setSurveyTitle(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-xl bg-surface-soft border border-border-default focus:border-brand-teal focus:outline-none"
            />
          </div>

          <div>
            <label className="label-xs text-ink-secondary block mb-1.5">Target Lokasi / Cluster</label>
            <select
              value={targetLocation}
              onChange={(e) => setTargetLocation(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-xl bg-surface-soft border border-border-default focus:border-brand-teal focus:outline-none"
            >
              <option value="All Locations">Semua Wilayah Nasional</option>
              <option value="Bali">Bali Cluster (High Attrition Area)</option>
              <option value="Jabodetabek">Jabodetabek Hub</option>
              <option value="Surabaya">Surabaya &amp; Jawa Timur</option>
              <option value="Bandung">Bandung &amp; Jawa Barat</option>
            </select>
          </div>

          <div>
            <label className="label-xs text-ink-secondary block mb-1.5">Target Job Role</label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-xl bg-surface-soft border border-border-default focus:border-brand-teal focus:outline-none"
            >
              <option value="ALL">Semua Frontline &amp; Leaders</option>
              <option value="Fitness Consultant">Fitness Consultant (Sales Focus)</option>
              <option value="Personal Trainer">Personal Trainer (Fitness Focus)</option>
              <option value="Front Desk Officer">Front Desk Officer (Ops Focus)</option>
            </select>
          </div>
        </div>
      </SectionCard>

      {/* Questions Builder Section */}
      <SectionCard
        title="2. Matriks Pertanyaan 6 Dimensi Workplace"
        description="Pertanyaan standar yang mengukur sentimen dari skala 1 (Sangat Tidak Setuju) hingga 7 (Sangat Setuju)."
        note="Insight Notebook: Dimensi Compensation & Benefits selalu mencatat skor paling rendah (4.96/6.00). Pertanyaan ini membantu mendeteksi distorsi komisi regional."
      >
        <div className="space-y-3 pt-2">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="p-3.5 rounded-xl bg-surface-soft border border-border-default flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-brand-teal/50 transition-all"
            >
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-white border border-border-default text-[11px] font-bold text-ink-primary flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-spartan font-bold text-xs text-ink-primary">{q.dimension}</span>
                    <Chip label={q.category} tone="teal" size="sm" />
                  </div>
                  <p className="text-xs text-ink-secondary mt-1">{q.questionText}</p>
                </div>
              </div>

              {q.category === 'CUSTOM' && (
                <button
                  onClick={() => handleRemoveQuestion(q.id)}
                  className="p-1.5 rounded-lg text-status-critical hover:bg-white transition-all shrink-0 self-end sm:self-auto"
                  title="Hapus Pertanyaan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          {/* Add Custom Question Form */}
          <form onSubmit={handleAddQuestion} className="pt-4 border-t border-border-default/60">
            <span className="label-xs text-ink-secondary block mb-2">Tambah Pertanyaan Kustom</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="Nama Dimensi (cth: Shift Roster Workload)"
                  value={newDimension}
                  onChange={(e) => setNewDimension(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-surface-soft border border-border-default focus:border-brand-teal focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Kalimat Pertanyaan..."
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 rounded-xl bg-surface-soft border border-border-default focus:border-brand-teal focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-brand-navy/90 transition-all flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </SectionCard>

      {/* Simulation Results (Live Preview) */}
      {simulationData && (
        <SectionCard
          title={`3. Hasil Simulasi Respons: ${targetLocation}`}
          description={`Hasil komputasi agregat dari ${simulationData.respondents} sampel karyawan di kluster ${targetLocation}.`}
          action={
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg bg-surface-soft border border-border-default text-xs font-bold text-ink-primary hover:border-brand-teal transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-brand-teal" />
              <span>Download CSV</span>
            </button>
          }
        >
          <div className="space-y-6 pt-2">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KpiCard
                label="Simulated eNPS Score"
                value={`+${simulationData.enpsScore}`}
                tone={simulationData.enpsScore > 50 ? 'healthy' : 'attention'}
                badge={targetLocation}
                subtext={simulationData.enpsScore < 45 ? 'Terdeteksi friksi retensi tinggi di wilayah ini' : 'Loyalitas brand tergolong kuat'}
              />
              <KpiCard
                label="Total Responden"
                value={simulationData.respondents}
                unit="karyawan"
                tone="teal"
                subtext="Tingkat partisipasi simulasi mencapai 89.2%"
              />
              <KpiCard
                label="Dimensi Terendah"
                value="Comp & Ben"
                tone="critical"
                badge="4.12 / 7.0"
                subtext="Paling dominan dikeluhkan oleh Fitness Consultant di Bali"
              />
            </div>

            {/* Voter Mix Stacked Bar */}
            <div className="p-4 rounded-xl bg-surface-soft/60 border border-border-default/60">
              <span className="label-xs text-ink-secondary block mb-3">Distribusi Pemilih eNPS</span>
              <StackedBarShare
                segments={[
                  { label: 'Promoters (Skor 9-10)', value: Math.round(simulationData.respondents * (simulationData.promotersPct / 100)), pct: simulationData.promotersPct, color: '#2E8B57' },
                  { label: 'Passives (Skor 7-8)', value: Math.round(simulationData.respondents * (simulationData.passivesPct / 100)), pct: simulationData.passivesPct, color: '#C99400' },
                  { label: 'Detractors (Skor 0-6)', value: Math.round(simulationData.respondents * (simulationData.detractorsPct / 100)), pct: simulationData.detractorsPct, color: '#C65353' },
                ]}
                totalLabel={`${simulationData.respondents} Total Responden`}
              />
            </div>

            {/* Dimension Breakdown Chart */}
            <div className="p-4 rounded-xl bg-surface-soft/60 border border-border-default/60">
              <span className="label-xs text-ink-secondary block mb-3">Rata-Rata Skor per Dimensi (Skala 1 - 7)</span>
              <ColoredBar
                data={simulationData.dimensionResults}
                dataKey="value"
                categoryKey="label"
                horizontal={true}
                height={220}
                unit="/ 7.0"
              />
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
