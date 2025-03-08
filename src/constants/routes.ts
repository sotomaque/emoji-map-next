import type { NavItem } from '@/src/types/nav-items';

export const navItems: NavItem[] = [
  {
    label: 'Home',
    href: '/',
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
