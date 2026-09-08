'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Send,
  Download,
  Briefcase,
  Layers,
  ArrowRight,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import { SectionCard, KpiCard, Chip } from '@/components/primitives';
import { SEED_DATA } from '@/lib/data/seed';

interface ExitSurveyRecord {
  id: string;
  employeeName: string;
  role: string;
  clubName: string;
  exitType: 'VOLUNTARY' | 'INVOLUNTARY';
  primaryReason: string;
  regrettable: boolean;
  managerRating: number;
  wouldRecommendScore: number;
  triggeredRequisitionId: string;
  slaTargetDays: number;
  loggedAt: string;
}

const INITIAL_LOGGED_EXITS: ExitSurveyRecord[] = [
  {
    id: 'EXT-2024-001',
    employeeName: 'Dimas Wijaya',
    role: 'Fitness Consultant',
    clubName: 'FIT HUB Canggu (Bali)',
    exitType: 'VOLUNTARY',
    primaryReason: 'Career Advancement / External Lateral Opportunity',
    regrettable: true,
    managerRating: 4,
    wouldRecommendScore: 8,
    triggeredRequisitionId: 'REQ-5021',
    slaTargetDays: 50,
    loggedAt: '2024-08-14',
  },
  {
    id: 'EXT-2024-002',
    employeeName: 'Kartika Kusuma',
    role: 'Personal Trainer',
    clubName: 'FIT HUB Sunset Road (Bali)',
    exitType: 'VOLUNTARY',
    primaryReason: 'Better Base Salary & Incentive Scheme',
    regrettable: false,
    managerRating: 3,
    wouldRecommendScore: 6,
    triggeredRequisitionId: 'REQ-5022',
    slaTargetDays: 50,
    loggedAt: '2024-08-18',
  },
  {
    id: 'EXT-2024-003',
    employeeName: 'Rian Santoso',
    role: 'Front Desk Officer',
    clubName: 'FIT HUB Senopati (Jakarta)',
    exitType: 'INVOLUNTARY',
    primaryReason: 'Performance & Probation Non-Attainment',
    regrettable: false,
    managerRating: 3,
    wouldRecommendScore: 7,
    triggeredRequisitionId: 'REQ-5023',
    slaTargetDays: 35,
    loggedAt: '2024-08-20',
  },
];

