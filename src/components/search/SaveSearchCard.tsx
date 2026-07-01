"use client";

import { useState } from "react";
import { Bell, Check } from "lucide-react";

export default function SaveSearchCard() {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <div className="mt-4 bg-ink text-paper border border-ink rounded-2xl p-4 relative overflow-hidden">
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-teal-bright/15 blur-2xl pointer-events-none" />
      <div className="relative">
        <div className="text-[10px] mono-stat text-teal-bright mb-2">
          SAVE THIS SEARCH
        </div>
        <p className="text-[12px] text-paper/75 leading-[1.5] mb-3">
          Get email alerts when new papers match this query. Daily or weekly
          digest.
        </p>
        <button
          onClick={() => setSubscribed(true)}
          disabled={subscribed}
          className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-md bg-teal-bright text-ink text-[12px] font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {subscribed ? (
            <>
              <Check size={13} />
              Subscribed
            </>
          ) : (
            <>
              <Bell size={13} />
              Subscribe
            </>
          )}
        </button>
      </div>
    </div>
  );
}
