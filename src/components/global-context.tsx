/**
 * Establishes the global context for the application. This holds information usable at any level
 * of the application.
 */
import React from "react";

type GlobalSiteProps = {
  title?: string;
};

type GlobalPageProps = {
  title?: string;
};

type GlobaLinkReloadProps = {
  isEnabled?: boolean;
  setIsEnabled?: (isEnabled: boolean) => void;
};

type GlobalDarkModeProps = {
  enabled?: boolean;
};

export type GlobalContextProps = {
  site: GlobalSiteProps;
  page: GlobalPageProps;
  linkReload: GlobaLinkReloadProps;
  darkMode: GlobalDarkModeProps;
};

// Add more sub-objects to the global context if they make sense.
export const GlobalContext = React.createContext<GlobalContextProps>({
  site: {},
  page: {},
  linkReload: {},
  darkMode: {},
});
