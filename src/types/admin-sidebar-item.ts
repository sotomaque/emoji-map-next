export interface AdminSidebarItem {
  title: string;
  url: string;
  isActive?: boolean;
  target?: string;
}

export interface AdminSidebarGroup {
  title: string;
  url?: string;
  items: AdminSidebarItem[];
}

export interface AdminSidebarSection {
  title: string;
  url: string;
  items?: (AdminSidebarItem | AdminSidebarGroup)[];
}
