'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, X, LayoutDashboard, Briefcase, Users, Search, 
  ChevronLeft, ChevronRight, Bell, Settings, LogOut, User
} from 'lucide-react';

export default function Shell({ children, modal }: { children: React.ReactNode, modal: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // Get page title from pathname
  const getPageTitle = () => {
    const path = pathname.split('/')[1];
    if (!path) return 'Home';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Jobs', href: '/jobs', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'Candidates', href: '/candidates', icon: <Users className="w-5 h-5" /> },
    { name: 'Search', href: '/search', icon: <Search className="w-5 h-5" /> },

  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`bg-slate-950 text-slate-300 transition-all duration-300 flex flex-col border-r border-slate-800 sticky top-0 h-screen z-50 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Header & Toggle */}
        <div className={`h-20 flex items-center px-6 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className={`text-2xl font-black bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent flex items-center gap-2 ${isCollapsed ? 'hidden' : ''}`}>
            R<span className="tracking-tighter">ECRUIT</span>
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
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${
                  isActive 
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


      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Navbar (Sticky at top of this container) */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
             <h2 className="text-xl font-black text-slate-800 tracking-tight">{getPageTitle()}</h2>
          </div>

          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                   <User className="w-5 h-5 text-indigo-600" />
                </div>
             </div>
          </div>
        </header>

        {/* Scrolling Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto pb-12">
            {children}
            {modal}
          </div>
        </main>
      </div>
    </div>
  );
}
