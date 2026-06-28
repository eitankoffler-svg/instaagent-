"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  Zap,
  Send,
  BarChart3,
  Settings,
  Play,
  ScrollText,
  Megaphone,
  Link2,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/connect", label: "Connect IG", icon: Link2 },
  { href: "/agent", label: "Agent", icon: Bot },
  { href: "/automations", label: "Automations", icon: Zap },
  { href: "/posts", label: "Posts", icon: Send },
  { href: "/pipeline", label: "Pipeline Log", icon: ScrollText },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-2 border-r border-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ig-purple via-ig-pink to-ig-orange flex items-center justify-center relative">
            <Bot className="w-6 h-6 text-white" />
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-surface-2 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary">InstaAgent</h1>
            <p className="text-xs text-text-secondary">Automated Creator</p>
          </div>
        </div>
      </div>

      {/* Quick Action */}
      <div className="px-4 pt-5 pb-2">
        <Link
          href="/connect"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-ig-purple via-ig-pink to-ig-orange text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <Link2 className="w-4 h-4" />
          Connect Account
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-accent/20 text-accent"
                  : "text-text-secondary hover:bg-surface-3 hover:text-text-primary"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-surface-3 hover:text-text-primary transition-all"
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>
        <div className="mt-3 px-3 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-text-secondary">Agent Online</span>
        </div>
      </div>
    </aside>
  );
}
