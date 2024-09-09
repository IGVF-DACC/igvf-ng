"use client";

// node_modules
import { Auth0Provider, type AppState } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
// lib
import {
  AUTH0_AUDIENCE,
  AUTH0_CLIENT_ID,
  AUTH0_ISSUER_BASE_DOMAIN,
} from "@/lib/auth0";

type AuthenticationContextProps = {
  authTransitionPath: string;
  setAuthTransitionPath: (path: string) => void;
};

// Add more sub-objects to the global context if they make sense.
export const AuthenticationContext = createContext<AuthenticationContextProps>({
  authTransitionPath: "",
  setAuthTransitionPath: () => {},
});

export function AuthenticationProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  // Path user viewed when they logged in; also indicates Auth0 has auth'd but igvfd hasn't yet
  const [authTransitionPath, setAuthTransitionPath] = useState("");
  const router = useRouter();

  /**
   * Called after the user signs in and auth0 redirects back to the application. We set the
   * `appState` parameter with the URL the user viewed when they logged in, so we can redirect
   * them back to that page after they log in here.
   * @param {object} appState Contains the URL to redirect to after signing in
   */
  function onRedirectCallback(appState?: AppState) {
    if (appState?.returnTo) {
      router.replace(appState.returnTo);
    }

    // Indicate that Auth0 has completed authentication so Session context can log into igvfd, and
    // reload this path if needed to see the authenticated content.
    setAuthTransitionPath(appState?.returnTo || "");
  }

  const authenticationContext = useMemo<AuthenticationContextProps>(() => {
    return {
      authTransitionPath,
      setAuthTransitionPath,
    };
  }, [authTransitionPath]);

  return (
    <AuthenticationContext.Provider value={authenticationContext}>
      <Auth0Provider
        domain={AUTH0_ISSUER_BASE_DOMAIN}
        clientId={AUTH0_CLIENT_ID}
        onRedirectCallback={onRedirectCallback}
        authorizationParams={{
          redirect_uri:
            typeof window !== "undefined" ? window.location.origin : undefined,
          audience: AUTH0_AUDIENCE,
        }}
      >
        {children}
      </Auth0Provider>
    </AuthenticationContext.Provider>
  );
}

/**
 * Custom hook to access the authentication context.
 * @returns {AuthenticationContextProps} The authentication context for the application.
 */
export function useAuthenticationContext() {
  return useContext(AuthenticationContext);
}
