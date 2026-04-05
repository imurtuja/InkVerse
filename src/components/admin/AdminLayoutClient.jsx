"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Shield, LayoutDashboard, Users, FileText, Menu, AlertTriangle, ShieldAlert, Scale
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/moderation", label: "Auto Moderation", icon: ShieldAlert, exact: false },
  { href: "/admin/reports", label: "Reports", icon: AlertTriangle, exact: false },
  { href: "/admin/users", label: "Users", icon: Users, exact: false },
  { href: "/admin/posts", label: "Posts", icon: FileText, exact: false },
  { href: "/admin/appeals", label: "Appeals", icon: Scale, exact: false },
];

export default function AdminLayoutClient({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const getPageTitle = () => {
    const tab = tabs.find(t => t.exact ? pathname === t.href : pathname.startsWith(t.href));
    return tab ? tab.label : "Admin";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020617] text-gray-900 dark:text-gray-300 transition-colors">
      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-[#0B1120] border-r border-gray-200 dark:border-white/10 flex flex-col transition-transform duration-200",
        "md:translate-x-0 hidden md:flex" 
      )}>
        <div className="flex items-center gap-3 px-6 h-16 border-b border-gray-200 dark:border-white/10 flex-shrink-0">
          <Shield className="w-6 h-6 text-primary-500" />
          <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Platform Base</span>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = t.exact ? pathname === t.href : pathname.startsWith(t.href);
            return (
              <Link 
                key={t.href} 
                href={t.href}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 font-medium h-10",
                  isActive ? "bg-primary-50 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400 font-bold" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5"
                )}
              >
                <Icon className="w-5 h-5" /> {t.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-6 py-5 border-t border-gray-200 dark:border-white/10 flex items-center justify-between">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Platform v2</p>
          <Link href="/feed" className="text-[10px] text-blue-500 hover:text-blue-400 uppercase font-bold transition-all">← Exit</Link>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="md:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 flex items-center justify-between h-14 md:h-16 px-4 md:px-6 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <h1 className="text-sm md:text-base font-bold text-gray-900 dark:text-white tracking-tight">{getPageTitle()}</h1>
          </div>
          <div className="flex items-center gap-3">
             <Link href="/feed" className="block md:hidden text-[10px] text-primary-500 hover:text-primary-600 font-bold uppercase tracking-wider">Feed</Link>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-[10px] font-black text-white shadow-sm shadow-primary-500/20">
              SYS
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto pb-28 md:pb-6 px-4 md:px-6 py-6 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
