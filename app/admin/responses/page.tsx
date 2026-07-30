'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Icon from '@/components/ui/Icon';
import {
  FeedbackResponsesError,
  fetchFeedbackResponses,
  type ProductFeedbackResponse,
  type ResearchSurveyResponse,
} from '@/lib/api';

type ResponseView = 'research' | 'product';

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function percentage(part: number, total: number) {
  if (!total) return '0%';
  return `${Math.round((part / total) * 100)}%`;
}

function csvCell(value: string | number | null | undefined) {
  const text = value == null ? '' : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] mono-stat text-ink/45">{label}</div>
      <div className="mt-1.5 whitespace-pre-wrap break-words text-[13px] leading-relaxed text-ink-soft">
        {children || <span className="text-ink/35">No response</span>}
      </div>
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  const tone = value === 'Yes'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : value === 'No'
      ? 'border-red-200 bg-red-50 text-red-800'
      : 'border-amber-200 bg-amber-50 text-amber-800';

  return (
    <span className={`inline-flex min-h-7 items-center rounded-full border px-2.5 text-[11px] font-semibold ${tone}`}>
      {value}
    </span>
  );
}

function Rating({ value }: { value: number | null }) {
  if (value == null) return <span className="text-ink/35">Not used</span>;
  return (
    <span className="inline-flex items-baseline gap-1 font-semibold text-ink">
      <span className="text-[17px] tnum">{value}</span>
      <span className="text-[10px] font-normal text-ink/40">/ 5</span>
    </span>
  );
}

function ResearchResponseRow({ response }: { response: ResearchSurveyResponse }) {
  const role = [response.professional_role, response.specialty].filter(Boolean).join(' / ');

  return (
    <details className="group border-b border-ink/10 last:border-b-0">
      <summary className="list-none cursor-pointer px-4 py-4 transition-colors hover:bg-ink/[0.025] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-deep sm:px-5 [&::-webkit-details-marker]:hidden">
        <div className="md:hidden">
          <div className="flex items-center justify-between gap-4 text-[10px] mono-stat text-ink/45">
            <span>{formatDateTime(response.created_at)}</span>
            <span>#{response.id}</span>
          </div>
          <div className="mt-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold text-ink">{role}</div>
              <div className="mt-1 text-[12px] text-ink-soft">{response.years_experience}</div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StatusBadge value={response.trust_level} />
              <Icon icon="lucide:chevron-down" className="text-[17px] text-ink/45 transition-transform group-open:rotate-180" />
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-5 md:grid md:grid-cols-[150px_minmax(0,1.35fr)_minmax(0,1fr)_100px_24px]">
          <div>
            <div className="text-[12px] font-medium text-ink">{formatDateTime(response.created_at)}</div>
            <div className="mt-1 text-[10px] mono-stat text-ink/35">RESPONSE #{response.id}</div>
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold text-ink">{role}</div>
            <div className="mt-1 truncate text-[11px] text-ink/50">{response.years_experience}</div>
          </div>
          <div className="min-w-0">
            <div className="truncate text-[12.5px] text-ink">{response.biggest_problem}</div>
            <div className="mt-1 truncate text-[11px] text-ink/50">Reads {response.papers_needed} papers</div>
          </div>
          <StatusBadge value={response.trust_level} />
          <Icon icon="lucide:chevron-down" className="text-[17px] text-ink/45 transition-transform group-open:rotate-180" />
        </div>
      </summary>

      <div className="border-t border-ink/8 bg-paper-warm/40 px-4 py-5 sm:px-5">
        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="SOURCES">
            {[...response.sources, response.sources_other].filter(Boolean).join(', ')}
          </Field>
          <Field label="PAPERS NEEDED">{response.papers_needed}</Field>
          <Field label="MOST TIME-CONSUMING">
            {[response.most_time_consuming, response.most_time_consuming_other].filter(Boolean).join(': ')}
          </Field>
          <Field label="BIGGEST PROBLEM">
            {[response.biggest_problem, response.biggest_problem_other].filter(Boolean).join(': ')}
          </Field>
          <div className="sm:col-span-2">
            <Field label="TRUST REASON">{response.trust_reason}</Field>
          </div>
        </div>
      </div>
    </details>
  );
}

