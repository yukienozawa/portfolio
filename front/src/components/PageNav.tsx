"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Profile", href: "/profile" },
  { label: "Works", href: "/works" },
  { label: "Contact", href: "/contact" },
];

/** 各ページ共通のナビゲーションタブ。現在地は自動判定して下線で強調表示する */
export default function PageNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-8 border-b border-slate-200 w-full mb-8">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              isActive
                ? "pb-3 px-2 text-sm font-bold tracking-wide text-[#3c3fbc] border-b-2 border-[#3c3fbc] transition-all"
                : "pb-3 px-2 text-sm font-bold tracking-wide text-slate-500 hover:text-[#3c3fbc] border-b-2 border-transparent hover:border-[#3c3fbc] transition-all"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}