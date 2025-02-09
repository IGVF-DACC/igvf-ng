// node_imports
import Link from "next/link";
import { PropsWithChildren, useContext } from "react";
// components
import { GlobalContext } from "../context/global";

/**
 * Wrapper for the next/link <Link> component. This wrapper has the option of reloading the browser
 * when going to the `href` page. We use this for pages (e.g. the 404 page) that don't have NextJS
 * environment variables available to them. Reloading before going to the `href` page lets NextJS
 * load those environment variables for the new page, allowing us to make proper requests to the
 * data provider.
 */
export function LinkReloadable(props: LinkReloadableProps) {
  const { linkReload } = useContext(GlobalContext);

  if (linkReload.isEnabled) {
    // Certain static pages (e.g. the 404.js page) set `linkReload.isEnabled` to `true`, so use a
    // regular <a> tag to reload the browser when going to the `href` page. The `linkReload` object
    // gets cleared on reload.
    return <a data-testid="link-reload" {...props} />;
  }

  // Normal link with no need for reload.
  return <Link data-testid="link-normal" {...props} />;
}

// Define an interface for the props that includes the href prop
interface LinkReloadableProps
  extends PropsWithChildren<Record<string, unknown>> {
  href: string;
}
