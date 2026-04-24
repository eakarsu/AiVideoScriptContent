import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  icon?: string;
  actions?: ReactNode;
}

export default function PageLayout({ children, title, subtitle, icon, actions }: PageLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'ml-[68px]' : 'ml-[260px]'}`}>
        {/* Page Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
          <div className="px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {icon && (
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                  <span className="text-xl">{icon}</span>
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h1>
                {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
              </div>
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
