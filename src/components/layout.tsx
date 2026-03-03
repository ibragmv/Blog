import { Menu, Rss, Shield, X } from 'lucide-react';
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { SITE_CONFIG } from '@/config';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';

export function Layout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: 'Links', path: '/links' },
  ];

  const titleWords = SITE_CONFIG.title.split(' ');
  const isMultiWord = titleWords.length > 1;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-300 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800 selection:text-zinc-900 dark:selection:text-zinc-100 transition-colors duration-300">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-900 transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <NavLink
            to="/"
            className="flex items-center gap-3 leading-none font-bold tracking-tight text-zinc-900 dark:text-zinc-100 hover:opacity-70 transition-opacity font-display uppercase"
          >
            <img src={SITE_CONFIG.logo} alt="Logo" className="w-8 h-8" />
            <div className="flex flex-col">
              {isMultiWord ? (
                <>
                  <span className="text-xl">{titleWords[0]}</span>
                  <span className="text-xl">{titleWords.slice(1).join(' ')}</span>
                </>
              ) : (
                <span className="text-2xl">{SITE_CONFIG.title}</span>
              )}
            </div>
          </NavLink>

          <div className="flex items-center gap-4">
            {/* Desktop Nav */}
            <nav className="hidden md:flex gap-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-100',
                      isActive
                        ? 'text-zinc-900 dark:text-zinc-100'
                        : 'text-zinc-500 dark:text-zinc-500'
                    )
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>

            <NavLink
              to="/admin"
              className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors p-2"
              title="Admin Panel"
            >
              <Shield size={20} />
            </NavLink>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="md:hidden p-2 -mr-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <nav className="md:hidden border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-4 flex flex-col gap-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 block py-2',
                    isActive
                      ? 'text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-500 dark:text-zinc-500'
                  )
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main className="pt-24 pb-16 px-6 max-w-3xl mx-auto min-h-[calc(100vh-4rem)]">
        {children}
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-900 py-12">
        <div className="max-w-3xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-xs text-zinc-500 dark:text-zinc-600">
            &copy; {new Date().getFullYear()} Ibragim Ibragimov. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <Link
              to="/rss"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all text-xs font-medium border border-zinc-200 dark:border-zinc-800"
              title="RSS Feed"
            >
              <Rss size={14} />
              <span>RSS</span>
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </footer>
    </div>
  );
}
