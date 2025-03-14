import type { NavItem } from '@/types/nav-items';

/**
 * Navigation items for the application
 *
 * Each item can have the following properties:
 * - label: Display text for the navigation item
 * - href: URL the navigation item links to
 * - target: Whether to open in a new tab (true) or same tab (false)
 * - featureFlag: Optional feature flag that controls visibility
 * - hidden: Optional flag to hide from main navigation but still accessible
 *
 * @type {NavItem[]}
 */
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
    featureFlag: 'ENABLE_APP',
  },
  {
    label: 'About',
    href: '/about',
    target: false,
  },
  {
    label: 'Docs',
    href: '/docs',
    target: false,
  },
  {
    label: 'Privacy',
    href: '/privacy-policy',
    target: false,
    hidden: true,
  },
  {
    label: 'iOS GitHub',
    href: 'https://github.com/sotomaque/emoji-map',
    target: true,
    hidden: true,
  },
  {
    label: 'Web App GitHub',
    href: 'https://github.com/sotomaque/emoji-map-next',
    target: true,
    hidden: true,
  },
];
