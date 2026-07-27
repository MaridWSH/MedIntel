'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '../ui/Icon';

/**
 * Landing-page search.
 *
 * The submit button used to be a <Link href="/search">, so clicking it threw the
 * typed query away and landed on an empty search page — only pressing Enter did
 * anything, and even that relied on /search reading ?q=, which it didn't. The ⌘K
 * hint was decorative too. All three now work.
 */
export default function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="flex items-center gap-2 rounded-lg border border-ink/15 bg-paper p-2 shadow-[0_18px_50px_-30px_rgba(11,29,42,0.45)] transition-shadow focus-within:border-teal-deep/50 focus-within:ring-2 focus-within:ring-teal-deep/20"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3 pl-2 sm:pl-3">
        <Icon icon="lucide:search" className="shrink-0 text-[19px] text-teal-deep" />
        <input
          ref={inputRef}
          name="q"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-11 min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-ink/40 sm:text-[15px]"
          placeholder="Ask a clinical question or search a topic"
          aria-label="Search the paper catalogue"
          autoComplete="off"
        />
        <span className="hidden items-center gap-1 rounded border border-ink/12 px-2 py-1 text-[10px] text-ink/50 md:flex mono">
          ⌘K
        </span>
      </div>
      <button
        type="submit"
        className="btn-primary inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-ink px-3.5 text-[13px] font-semibold text-paper sm:px-5"
        aria-label="Search papers"
      >
        <span className="hidden sm:inline">Search papers</span>
        <Icon icon="lucide:arrow-right" className="text-[15px] text-teal-bright" />
      </button>
    </form>
  );
}
