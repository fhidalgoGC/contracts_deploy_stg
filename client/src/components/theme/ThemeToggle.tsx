import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from './ThemeProvider';
import { useTranslation } from 'react-i18next';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title={t('toggleTheme')}
    >
      {theme === 'light' ? (
        <Sun className="h-[1.2rem] w-[1.2rem] text-gray-600 dark:text-gray-400" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] text-gray-600 dark:text-gray-400" />
      )}
      <span className="sr-only">{t('toggleTheme')}</span>
    </Button>
  );
}