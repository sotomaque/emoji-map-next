import type { NavItem } from '@/types/nav-items';
import { IOS_GITHUB_REPO, WEB_GITHUB_REPO } from './links';

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
    label: 'My Account',
    href: '/account',
    target: false,
  },
  {
    label: 'Admin',
    href: '/admin',
    target: true,
    featureFlag: 'ENABLE_APP',
    hidden: true,
  },
  {
    label: 'About',
    href: '/about',
    target: false,
  },
  {
    label: 'Support',
    href: '/support',
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
    href: IOS_GITHUB_REPO,
    target: true,
    hidden: true,
  },
  {
    label: 'Web App GitHub',
    href: WEB_GITHUB_REPO,
    target: true,
    hidden: true,
  },
];
