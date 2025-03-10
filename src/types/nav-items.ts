import type { FEATURE_FLAGS } from '@/constants/feature-flags';

export type NavItem = {
  label: string;
  href: string;
  target: boolean;
  children?: NavItem[];
  hidden?: boolean;
  featureFlag?: keyof typeof FEATURE_FLAGS;
};
