export function isNavItemActive(href: string, path: string) {
  return href === '/' ? path === '/' : path.startsWith(href);
}