function ProductResponseRow({ response }: { response: ProductFeedbackResponse }) {
  return (
    <details className="group border-b border-ink/10 last:border-b-0">
      <summary className="list-none cursor-pointer px-4 py-4 transition-colors hover:bg-ink/[0.025] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-deep sm:px-5 [&::-webkit-details-marker]:hidden">
        <div className="md:hidden">
          <div className="flex items-center justify-between gap-4 text-[10px] mono-stat text-ink/45">
            <span>{formatDateTime(response.created_at)}</span>
            <span>#{response.id}</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-5">
              <div>
                <div className="text-[10px] mono-stat text-ink/40">OVERALL</div>
                <Rating value={response.overall_rating} />
              </div>
              <div>
                <div className="text-[10px] mono-stat text-ink/40">EASE</div>
                <Rating value={response.ease_of_use_rating} />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StatusBadge value={response.would_recommend} />
              <Icon icon="lucide:chevron-down" className="text-[17px] text-ink/45 transition-transform group-open:rotate-180" />
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-5 md:grid md:grid-cols-[150px_100px_100px_minmax(0,1fr)_100px_24px]">
          <div>
            <div className="text-[12px] font-medium text-ink">{formatDateTime(response.created_at)}</div>
            <div className="mt-1 text-[10px] mono-stat text-ink/35">RESPONSE #{response.id}</div>
          </div>
          <Rating value={response.overall_rating} />
          <Rating value={response.ease_of_use_rating} />
          <div className="truncate text-[12px] text-ink-soft">
            {response.features_used.length ? response.features_used.join(', ') : 'No features selected'}
          </div>
          <StatusBadge value={response.would_recommend} />
          <Icon icon="lucide:chevron-down" className="text-[17px] text-ink/45 transition-transform group-open:rotate-180" />
        </div>
      </summary>

      <div className="border-t border-ink/8 bg-paper-warm/40 px-4 py-5 sm:px-5">
        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="SEARCH RATING"><Rating value={response.search_rating} /></Field>
          <Field label="SUMMARY RATING"><Rating value={response.summary_rating} /></Field>
          <Field label="FEATURES USED">{response.features_used.join(', ')}</Field>
          <Field label="CONTACT EMAIL">
            {response.contact_email ? (
              <a className="text-teal-deep underline decoration-teal-deep/30 underline-offset-2" href={`mailto:${response.contact_email}`}>
                {response.contact_email}
              </a>
            ) : ''}
          </Field>
          <Field label="MOST USEFUL">{response.most_useful}</Field>
          <Field label="PROBLEMS">{response.problems_encountered}</Field>
          <Field label="IMPROVEMENTS">{response.improvements}</Field>
          <Field label="FEATURE REQUESTS">{response.feature_requests}</Field>
        </div>
      </div>
    </details>
  );
}

