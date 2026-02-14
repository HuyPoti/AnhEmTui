"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  TreeDeciduous,
  Package,
  Settings,
  LogOut,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/stores/languageStore";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useLanguageStore((state) => state.t);
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [admin, setAdmin] = useState<any>(null);

  const navItems = [
    {
      id: "dashboard",
      label: t("admin.nav.overview"),
      icon: LayoutDashboard,
      href: "/admin/dashboard",
    },
    {
      id: "users",
      label: t("admin.nav.users"),
      icon: Users,
      href: "/admin/users",
    },
    {
      id: "trees",
      label: t("admin.nav.trees"),
      icon: TreeDeciduous,
      href: "/admin/trees",
    },
    {
      id: "collections",
      label: t("admin.nav.collections"),
      icon: Package,
      href: "/admin/collections",
    },
    {
      id: "settings",
      label: t("admin.nav.settings"),
      icon: Settings,
      href: "/admin/settings",
    },
  ];

  useEffect(() => {
    if (pathname === "/admin/control-center") return;

    const token = localStorage.getItem("admin_token");
    const userData = localStorage.getItem("admin_user");
    if (!token || !userData) {
      router.push("/admin/control-center");
      return;
    }
    try {
      const user = JSON.parse(userData);
      if (user.role !== "ADMIN") {
        router.push("/");
        return;
      }
      setAdmin(user);
    } catch (e) {
      router.push("/admin/control-center");
    }
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.push("/admin/control-center");
  };

  // If we're on the login page, just show the login page content
  if (pathname === "/admin/control-center") {
    return <>{children}</>;
  }

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-[#080808] text-slate-300 font-special-elite flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "h-screen sticky top-0 bg-[#0c0c0c] border-r border-slate-800 transition-all duration-300 ease-in-out shrink-0 z-50",
          isSidebarOpen ? "w-64" : "w-20",
        )}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center p-1 shrink-0">
              <img src="/logo.png" alt="Admin Logo" className="w-full h-full object-contain" />
            </div>
            {isSidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-black text-white uppercase tracking-tighter text-sm"
              >
                {t("admin.nav.hq")}
              </motion.span>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-xl transition-all group",
                    isActive
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                      : "hover:bg-slate-900 border border-transparent text-slate-500 hover:text-slate-300",
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 shrink-0",
                      isActive ? "text-cyan-400" : "group-hover:text-cyan-500",
                    )}
                  />
                  {isSidebarOpen && (
                    <span className="text-xs font-bold uppercase tracking-widest">
                      {item.label}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>

          {/* Footer / User info */}
          <div className="p-4 border-t border-slate-800 space-y-2">
            {isSidebarOpen && (
              <div className="px-4 py-2 mb-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
                <p className="text-[10px] text-slate-500 uppercase font-black">
                  {t("admin.dashboard.clearance")}
                </p>
                <p className="text-xs text-white uppercase truncate">
                  {admin.fullName}
                </p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all group"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {isSidebarOpen && (
                <span className="text-xs font-bold uppercase tracking-widest">
                  {t("admin.nav.logout")}
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen flex flex-col relative transition-all duration-300 overflow-hidden">
        {/* Topbar */}
        <header className="h-20 shrink-0 border-b border-slate-800 bg-[#0c0c0c]/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-30">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-900 rounded-lg transition-colors text-slate-500 hover:text-white"
          >
            {isSidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 uppercase font-black">
                {t("admin.dashboard.clearance")}
              </span>
              <span className="text-xs text-cyan-500 font-bold uppercase">
                Administrator
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
