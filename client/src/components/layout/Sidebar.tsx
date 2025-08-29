import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useNavigationHandler } from '@/hooks/usePageState';
import { 
  ShoppingCart, 
  Users, 
  FileText, 
  ScrollText,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
const logoPath = '/assets/LogoGrainchain_1752610987841.png';

const menuItems = [
  {
    key: 'dashboard',
    icon: Home,
    path: '/home'
  },
  {
    key: 'buyers',
    icon: Users,
    path: '/buyers'
  },
  {
    key: 'sellers',
    icon: ShoppingCart,
    path: '/sellers'
  },
  {
    key: 'purchaseContracts',
    icon: FileText,
    path: '/purchase-contracts'
  },
  {
    key: 'saleContracts',
    icon: ScrollText,
    path: '/sale-contracts'
  }
];

export default function Sidebar() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const { handleNavigateToPage } = useNavigationHandler();

  return (
    <div className="w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-r border-gray-200/60 dark:border-gray-700/60 h-screen">
      <div className="px-4 py-6">
        <div className="mb-8 flex justify-center">
          <img 
            src={logoPath} 
            alt="GrainChain Logo" 
            className="h-24 w-auto object-contain"
          />
        </div>
        
        {/* Navigation section header */}
        <div className="px-3 mb-3">
          <h2 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {t('navigation')}
          </h2>
        </div>
        
        <nav className="space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Check if current path matches exactly or is a sub-route
            const isActive = location === item.path || location.startsWith(item.path + '/');
            
            return (
              <Link key={item.key} href={item.path}>
                <div 
                  className={cn(
                    "group relative flex items-center min-h-[36px] px-3 py-1.5 text-sm font-normal rounded-sm transition-all duration-100 ease-out cursor-pointer",
                    isActive 
                      ? "bg-blue-50/80 dark:bg-blue-950/50 text-blue-700 dark:text-blue-200 shadow-sm" 
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 hover:text-gray-900 dark:hover:text-gray-100"
                  )}
                  onClick={(e) => {
                    console.log(`🔄 SIDEBAR CLICK: Navegando de ${location} a ${item.path} (${item.key})`);
                    
                    // Ejecutar navegación jerárquica inmediatamente
                    handleNavigateToPage(item.key);
                  }}
                >
                  {/* Microsoft-style active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-600 dark:bg-blue-400 rounded-r-sm"></div>
                  )}
                  
                  {/* Icon container with proper sizing */}
                  <div className={cn(
                    "flex items-center justify-center w-4 h-4 mr-4 transition-colors duration-100",
                    isActive 
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                  )}>
                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  
                  {/* Label with Microsoft typography */}
                  <span className={cn(
                    "flex-1 text-sm font-normal leading-tight transition-colors duration-100",
                    isActive 
                      ? "text-blue-700 dark:text-blue-200 font-medium" 
                      : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                  )}>
                    {t(item.key)}
                  </span>
                  
                  {/* Fluent UI selection indicator */}
                  {isActive && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full opacity-60"></div>
                  )}
                  
                  {/* Subtle interaction feedback */}
                  <div className={cn(
                    "absolute inset-0 rounded-sm transition-all duration-100",
                    "opacity-0 group-hover:opacity-100",
                    isActive 
                      ? "bg-blue-600/5 dark:bg-blue-400/10" 
                      : "bg-gray-900/5 dark:bg-gray-100/5"
                  )}></div>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}