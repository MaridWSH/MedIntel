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
    <form onSubmit={handleSubmit} className="flex items-center gap-3 pl-5 pr-3 py-3.5">
      <Icon icon="lucide:search" className="text-[20px] text-teal shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-ink/35 w-full"
        placeholder="Ask a question, or search by topic"
        aria-label="Search papers"
      />
      <span className="hidden md:flex items-center gap-1 px-2 h-7 rounded-md border border-ink/12 text-ink/55 text-[11.5px] mono-stat">
        ⌘K
      </span>
      <button
        type="submit"
        className="btn-primary h-10 px-5 bg-ink text-paper rounded-[12px] text-[13px] font-semibold inline-flex items-center gap-1.5"
      >
        Search
        <Icon icon="lucide:arrow-right" className="text-[14px] text-teal-bright" />
      </button>
    </form>
  );
}
