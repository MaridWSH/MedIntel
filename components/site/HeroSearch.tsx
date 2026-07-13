'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '../ui/Icon';
import Link from 'next/link';

export default function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 pl-5 pr-3 py-3.5">
      <Icon icon="lucide:search" className="text-[20px] text-teal shrink-0" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-ink/35 w-full"
        placeholder="Search 50M+ medical papers, understood in seconds"
      />
      <span className="hidden md:flex items-center gap-1 px-2 h-7 rounded-md border border-ink/12 text-ink/55 text-[11.5px] mono-stat">⌘K</span>
      <Link href="/search" className="btn-primary h-10 px-5 bg-ink text-paper rounded-[12px] text-[13px] font-semibold inline-flex items-center gap-1.5">
        Synthesise
        <Icon icon="lucide:sparkles" className="text-[14px] text-teal-bright" />
      </Link>
    </form>
  );
}
