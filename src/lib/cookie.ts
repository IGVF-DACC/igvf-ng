// node_modules
import { cookies } from "next/headers";

type Cookie = {
  name: string;
  value: string;
};

/**
 * Retrieve all the browser's current cookies and convert them into a single combined string of
 * cookies to use in requests from the NextJS server to the data provider.
 * @returns {string} A string of cookie name/value pairs separated by semicolons
 */
export function buildCookieString(): string {
  const cookieStore = cookies();
  const allCookiePairs = cookieStore.getAll() as Cookie[];
  return allCookiePairs
    .map((cookiePair) => `${cookiePair.name}=${cookiePair.value}`)
    .join("; ");
}
