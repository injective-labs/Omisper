export function getMissingClientRedirect(
  pathname: string,
  search: string,
): string | null {
  if (pathname === "/" || pathname === "/disconnect") return null;
  return `${pathname}${search}`;
}
