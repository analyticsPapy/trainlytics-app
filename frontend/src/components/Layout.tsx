import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Activity,
  Home,
  Users,
  Trophy,
  Zap,
  FlaskConical,
  Link as LinkIcon,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './Button';

interface LayoutProps {
  children: React.ReactNode;
  type?: 'athlete' | 'coach' | 'public';
}

export function Layout({ children, type = 'public' }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  const publicLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/athlete', label: 'Athlete', icon: Trophy },
    { href: '/coach', label: 'Coach', icon: Users },
  ];

  const premiumLinks = [
    { href: '/pro', label: 'Pro', icon: Zap, gradient: 'gradient-pro' },
    { href: '/lab', label: 'Lab', icon: FlaskConical, gradient: 'gradient-lab' },
    { href: '/connect', label: 'Connect', icon: LinkIcon, gradient: 'gradient-connect' },
  ];

  const athleteLinks = [
    { href: '/athlete', label: 'Dashboard', icon: Activity },
    { href: '/athlete/workouts', label: 'Workouts', icon: Trophy },
    { href: '/athlete/progress', label: 'Progress', icon: Activity },
  ];

  const coachLinks = [
    { href: '/coach', label: 'Dashboard', icon: Activity },
    { href: '/coach/athletes', label: 'Athletes', icon: Users },
    { href: '/coach/programs', label: 'Programs', icon: Trophy },
  ];

  const links = type === 'athlete' ? athleteLinks : type === 'coach' ? coachLinks : publicLinks;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center space-x-2">
              <Activity className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl gradient-primary bg-clip-text text-transparent">
                Trainlytics
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Premium Badges */}
          <div className="hidden lg:flex items-center gap-2">
            {premiumLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} to={link.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background p-4">
            <nav className="flex flex-col gap-4">
              {[...links, ...premiumLinks].map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-2 text-sm font-medium transition-colors',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Activity className="h-5 w-5 text-primary" />
                <span className="font-bold gradient-primary bg-clip-text text-transparent">
                  Trainlytics
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Advanced analytics and training insights for athletes and coaches.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/athlete" className="hover:text-primary">For Athletes</Link></li>
                <li><Link to="/coach" className="hover:text-primary">For Coaches</Link></li>
                <li><Link to="/pro" className="hover:text-primary">Trainlytics Pro</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/lab" className="hover:text-primary">Trainlytics Lab</Link></li>
                <li><Link to="/connect" className="hover:text-primary">Trainlytics Connect</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">About</a></li>
                <li><a href="#" className="hover:text-primary">Contact</a></li>
                <li><a href="#" className="hover:text-primary">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2025 Trainlytics. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
