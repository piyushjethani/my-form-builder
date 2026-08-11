import { useState, useMemo } from 'react';
import { LayoutDashboard, PlusCircle, LogOut, Bell, Search, Menu, X, FileText } from 'lucide-react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = useMemo(() => {
    const name = user?.name || user?.email || 'Admin';
    if (name.includes('@')) {
      const namePart = name.split('@')[0];
      const parts = namePart.split(/[\._-]/);
      if (parts.length > 1 && parts[0] && parts[1]) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return namePart.slice(0, 2).toUpperCase();
    } else {
      const parts = name.trim().split(/\s+/);
      if (parts.length > 1 && parts[0] && parts[1]) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
  }, [user]);

  const navLinks = [
    { to: '/admin/forms', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/forms/new', label: 'Create Form', icon: PlusCircle }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-white border-r border-slate-100 shrink-0">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-indigo-200">
            F
          </div>
          <div>
            <span className="text-xs font-semibold text-indigo-600 block uppercase tracking-wider">Form Builder</span>
            <span className="text-sm font-bold text-slate-800">Admin Workspace</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/admin/forms'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-150 ${
                    isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'
                  }`
                }
              >
                <Icon size={18} />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50">
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm">
              {initials}
            </div>
            <div className="truncate flex-1">
              <p className="text-xs font-semibold text-slate-700 truncate">{user?.email}</p>
              <p className="text-[10px] font-medium text-slate-400">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-all duration-150"
            type="button"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)}>
          <aside className="w-64 h-full bg-white flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                  F
                </div>
                <div>
                  <span className="text-xs font-semibold text-indigo-600 block uppercase tracking-wider">Form Builder</span>
                  <span className="text-sm font-bold text-slate-800">Admin</span>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500">
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/admin/forms'}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-150 ${
                        isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'
                      }`
                    }
                  >
                    <Icon size={18} />
                    {link.label}
                  </NavLink>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50">
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm">
                  {initials}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-700 truncate">{user?.email}</p>
                  <p className="text-[10px] font-medium text-slate-400">Administrator</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-all duration-150"
                type="button"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 z-40">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
              aria-label="Toggle sidebar"
            >
              <Menu size={20} />
            </button>
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search forms, templates, responses..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border-0 rounded-full text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-150"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100 bg-white relative transition-all duration-150">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border border-white"></span>
            </button>

            <Link to="/admin/forms/new" className="btn-primary py-2 px-4 text-xs font-semibold rounded-full hidden sm:inline-flex">
              + Create form
            </Link>

            <div className="flex items-center gap-2 border-l border-slate-100 pl-4">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                {initials}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-slate-800">{user?.name || 'Admin User'}</p>
                <p className="text-[10px] text-slate-400">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#f8fafc]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
