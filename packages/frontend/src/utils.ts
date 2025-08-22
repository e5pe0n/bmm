const faviconBaseUrl = "https://www.google.com/s2/favicons";

export function getFaviconUrl(url: URL): string {
  const hostname = url.hostname;
  return `${faviconBaseUrl}?domain=${hostname}`;
}
