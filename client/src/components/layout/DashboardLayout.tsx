import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import NavBar from './NavBar';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-200 via-gray-200 to-gray-300/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Navigation Bar */}
        <NavBar title={title} />
        
        {/* Content Area - Only this section will scroll */}
        <main className="flex-1 bg-gray-100/80 dark:bg-gray-900/60 overflow-y-auto min-h-0">
          <div className="p-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}