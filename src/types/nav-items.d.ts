export type NavItem = {
  label: string;
  href: string;
  target: boolean;
  children?: NavItem[];
  hidden?: boolean;
};
