'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

interface SimpleBarProps {
  data: Array<{ label: string; value: number; [key: string]: any }>;
  dataKey?: string;
  categoryKey?: string;
  horizontal?: boolean;
  barColor?: string;
  height?: number;
  unit?: string;
}

export function SimpleBar({
  data,
  dataKey = 'value',
  categoryKey = 'label',
  horizontal = false,
  barColor = '#23C9D3',
  height = 260,
  unit = '',
}: SimpleBarProps) {
  if (!data || data.length === 0) {
    return <div className="h-[200px] flex items-center justify-center text-xs text-ink-muted">No data available</div>;
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        {horizontal ? (
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EDF2F2" />
            <XAxis type="number" tick={{ fill: '#5F6B6D', fontSize: 11 }} />
            <YAxis type="category" dataKey={categoryKey} tick={{ fill: '#111111', fontSize: 11 }} width={100} />
            <Tooltip
              formatter={(val: any) => [`${val ?? 0} ${unit}`, 'Count / Score']}
              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #DDE5E6', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
            />
            <Bar dataKey={dataKey} fill={barColor} radius={[0, 6, 6, 0]} />
          </BarChart>
        ) : (
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F2" />
            <XAxis dataKey={categoryKey} tick={{ fill: '#5F6B6D', fontSize: 11 }} interval={0} />
            <YAxis tick={{ fill: '#5F6B6D', fontSize: 11 }} />
            <Tooltip
              formatter={(val: any) => [`${val ?? 0} ${unit}`, 'Value']}
              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #DDE5E6', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
            />
            <Bar dataKey={dataKey} fill={barColor} radius={[6, 6, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

interface ColoredBarProps {
  data: Array<{ label: string; value: number; color?: string; [key: string]: any }>;
  dataKey?: string;
  categoryKey?: string;
  horizontal?: boolean;
  height?: number;
  unit?: string;
}

export function ColoredBar({
  data,
  dataKey = 'value',
  categoryKey = 'label',
  horizontal = false,
  height = 260,
  unit = '',
}: ColoredBarProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-xs text-ink-muted bg-surface-ground/30 rounded-xl border border-dashed border-surface-border">
        Belum ada data friksi untuk kombinasi filter ini
      </div>
    );
  }

  const defaultColors = ['#00ADB5', '#23C9D3', '#10B981', '#F59E0B', '#EF4444', '#64748B'];

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        {horizontal ? (
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 28, left: 10, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" strokeOpacity={0.6} />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              domain={[0, (dataMax: number) => Math.max(35, Math.ceil(dataMax / 10) * 10)]}
              tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
              tickFormatter={(v) => `${v}${unit}`}
            />
            <YAxis
              type="category"
              dataKey={categoryKey}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
              width={125}
            />
            <Tooltip
              formatter={(val: any) => [`${val ?? 0}${unit}`, 'Friction Rate']}
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.94)',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                color: '#F8FAFC',
                padding: '8px 12px',
                fontSize: '12px',
              }}
              itemStyle={{ color: '#38BDF8', fontWeight: 600 }}
              labelStyle={{ color: '#94A3B8', fontWeight: 500, marginBottom: '2px' }}
            />
            <Bar dataKey={dataKey} radius={[0, 6, 6, 0]} barSize={18}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || defaultColors[index % defaultColors.length]} />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <BarChart data={data} margin={{ top: 12, right: 12, left: -16, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" strokeOpacity={0.6} />
            <XAxis
              dataKey={categoryKey}
              axisLine={false}
              tickLine={false}
              interval={0}
              tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
              tickFormatter={(v) => `${v}${unit}`}
            />
            <Tooltip
              formatter={(val: any) => [`${val ?? 0}${unit}`, 'Friction Rate']}
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.94)',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                color: '#F8FAFC',
                padding: '8px 12px',
                fontSize: '12px',
              }}
              itemStyle={{ color: '#38BDF8', fontWeight: 600 }}
              labelStyle={{ color: '#94A3B8', fontWeight: 500, marginBottom: '2px' }}
            />
            <Bar dataKey={dataKey} radius={[6, 6, 0, 0]} barSize={26}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || defaultColors[index % defaultColors.length]} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

interface SimpleLineProps {
  data: Array<{ label: string; value: number; [key: string]: any }>;
  dataKey?: string;
  categoryKey?: string;
  strokeColor?: string;
  height?: number;
  unit?: string;
}

export function SimpleLine({
  data,
  dataKey = 'value',
  categoryKey = 'label',
  strokeColor = '#00ADB5',
  height = 240,
  unit = '',
}: SimpleLineProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-xs text-ink-muted bg-surface-ground/30 rounded-xl border border-dashed border-surface-border">
        Belum ada data tren untuk filter ini
      </div>
    );
  }

  const gradientId = `line-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 18, left: -16, bottom: 4 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.25} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" strokeOpacity={0.6} />
          <XAxis
            dataKey={categoryKey}
            axisLine={false}
            tickLine={false}
            interval={0}
            tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
            dy={6}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
            tickFormatter={(v) => `${v}${unit ? (unit === 'days' ? 'd' : unit === '%' ? '%' : ` ${unit}`) : ''}`}
            domain={['auto', 'auto']}
          />
          <Tooltip
            formatter={(val: any) => [`${val ?? 0} ${unit}`, 'Median TTF']}
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.94)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
              color: '#F8FAFC',
              padding: '8px 12px',
              fontSize: '12px',
            }}
            itemStyle={{ color: '#2DD4BF', fontWeight: 600 }}
            labelStyle={{ color: '#94A3B8', fontWeight: 500, marginBottom: '2px' }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={strokeColor}
            strokeWidth={3}
            dot={{ r: 4, fill: strokeColor, stroke: '#ffffff', strokeWidth: 2 }}
            activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 3, fill: strokeColor }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface StackedBarShareProps {
  segments: Array<{
    label: string;
    value: number;
    pct: number;
    color: string;
  }>;
  totalLabel?: string;
}

export function StackedBarShare({ segments, totalLabel }: StackedBarShareProps) {
  return (
    <div className="w-full space-y-3">
      {/* Visual Bar */}
      <div className="w-full h-8 flex rounded-xl overflow-hidden shadow-inner border border-border-default/60">
        {segments.map((seg, i) => (
          <div
            key={i}
            style={{ width: `${seg.pct}%`, backgroundColor: seg.color }}
            className="h-full flex items-center justify-center text-white text-xs font-bold transition-all relative group"
            title={`${seg.label}: ${seg.value} (${seg.pct}%)`}
          >
            {seg.pct >= 10 && <span>{seg.pct}%</span>}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-ink-primary font-medium">{seg.label}:</span>
              <span className="text-ink-secondary font-semibold">{seg.value} ({seg.pct}%)</span>
            </div>
          ))}
        </div>
        {totalLabel && <span className="text-ink-muted text-[11px]">{totalLabel}</span>}
      </div>
    </div>
  );
}

interface FunnelWaterfallProps {
  stages: Array<{ stage: string; count: number; ratePct: number }>;
}

export function FunnelWaterfall({ stages }: FunnelWaterfallProps) {
  const maxCount = Math.max(...stages.map(s => s.count), 1);

  return (
    <div className="w-full space-y-3 py-2">
      {stages.map((stage, idx) => {
        const widthPct = Math.max(12, Math.round((stage.count / maxCount) * 100));
        const barColors = ['#1D3557', '#2585A6', '#23C9D3', '#C99400', '#2E8B57'];
        const color = barColors[idx % barColors.length];

        return (
          <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="w-32 text-xs font-semibold text-ink-primary shrink-0">
              {stage.stage}
            </div>

            <div className="flex-1 h-7 bg-surface-soft rounded-lg overflow-hidden flex items-center border border-border-default/50">
              <div
                className="h-full flex items-center justify-end px-2.5 text-[11px] font-bold text-white transition-all rounded-r-md"
                style={{ width: `${widthPct}%`, backgroundColor: color }}
              >
                {stage.count.toLocaleString()}
              </div>
            </div>

            <div className="w-20 text-right text-xs font-bold text-ink-secondary shrink-0">
              {stage.ratePct}% {idx > 0 ? 'conv.' : ''}
            </div>
          </div>
        );
      })}
    </div>
  );
}
