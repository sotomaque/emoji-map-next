import type { NavItem } from '@/types/nav-items';

export const navItems: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    target: false,
  },
  {
    label: 'App',
    href: '/app',
    target: true,
  },
  {
    label: 'About',
    href: '/about',
    target: false,
  },
  {
    label: 'Docs',
    href: '/api-docs',
    target: false,
  },
  {
    label: 'Privacy',
    href: '/privacy-policy',
    target: false,
    hidden: true,
  },
];