export default function ExitSurveyPage() {
  const [loggedExits, setLoggedExits] = useState<ExitSurveyRecord[]>(INITIAL_LOGGED_EXITS);
  
  // Active sample employees to choose from
  const candidateEmployees = SEED_DATA.employees.filter(e => e.status === 'ACTIVE').slice(0, 15);

  // Form State
  const [selectedEmpId, setSelectedEmpId] = useState<string>(candidateEmployees[0]?.id || '');
  const [exitType, setExitType] = useState<'VOLUNTARY' | 'INVOLUNTARY'>('VOLUNTARY');
  const [primaryReason, setPrimaryReason] = useState<string>('Career Advancement / External Lateral Opportunity');
  const [managerRating, setManagerRating] = useState<number>(4);
  const [recommendScore, setRecommendScore] = useState<number>(8);
  const [handoverNotes, setHandoverNotes] = useState<string>('');
  
  // Submission alert
  const [submissionResult, setSubmissionResult] = useState<ExitSurveyRecord | null>(null);

  const selectedEmployee = candidateEmployees.find(e => e.id === selectedEmpId) || candidateEmployees[0];
  const isRegrettable = exitType === 'VOLUNTARY' && (selectedEmployee?.performanceRating || 3) >= 4.0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    const newReqId = `REQ-REP-${Math.floor(1000 + Math.random() * 9000)}`;
    const isBali = selectedEmployee.location.includes('Denpasar') || selectedEmployee.location.includes('Badung') || selectedEmployee.clubName.includes('Bali');
    const slaDays = isBali ? 50 : 35;

    const record: ExitSurveyRecord = {
      id: `EXT-2024-${Math.floor(100 + Math.random() * 900)}`,
      employeeName: selectedEmployee.name,
      role: selectedEmployee.role,
      clubName: selectedEmployee.clubName,
      exitType,
      primaryReason,
      regrettable: isRegrettable,
      managerRating,
      wouldRecommendScore: recommendScore,
      triggeredRequisitionId: newReqId,
      slaTargetDays: slaDays,
      loggedAt: new Date().toISOString().split('T')[0],
    };

    setLoggedExits([record, ...loggedExits]);
    setSubmissionResult(record);
    setHandoverNotes('');
  };

  const handleExportCSV = () => {
    const headers = [
      'Exit_ID',
      'Employee_Name',
      'Role',
      'Club_Name',
      'Exit_Type',
      'Primary_Reason',
      'Regrettable_Loss',
      'Manager_Rating',
      'Triggered_Requisition_ID',
      'SLA_Target_Days',
      'Date_Logged',
    ];

    const rows = loggedExits.map((e) => [
      `"${e.id}"`,
      `"${e.employeeName}"`,
      `"${e.role}"`,
      `"${e.clubName}"`,
      `"${e.exitType}"`,
      `"${e.primaryReason}"`,
      e.regrettable ? 'YES' : 'NO',
      e.managerRating,
      `"${e.triggeredRequisitionId}"`,
      e.slaTargetDays,
      `"${e.loggedAt}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'FITHUB_Exit_Interviews_Closed_Loop.csv');
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
            href="/team?tab=exits"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-teal hover:text-brand-navy transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Modul Exit &amp; Continuity</span>
          </Link>
          <h1 className="font-spartan text-3xl font-extrabold text-ink-primary tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-status-critical" />
            <span>Structured Exit Interview &amp; Closed-Loop Trigger</span>
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1 max-w-3xl leading-relaxed">
            Standardisasi wawancara keluar untuk mengidentifikasi akar penyebab turnover dan secara otomatis memicu requisition pengganti (*Operationalizing Notebook Section 5.2 Action 2 &amp; PRD Closed Loop*).
          </p>
        </div>
      </div>

      {/* Trigger Success Toast */}
      {submissionResult && (
        <div className="p-5 rounded-2xl bg-[#EBF7F0] border border-status-healthy/40 text-ink-primary animate-fadeIn shadow-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-status-healthy shrink-0 mt-0.5" />
              <div>
                <h3 className="font-spartan font-bold text-sm text-status-healthy">
                  Exit Interview Dicatat &amp; Requisition Pengganti Otomatis Dibuat!
                </h3>
                <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
                  Kepergian <strong className="text-ink-primary">{submissionResult.employeeName}</strong> ({submissionResult.role}) telah memicu Requisition baru{' '}
                  <strong className="text-brand-navy font-mono bg-white px-2 py-0.5 rounded border border-border-default">
                    {submissionResult.triggeredRequisitionId}
                  </strong>{' '}
                  dengan target SLA <strong className="text-ink-primary">{submissionResult.slaTargetDays} hari</strong> untuk wilayah{' '}
                  <strong className="text-ink-primary">{submissionResult.clubName}</strong>.
                </p>
                {submissionResult.regrettable && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FDF0F0] text-status-critical text-[11px] font-bold border border-status-critical/30">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Perhatian: Regrettable Loss (Rating Karyawan Tinggi)</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/vacancy?tab=overview"
                className="px-3.5 py-2 rounded-xl bg-brand-teal text-white text-xs font-bold hover:bg-brand-teal/90 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Lihat di Modul Vacancy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setSubmissionResult(null)}
                className="px-3 py-2 rounded-xl bg-white border border-border-default text-xs font-semibold text-ink-secondary hover:text-ink-primary"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Interview Input Form */}
      <SectionCard
        title="Formulir Wawancara Keluar Terstruktur"
        description="Lengkapi data wawancara saat karyawan frontline mengajukan 1-month notice."
        note="Closed-Loop Rule: Setiap submit form ini otomatis mengikat kode exit ke requisition baru di /vacancy, mencegah lag operasional."
      >
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Employee Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="label-xs text-ink-secondary block mb-1.5">Pilih Karyawan yang Resign</label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2.5 rounded-xl bg-surface-soft border border-border-default focus:border-brand-teal focus:outline-none"
              >
                {candidateEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} &bull; {emp.role} &bull; {emp.clubName} (Rating: {emp.performanceRating})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-xs text-ink-secondary block mb-1.5">Tipe Kepergian</label>
              <div className="flex gap-2">
                {(['VOLUNTARY', 'INVOLUNTARY'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setExitType(t)}
                    className={`flex-1 py-2 px-3 text-xs rounded-xl font-bold border transition-all ${
                      exitType === t
                        ? 'bg-brand-teal/10 border-brand-teal text-brand-navy'
                        : 'bg-surface-soft border-border-default text-ink-secondary'
                    }`}
                  >
                    {t === 'VOLUNTARY' ? 'Sukarela (Resign)' : 'Involunter (PHK/Gagal)'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Primary Reason & Regrettable Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-xs text-ink-secondary block mb-1.5">Alasan Utama Kepergian (Primary Exit Driver)</label>
              <select
                value={primaryReason}
                onChange={(e) => setPrimaryReason(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2.5 rounded-xl bg-surface-soft border border-border-default focus:border-brand-teal focus:outline-none"
              >
                <option value="Career Advancement / External Lateral Opportunity">
                  Jenjang Karir / Tawaran Eksternal (Top Driver di Kasus FIT HUB)
                </option>
                <option value="Better Base Salary & Incentive Scheme">
                  Ketidaksesuaian Komisi &amp; Skema Gaji Pokok
                </option>
                <option value="Shift Roster Fatigue & Unsocial Working Hours">
                  Kelelahan Jadwal Shift Gym &amp; Jam Lembur
                </option>
                <option value="Relocation & Family Obligations">Relokasi / Alasan Keluarga</option>
                <option value="Performance & Probation Non-Attainment">Tidak Lolos Masa Percobaan (Probation)</option>
              </select>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-soft border border-border-default flex items-center justify-between">
              <div>
                <span className="label-xs text-ink-secondary block mb-1">Status Regrettable Loss</span>
                <span className="text-xs text-ink-secondary">
                  {isRegrettable
                    ? 'Karyawan memiliki performa tinggi (Rating ≥ 4.0). Kepergian ini masuk kategori Regrettable Loss.'
                    : 'Bukan kategori regrettable loss berdasarkan riwayat evaluasi berkala.'}
                </span>
              </div>
              <Chip
                label={isRegrettable ? 'REGRETTABLE' : 'NON-REGRETTABLE'}
                tone={isRegrettable ? 'critical' : 'neutral'}
              />
            </div>
          </div>

          {/* Manager Rating & NPS Score */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-xs text-ink-secondary block mb-1.5">
                Hubungan &amp; Dukungan Club Manager (Skala 1 - 5)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setManagerRating(num)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                      managerRating === num
                        ? 'bg-brand-navy text-white border-brand-navy'
                        : 'bg-surface-soft text-ink-secondary border-border-default hover:border-brand-teal'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label-xs text-ink-secondary block mb-1.5">
                Rekomendasi FIT HUB ke Rekan (Skala eNPS: 0 - 10)
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={recommendScore}
                onChange={(e) => setRecommendScore(Number(e.target.value))}
                className="w-full accent-brand-teal cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-ink-muted mt-1">
                <span>0 (Detractor)</span>
                <span className="font-bold text-ink-primary">Skor: {recommendScore}</span>
                <span>10 (Promoter)</span>
              </div>
            </div>
          </div>

          {/* Handover & Feedback Notes */}
          <div>
            <label className="label-xs text-ink-secondary block mb-1.5">Catatan Serah Terima Tugas &amp; Komentar Tambahan</label>
            <textarea
              rows={3}
              placeholder="Catat status penyerahan klien personal training, handover inventaris gym floor, dan masukan karyawan..."
              value={handoverNotes}
              onChange={(e) => setHandoverNotes(e.target.value)}
              className="w-full text-xs font-medium p-3 rounded-xl bg-surface-soft border border-border-default focus:border-brand-teal focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-border-default flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-teal text-white font-bold text-xs hover:bg-brand-teal/90 transition-all flex items-center gap-2 shadow-card"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Simpan Exit Interview &amp; Buat Requisition Pengganti</span>
            </button>
          </div>
        </form>
      </SectionCard>

      {/* Logged Exit Interviews Table */}
      <SectionCard
        title="Daftar Wawancara Keluar &amp; Status Requisition Pengganti"
        description="Log rekaman wawancara keluar yang secara otomatis terhubung ke pipeline rekrutmen."
        action={
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg bg-surface-soft border border-border-default text-xs font-bold text-ink-primary hover:border-brand-teal transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-brand-teal" />
            <span>Export CSV</span>
          </button>
        }
      >
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-default text-ink-secondary font-semibold">
                <th className="py-2.5 px-3">Kode Exit</th>
                <th className="py-2.5 px-3">Nama Karyawan &amp; Role</th>
                <th className="py-2.5 px-3">Lokasi Club</th>
                <th className="py-2.5 px-3">Alasan Utama</th>
                <th className="py-2.5 px-3 text-center">Regrettable</th>
                <th className="py-2.5 px-3 text-center">Requisition Pengganti</th>
                <th className="py-2.5 px-3 text-center">Target SLA</th>
                <th className="py-2.5 px-3 text-right">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/60">
              {loggedExits.map((item) => (
                <tr key={item.id} className="hover:bg-surface-soft/80 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-brand-navy">{item.id}</td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-ink-primary block">{item.employeeName}</span>
                    <span className="text-[11px] text-ink-secondary">{item.role}</span>
                  </td>
                  <td className="py-3 px-3 text-ink-secondary">{item.clubName}</td>
                  <td className="py-3 px-3 text-ink-secondary max-w-[200px] truncate" title={item.primaryReason}>
                    {item.primaryReason}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Chip
                      label={item.regrettable ? 'YA' : 'TIDAK'}
                      tone={item.regrettable ? 'critical' : 'neutral'}
                      size="sm"
                    />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-mono font-bold text-xs bg-brand-teal/10 text-brand-navy px-2 py-0.5 rounded border border-brand-teal/30">
                      {item.triggeredRequisitionId}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-ink-primary">{item.slaTargetDays} hari</td>
                  <td className="py-3 px-3 text-right text-ink-muted">{item.loggedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