export default function ResponsesPage() {
  const [activeView, setActiveView] = useState<ResponseView>('research');
  const [researchResponses, setResearchResponses] = useState<ResearchSurveyResponse[]>([]);
  const [productResponses, setProductResponses] = useState<ProductFeedbackResponse[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);

  const loadResponses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFeedbackResponses();
      setResearchResponses(data.research);
      setProductResponses(data.product);
      setLoadedOnce(true);
    } catch (loadError) {
      setError({
        status: loadError instanceof FeedbackResponsesError ? loadError.status : 0,
        message: loadError instanceof Error ? loadError.message : 'Could not load survey responses.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    fetchFeedbackResponses()
      .then((data) => {
        if (cancelled) return;
        setResearchResponses(data.research);
        setProductResponses(data.product);
        setLoadedOnce(true);
      })
      .catch((loadError) => {
        if (cancelled) return;
        setError({
          status: loadError instanceof FeedbackResponsesError ? loadError.status : 0,
          message: loadError instanceof Error ? loadError.message : 'Could not load survey responses.',
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleResearch = useMemo(() => researchResponses.filter((response) => {
    if (!normalizedQuery) return true;
    return [
      response.professional_role,
      response.specialty,
      response.years_experience,
      response.sources.join(' '),
      response.sources_other,
      response.papers_needed,
      response.most_time_consuming,
      response.most_time_consuming_other,
      response.biggest_problem,
      response.biggest_problem_other,
      response.trust_level,
      response.trust_reason,
    ].join(' ').toLowerCase().includes(normalizedQuery);
  }), [normalizedQuery, researchResponses]);

  const visibleProduct = useMemo(() => productResponses.filter((response) => {
    if (!normalizedQuery) return true;
    return [
      response.features_used.join(' '),
      response.most_useful,
      response.problems_encountered,
      response.improvements,
      response.feature_requests,
      response.would_recommend,
      response.contact_email,
    ].join(' ').toLowerCase().includes(normalizedQuery);
  }), [normalizedQuery, productResponses]);

  const summaryStats = useMemo(() => {
    if (activeView === 'research') {
      return [
        { label: 'Responses', value: researchResponses.length.toLocaleString() },
        {
          label: 'Would trust',
          value: percentage(researchResponses.filter((item) => item.trust_level === 'Yes').length, researchResponses.length),
        },
        {
          label: 'Use AI tools',
          value: percentage(researchResponses.filter((item) => item.sources.includes('AI tools')).length, researchResponses.length),
        },
        {
          label: 'Latest',
          value: researchResponses[0] ? new Date(researchResponses[0].created_at).toLocaleDateString('en-GB') : '-',
        },
      ];
    }

    const average = (field: 'overall_rating' | 'ease_of_use_rating') => {
      if (!productResponses.length) return '0.0';
      const total = productResponses.reduce((sum, item) => sum + item[field], 0);
      return (total / productResponses.length).toFixed(1);
    };
    return [
      { label: 'Responses', value: productResponses.length.toLocaleString() },
      { label: 'Avg. overall', value: `${average('overall_rating')} / 5` },
      { label: 'Avg. ease', value: `${average('ease_of_use_rating')} / 5` },
      {
        label: 'Would recommend',
        value: percentage(productResponses.filter((item) => item.would_recommend === 'Yes').length, productResponses.length),
      },
    ];
  }, [activeView, productResponses, researchResponses]);

  const activeResponses = activeView === 'research' ? visibleResearch : visibleProduct;

  const exportCsv = () => {
    const rows = activeView === 'research'
      ? [
          ['ID', 'Submitted', 'Role', 'Specialty', 'Experience', 'Sources', 'Other source', 'Papers needed', 'Most time-consuming', 'Other task', 'Biggest problem', 'Other problem', 'Trust level', 'Trust reason'],
          ...visibleResearch.map((item) => [item.id, item.created_at, item.professional_role, item.specialty, item.years_experience, item.sources.join('; '), item.sources_other, item.papers_needed, item.most_time_consuming, item.most_time_consuming_other, item.biggest_problem, item.biggest_problem_other, item.trust_level, item.trust_reason]),
        ]
      : [
          ['ID', 'Submitted', 'Overall rating', 'Ease rating', 'Search rating', 'Summary rating', 'Features used', 'Most useful', 'Problems', 'Improvements', 'Feature requests', 'Would recommend', 'Contact email'],
          ...visibleProduct.map((item) => [item.id, item.created_at, item.overall_rating, item.ease_of_use_rating, item.search_rating, item.summary_rating, item.features_used.join('; '), item.most_useful, item.problems_encountered, item.improvements, item.feature_requests, item.would_recommend, item.contact_email]),
        ];
    const csv = rows.map((row) => row.map(csvCell).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `citerounds-${activeView}-responses-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const accessError = error && (error.status === 401 || error.status === 403);

  return (
    <main className="min-h-screen bg-paper-warm/30">
        <div className="mx-auto max-w-[1380px] px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
          <header className="flex flex-col justify-between gap-5 border-b border-ink/10 pb-7 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] mono-stat text-teal-deep">
                <Icon icon="lucide:lock" className="text-[13px]" />
                ADMINISTRATOR VIEW
              </div>
              <h1 className="display text-[38px] sm:text-[46px] lg:text-[54px]">Survey responses</h1>
              <p className="mt-3 max-w-[700px] text-[13px] leading-relaxed text-ink-soft sm:text-[14px]">
                Review anonymous research-workflow submissions and closed-beta product feedback.
              </p>
            </div>
            {!accessError && (
              <button
                type="button"
                title="Refresh responses"
                aria-label="Refresh responses"
                onClick={() => void loadResponses()}
                disabled={loading}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-ink/15 bg-paper text-ink-soft transition-colors hover:border-teal-deep/40 hover:text-teal-deep disabled:cursor-wait disabled:opacity-50"
              >
                <Icon icon="lucide:refresh-cw" className={`text-[17px] ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </header>

          {accessError ? (
            <section className="mx-auto max-w-[620px] py-16 text-center sm:py-24">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-paper">
                <Icon icon={error.status === 401 ? 'lucide:log-in' : 'lucide:shield-alert'} className="text-[25px]" />
              </div>
              <h2 className="mt-6 text-[22px] font-semibold">
                {error.status === 401 ? 'Administrator sign-in required' : 'This account does not have access'}
              </h2>
              <p className="mx-auto mt-3 max-w-[480px] text-[13px] leading-relaxed text-ink-soft">
                {error.status === 401
                  ? 'Sign in with an account listed in the server administrator configuration.'
                  : 'Survey responses are restricted to explicitly configured administrator accounts.'}
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/login?next=/admin/responses" className="btn-primary inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-teal-deep px-5 text-[13px] font-semibold text-paper">
                  <Icon icon="lucide:log-in" className="text-[16px]" />
                  {error.status === 401 ? 'Sign in' : 'Use another account'}
                </Link>
                <Link href="/account" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-ink/15 bg-paper px-5 text-[13px] font-semibold text-ink-soft">
                  Account settings
                </Link>
              </div>
            </section>
          ) : (
            <>
              <section className="grid grid-cols-2 border-b border-ink/10 sm:grid-cols-4">
                {summaryStats.map((stat, index) => (
                  <div key={stat.label} className={`px-3 py-5 sm:px-5 ${index % 2 === 0 ? 'border-r border-ink/10' : ''} ${index < 2 ? 'border-b border-ink/10 sm:border-b-0' : ''} sm:border-r sm:last:border-r-0`}>
                    <div className="text-[10px] mono-stat text-ink/40">{stat.label}</div>
                    <div className="mt-2 text-[22px] font-semibold tracking-tight text-ink tnum sm:text-[26px]">{stat.value}</div>
                  </div>
                ))}
              </section>

              <section className="py-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="grid grid-cols-2 rounded-lg border border-ink/12 bg-paper p-1 sm:inline-grid sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setActiveView('research')}
                      className={`min-h-10 rounded-md px-3 text-[12px] font-semibold transition-colors sm:px-4 ${activeView === 'research' ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-ink/5'}`}
                    >
                      Research <span className="ml-1.5 tnum opacity-60">{researchResponses.length}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveView('product')}
                      className={`min-h-10 rounded-md px-3 text-[12px] font-semibold transition-colors sm:px-4 ${activeView === 'product' ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-ink/5'}`}
                    >
                      Product feedback <span className="ml-1.5 tnum opacity-60">{productResponses.length}</span>
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <label className="relative block min-w-0 sm:w-[320px]">
                      <span className="sr-only">Search responses</span>
                      <Icon icon="lucide:search" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[16px] text-ink/40" />
                      <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search responses"
                        className="h-11 w-full rounded-lg border border-ink/15 bg-paper pl-10 pr-4 text-[16px] text-ink outline-none transition focus:border-teal-deep focus:ring-2 focus:ring-teal-deep/10 sm:text-[13px]"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={exportCsv}
                      disabled={!activeResponses.length}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-ink/15 bg-paper px-4 text-[12px] font-semibold text-ink-soft transition-colors hover:border-teal-deep/40 hover:text-teal-deep disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Icon icon="lucide:download" className="text-[16px]" />
                      Export CSV
                    </button>
                  </div>
                </div>
              </section>

              <section className="overflow-hidden border-y border-ink/10 bg-paper">
                <div className="hidden border-b border-ink/10 bg-paper-warm/60 px-5 py-3 text-[10px] mono-stat text-ink/40 md:grid md:grid-cols-[150px_minmax(0,1.35fr)_minmax(0,1fr)_100px_24px] md:gap-5">
                  {activeView === 'research' ? (
                    <>
                      <span>SUBMITTED</span><span>PARTICIPANT</span><span>WORKFLOW</span><span>TRUST</span><span />
                    </>
                  ) : (
                    <div className="col-span-5 grid grid-cols-[150px_100px_100px_minmax(0,1fr)_100px_24px] gap-5">
                      <span>SUBMITTED</span><span>OVERALL</span><span>EASE</span><span>FEATURES</span><span>RECOMMEND</span><span />
                    </div>
                  )}
                </div>

                {loading && !loadedOnce ? (
                  <div className="space-y-px bg-ink/5">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="h-[82px] animate-pulse bg-paper px-5 py-5">
                        <div className="h-3 w-2/3 rounded bg-ink/10 sm:w-1/3" />
                        <div className="mt-3 h-2.5 w-1/2 rounded bg-ink/[0.07] sm:w-1/4" />
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="px-5 py-16 text-center">
                    <Icon icon="lucide:alert-triangle" className="text-[24px] text-red-700" />
                    <h2 className="mt-4 text-[17px] font-semibold">Could not load responses</h2>
                    <p className="mt-2 text-[12px] text-ink-soft">{error.message}</p>
                    <button type="button" onClick={() => void loadResponses()} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg border border-ink/15 px-4 text-[12px] font-semibold">
                      <Icon icon="lucide:refresh-cw" className="text-[15px]" />Try again
                    </button>
                  </div>
                ) : activeResponses.length === 0 ? (
                  <div className="px-5 py-16 text-center">
                    <Icon icon={query ? 'lucide:search-x' : 'lucide:clipboard-list'} className="text-[25px] text-ink/35" />
                    <h2 className="mt-4 text-[17px] font-semibold">{query ? 'No matching responses' : 'No responses yet'}</h2>
                    <p className="mt-2 text-[12px] text-ink-soft">
                      {query ? 'Try a broader search term.' : 'New submissions will appear here after the form is completed.'}
                    </p>
                  </div>
                ) : activeView === 'research' ? (
                  visibleResearch.map((response) => <ResearchResponseRow key={response.id} response={response} />)
                ) : (
                  visibleProduct.map((response) => <ProductResponseRow key={response.id} response={response} />)
                )}
              </section>
            </>
          )}
        </div>
      </main>
  );
}
