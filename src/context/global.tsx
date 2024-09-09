"use client";

// node_modules
import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
// lib
import { SITE_TITLE } from "../lib/constants";
import { DarkModeManager } from "../lib/dark-mode-manager";

type GlobalSiteProps = {
  title: string;
};

type GlobaLinkReloadProps = {
  isEnabled: boolean;
  setIsEnabled?: (isEnabled: boolean) => void;
};

type GlobalDarkModeProps = {
  enabled: boolean;
};

type GlobalContextProps = {
  site: GlobalSiteProps;
  linkReload: GlobaLinkReloadProps;
  darkMode: GlobalDarkModeProps;
};

// Add more sub-objects to the global context if they make sense.
export const GlobalContext = createContext<GlobalContextProps>({
  site: { title: "" },
  linkReload: { isEnabled: false },
  darkMode: { enabled: false },
});

/**
 * Global context provider for the entire application.
 */
export function GlobalContextProvider({ children }: { children: ReactNode }) {
  const [isLinkReloadEnabled, setIsLinkReloadEnabled] = useState(false);
  // Keep track of current dark mode settings
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Install the dark-mode event listener to react to dark-mode changes.
    const darkModeManager = new DarkModeManager(setIsDarkMode);
    darkModeManager.installDarkModeListener();
    darkModeManager.setCurrentDarkMode();

    return () => {
      darkModeManager.removeDarkModeListener();
    };
  }, []);

  const globalContext = useMemo<GlobalContextProps>(() => {
    return {
      site: { title: SITE_TITLE },
      linkReload: {
        isEnabled: isLinkReloadEnabled,
        setIsEnabled: setIsLinkReloadEnabled,
      },
      darkMode: { enabled: isDarkMode },
    };
  }, [isLinkReloadEnabled, isDarkMode]);

  return (
    <GlobalContext.Provider value={globalContext}>
      {children}
    </GlobalContext.Provider>
  );
}

/**
 * Custom hook to access the global context.
 * @returns {GlobalContextProps} The global context for the application.
 */
export function useGlobalContext() {
  return useContext(GlobalContext);
}
