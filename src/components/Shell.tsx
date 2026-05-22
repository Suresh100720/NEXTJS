'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu, LayoutDashboard, Briefcase, Users, Search,
  LogOut, User, MessageSquare, Sparkles, Activity
} from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function Shell({ children, modal, session }: { children: React.ReactNode, modal: React.ReactNode, session: any }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // Get page title from pathname
  const getPageTitle = () => {
    const path = pathname.split('/')[1];
    if (!path) return 'Home';
    if (path === 'ai-performance') return 'AI Performance & Telemetry';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Jobs', href: '/jobs', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'Candidates', href: '/candidates', icon: <Users className="w-5 h-5" /> },
    { name: 'Search', href: '/search', icon: <Search className="w-5 h-5" /> },
    { name: 'AI Chat', href: '/chat', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'AI Assistant', href: '/assistant', icon: <Sparkles className="w-5 h-5" /> },
    { name: 'AI Telemetry', href: '/ai-performance', icon: <Activity className="w-5 h-5" /> },
  ];


  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`bg-slate-950 text-slate-300 transition-all duration-300 flex flex-col border-r border-slate-800 sticky top-0 h-screen z-50 ${isCollapsed ? 'w-20' : 'w-64'
          }`}
      >
        {/* Header & Toggle */}
        <div className={`h-20 flex items-center px-6 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className={`text-2xl font-black bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent whitespace-nowrap ${isCollapsed ? 'hidden' : ''}`}>
            RECRUIT
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                  : 'hover:bg-slate-900 hover:text-white text-slate-400'
                  } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <div className={`${isActive ? 'text-white' : 'group-hover:text-white'} transition-colors`}>
                  {item.icon}
                </div>
                {!isCollapsed && <span className="text-sm font-bold tracking-wide">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer (Admin profile + Logout) */}
        <div className="p-4 border-t border-slate-800 mt-auto">
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center text-indigo-400" title={session?.user?.name || "Recruiter"}>
                <User className="w-5 h-5" />
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                title="Sign Out"
                className="w-10 h-10 rounded-xl bg-red-950/40 border border-red-900/60 hover:bg-red-900/40 flex items-center justify-center transition-colors text-red-400"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 bg-slate-900/50 p-2.5 rounded-xl border border-slate-900">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-indigo-900/40 border border-indigo-800/60 flex items-center justify-center text-indigo-400 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-200 truncate leading-none">
                    {session?.user?.name || "Recruiter"}
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold mt-1">
                    Administrator
                  </div>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                title="Sign Out"
                className="w-8 h-8 rounded-lg bg-red-950/40 border border-red-900/60 hover:bg-red-900/40 flex items-center justify-center transition-colors text-red-400 shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Navbar (Sticky at top of this container) */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">{getPageTitle()}</h2>
          </div>
        </header>

        {/* Scrolling Page Content */}
        <main className={`flex-1 overflow-y-auto ${pathname === '/chat' || pathname === '/assistant' ? 'p-0' : 'p-8'}`}>
          <div className={pathname === '/chat' || pathname === '/assistant' ? 'w-full h-full' : 'max-w-[1600px] mx-auto pb-12'}>
            {children}
            {modal}
          </div>
        </main>
      </div>
    </div>
  );
}

