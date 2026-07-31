'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Icon from '@/components/ui/Icon';
import {
  fetchAnalyticsOverview,
  fetchEventGrowth,
  fetchUserGrowth,
  fetchVisitorGrowth,
  type AnalyticsOverview,
  type AnalyticsPeriod,
  type TimeSeriesPoint,
} from '@/lib/api';

const periods: { label: string; value: AnalyticsPeriod }[] = [
  { label: 'Today', value: '1d' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
  { label: 'Last Year', value: '1y' },
];

function formatNumber(value: number) {
  return value.toLocaleString();
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="rounded-2xl border border-ink/12 bg-paper p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[10px] mono-stat text-ink/45">{label}</div>
          <div className="mt-2 text-[28px] font-semibold tracking-tight text-ink tnum">
            {formatNumber(value)}
          </div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-deep/10 text-teal-deep">
          <Icon icon={icon} className="text-[20px]" />
        </div>
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-[118px] animate-pulse rounded-2xl border border-ink/8 bg-paper">
          <div className="m-5 h-3 w-24 rounded bg-ink/10" />
          <div className="mx-5 mt-5 h-8 w-20 rounded bg-ink/10" />
        </div>
      ))}
    </div>
  );
}

function ChartCard({ title, data, color }: { title: string; data: TimeSeriesPoint[]; color: string }) {
  const hasData = data.some((item) => item.count > 0);

  return (
    <section className="rounded-2xl border border-ink/12 bg-paper p-5">
      <h2 className="text-[13px] font-semibold text-ink">{title}</h2>
      {hasData ? (
        <div className="mt-4 h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id={`${title.replaceAll(' ', '-')}-fill`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.24} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(11,29,42,0.08)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgba(11,29,42,0.5)' }} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'rgba(11,29,42,0.5)' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#f6f3ea',
                  border: '1px solid rgba(11,29,42,0.12)',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke={color}
                strokeWidth={2}
                fill={`url(#${title.replaceAll(' ', '-')}-fill)`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-4 flex h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-ink/12 bg-paper-warm/45 text-center">
          <Icon icon="lucide:activity" className="text-[28px] text-ink/25" />
          <p className="mt-3 text-[13px] font-medium text-ink">No data yet</p>
          <p className="mt-1 text-[11px] text-ink-soft">Events will appear here after visitors use the platform.</p>
        </div>
      )}
    </section>
  );
}

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d');
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [users, setUsers] = useState<TimeSeriesPoint[]>([]);
  const [visitors, setVisitors] = useState<TimeSeriesPoint[]>([]);
  const [signups, setSignups] = useState<TimeSeriesPoint[]>([]);
  const [pageViews, setPageViews] = useState<TimeSeriesPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [overviewData, usersData, visitorsData, signupsData, pageViewsData] = await Promise.all([
        fetchAnalyticsOverview(),
        fetchUserGrowth(period),
        fetchVisitorGrowth(period),
        fetchEventGrowth(period, 'SIGNUP'),
        fetchEventGrowth(period, 'PAGE_VIEW'),
      ]);
      setOverview(overviewData);
      setUsers(usersData.data);
      setVisitors(visitorsData.data);
      setSignups(signupsData.data);
      setPageViews(pageViewsData.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load analytics.');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadAnalytics(), 0);
    return () => window.clearTimeout(timer);
  }, [loadAnalytics]);

  return (
    <div className="p-4 sm:p-6 lg:p-10">
      <header className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[10px] mono-stat text-teal-deep">
            <Icon icon="lucide:lock" className="text-[13px]" />
            ADMINISTRATOR VIEW
          </div>
          <h1 className="display text-[34px] sm:text-[42px] lg:text-[50px]">Analytics</h1>
          <p className="mt-3 max-w-[700px] text-[13px] leading-relaxed text-ink-soft sm:text-[14px]">
            Platform usage, searches, visitors, signups, and engagement trends.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value as AnalyticsPeriod)}
            className="h-11 rounded-lg border border-ink/15 bg-paper px-3 text-[13px] text-ink outline-none focus:border-teal-deep"
          >
            {periods.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void loadAnalytics()}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-ink/15 bg-paper px-4 text-[12px] font-semibold text-ink-soft transition-colors hover:border-teal-deep/40 hover:text-teal-deep disabled:cursor-wait disabled:opacity-50"
          >
            <Icon icon="lucide:refresh-cw" className={`text-[16px] ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </header>

      {loading && !overview ? (
        <SkeletonGrid />
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <Icon icon="lucide:alert-triangle" className="mx-auto text-[28px] text-red-700" />
          <h2 className="mt-4 text-[17px] font-semibold">Could not load analytics</h2>
          <p className="mt-2 text-[12px] text-ink-soft">{error}</p>
          <button type="button" onClick={() => void loadAnalytics()} className="mt-5 rounded-lg border border-red-300 px-4 py-2 text-[12px] font-semibold text-red-700">
            Retry
          </button>
        </div>
      ) : overview ? (
        <div className="space-y-6">
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Total users" value={overview.total_users} icon="lucide:users" />
            <StatCard label="New users today" value={overview.new_users_today} icon="lucide:user-round" />
            <StatCard label="Active users today" value={overview.active_users_today} icon="lucide:activity" />
            <StatCard label="Total visitors" value={overview.total_visitors} icon="lucide:globe" />
            <StatCard label="Visitors today" value={overview.visitors_today} icon="lucide:scan-eye" />
            <StatCard label="Page views today" value={overview.page_views_today} icon="lucide:file-search" />
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <ChartCard title="User Growth" data={users} color="#0b7d72" />
            <ChartCard title="Visitor Growth" data={visitors} color="#14b8a6" />
            <ChartCard title="Signups" data={signups} color="#967338" />
            <ChartCard title="Page Views" data={pageViews} color="#0b1d2a" />
          </section>
        </div>
      ) : null}
    </div>
  );
}
