export function isNavItemActive(href: string, path: string | null | undefined) {
  // Handle null or undefined path
  if (!path) {
    return href === '/';
  }
  return href === '/' ? path === '/' : path.startsWith(href);
}
