// app/login/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in · Claritas",
  description: "Sign in to your Claritas closed-beta account.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
