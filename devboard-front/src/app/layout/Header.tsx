import { Menu, Moon, Sun, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { useAppStore } from '@/shared/stores/app.store';

const NAV_MENU_ID = 'mobile-nav-menu';

export function Header() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language.startsWith('fr') ? 'fr' : 'en';
  const toggleLanguage = () => {
    const next = currentLang === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(next);
    localStorage.setItem('app-locale', next);
  };
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  const navLinks = useMemo(
    () => [
      { to: '/', label: t('nav.home'), end: true },
      { to: '/projects', label: t('nav.projects'), end: false },
      { to: '/tasks', label: t('nav.tasks'), end: false },
    ],
    [t],
  );

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Close on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) {
        closeMenu();
        burgerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen, closeMenu]);

  // Close on outside click (exclude burger button — its onClick handles the toggle)
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !burgerRef.current?.contains(e.target as Node)
      ) {
        closeMenu();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [menuOpen, closeMenu]);

  // Trap focus inside menu when open
  useEffect(() => {
    if (!menuOpen) return;
    const firstFocusable = menuRef.current?.querySelector<HTMLElement>(
      'a, button, [tabindex]:not([tabindex="-1"])',
    );
    firstFocusable?.focus();
  }, [menuOpen]);

  return (
    <header className='sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container mx-auto flex h-14 items-center justify-between px-4'>
        {/* Logo */}
        <span className='text-lg font-bold text-primary'>DevBoard</span>

        {/* Desktop nav */}
        <nav aria-label={t('nav.mainLabel')} className='hidden items-center gap-1 md:flex'>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right controls */}
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={toggleLanguage}
            aria-label={t('nav.toggleLanguage')}
            className='text-xs font-semibold w-9'
          >
            {currentLang === 'en' ? 'FR' : 'EN'}
          </Button>

          <Button
            variant='ghost'
            size='icon'
            onClick={toggleTheme}
            aria-label={t('nav.toggleTheme')}
          >
            {theme === 'light' ? (
              <Moon className='h-4 w-4' aria-hidden='true' />
            ) : (
              <Sun className='h-4 w-4' aria-hidden='true' />
            )}
          </Button>

          {/* Burger button — mobile only */}
          <Button
            ref={burgerRef}
            variant='ghost'
            size='icon'
            className='md:hidden'
            aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={menuOpen}
            aria-controls={NAV_MENU_ID}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? (
              <X className='h-5 w-5' aria-hidden='true' />
            ) : (
              <Menu className='h-5 w-5' aria-hidden='true' />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {menuOpen && (
        <div
          ref={menuRef}
          id={NAV_MENU_ID}
          role='dialog'
          aria-modal='true'
          aria-label={t('nav.mobileMenuLabel')}
          className='border-t border-border bg-background md:hidden animate-[slide-down_0.18s_ease-out]'
        >
          <nav aria-label={t('nav.mainLabel')} className='flex flex-col px-4 py-3 gap-1'>
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={closeMenu}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
