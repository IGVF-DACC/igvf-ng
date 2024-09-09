"use client";

/**
 * Establishes the context to hold the back-end session and session-properties records for
 * the currently logged-in user. You have to do this within the <Auth0Provider> component so that
 * we can get the current Auth0 login state. The session record has only a random CSFR token while
 * logged out from the server. While logged in, it also has auth.userid with your email address.
 *
 * This module also handles signing the user into igvfd after a successful sign in to Auth0. It
 * does this by detecting the <App> level state that indicates an Auth0 authentication transition
 * from signed-out to signed in.
 */

// node_modules
import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
// components
import { useSessionStorage } from "@/components/browser-storage";
// lib
import {
  getDataProviderUrl,
  getSession,
  getSessionProperties,
  loginDataProvider,
  logoutAuthProvider,
  logoutDataProvider,
} from "@/lib/authentication";
import { getCollectionTitles } from "@/lib/collection-titles";
import { getProfiles } from "@/lib/profiles";
// context
import { useAuthenticationContext } from "@/context/authentication";
// root
import type {
  CollectionTitles,
  Profiles,
  SessionObject,
  SessionPropertiesObject,
} from "@/globals.d";
/* istanbul ignore file */

/**
 * Establishes the context to hold the back-end session record for the currently signed-in user.
 * Other modules needing the session record can get it from this context.
 */
type SessionContextProps = {
  session?: SessionObject;
  sessionProperties?: SessionPropertiesObject;
  profiles?: Profiles;
  collectionTitles?: CollectionTitles;
  setAuthStageLogin?: () => void;
  setAuthStageLogout?: () => void;
};

export const SessionContext = createContext<SessionContextProps>({});

/**
 * The current authentication stage. This is used to detect when the user has logged in or out of
 * Auth0 so that we can then log them in or out of igvfd. Use functions from SessionContext to set
 * this state.
 */
// type AuthStage = "login" | "logout" | "none";
const enum AuthStage {
  LOGIN = "login",
  LOGOUT = "logout",
  NONE = "none",
}

/**
 * This context provider reacts to the user logging in or out of Auth0 by then logging in or out of
 * igvfd. It also provides other useful data retrieved from the server at page load so that child
 * modules don't need to request them again.
 *
 * This only gets used in the <App> component to encapsulate the session context. Place this within
 * the <Auth0Provider> context so that <Session> can access the current authentication state.
 * @param {object} authentication Authentication state and transition setter
 */
export function SessionContextProvider({
  children,
}: SessionContextProviderProps) {
  // Caches the back-end session object
  const [session, setSession] = useState<SessionObject | null>(null);
  // Caches the session-properties object
  const [sessionProperties, setSessionProperties] =
    useState<SessionPropertiesObject | null>(null);
  // Caches the /profiles schemas
  const [profiles, setProfiles] = useState<Profiles | null>(null);
  // Caches the /collection-titles map
  const [collectionTitles, setCollectionTitles] =
    useState<CollectionTitles | null>(null);
  // Caches the data provider URL
  const [dataProviderUrl, setDataProviderUrl] = useState("");
  // Saves the current authentication stage across page loads
  const [authStage, setAuthStage] = useSessionStorage(
    "auth-stage",
    AuthStage.NONE
  );
  const authenticationContext = useAuthenticationContext();

  const { getAccessTokenSilently, isAuthenticated, isLoading, logout } =
    useAuth0();
  const router = useRouter();

  // Get the data provider URL in case the user loaded a page that 404'd, in which case NextJS
  // doesn't load environment variables, leaving us unable to retrieve the session and session-
  // properties objects from igvfd. By getting the data provider URL, we can then get the session
  // and session-properties objects using the full URL instead of just the path.
  useEffect(() => {
    if (!dataProviderUrl) {
      getDataProviderUrl().then((url) => {
        console.log("DATA PROVIDER URL **************", url);
        setDataProviderUrl(url!);
      });
    }
  }, [dataProviderUrl]);

  // Get the session object from igvfd if we don't already have it in state. We need this to get
  // the CSRF token to sign into igvfd.
  useEffect(() => {
    if (!session && dataProviderUrl) {
      getSession(dataProviderUrl).then((sessionResponse) => {
        setSession(sessionResponse);
      });
    }
  }, [dataProviderUrl, session]);

  // Get the session-properties object from igvfd if we don't already have it in state. This gives
  // us the user's name and email address, and whether they're an admin.
  useEffect(() => {
    if (!sessionProperties && dataProviderUrl) {
      getSessionProperties(dataProviderUrl).then(
        (sessionPropertiesResponse) => {
          setSessionProperties(sessionPropertiesResponse);
        }
      );
    }
  }, [dataProviderUrl, sessionProperties]);

  // Get all the schemas so that the several other places in the code that need schemas can get
  // them from this context instead of doing a request to /profiles.
  useEffect(() => {
    if (!profiles && dataProviderUrl) {
      getProfiles(dataProviderUrl).then((response) => {
        setProfiles(response as Profiles);
      });
    }
  }, [profiles, dataProviderUrl]);

  // Get the mapping of @type, collection name, and schema name to corresponding human-readable
  // names.
  useEffect(() => {
    if (!collectionTitles && dataProviderUrl) {
      getCollectionTitles(dataProviderUrl).then((response) => {
        setCollectionTitles(response as CollectionTitles);
      });
    }
  }, [collectionTitles, dataProviderUrl]);

  // If we detect a transition from Auth0's logged-out state to logged-in state, log the user into
  // igvfd. The callback that auth0-react calls after a successful Auth0 login exists outside the
  // Auth0Provider context, so we have to have that callback set an <App> state and then handle the
  // sign in to igvfd here, *within* the Auth0Provider context.
  useEffect(() => {
    if (
      authenticationContext.authTransitionPath &&
      authStage === AuthStage.LOGIN &&
      dataProviderUrl &&
      isAuthenticated
    ) {
      setAuthStage(AuthStage.NONE);

      // Get the logged-out session object from igvfd if we don't already have it in state. We
      // need this to get the CSRF token to sign into igvfd.
      const serverSessionPromise = session
        ? Promise.resolve(session)
        : getSession(dataProviderUrl);
      serverSessionPromise
        .then((signedOutSession) => {
          // Attempt to log into igvfd.
          return loginDataProvider(signedOutSession!, getAccessTokenSilently);
        })
        .then((sessionPropertiesResponse) => {
          if (
            !sessionPropertiesResponse ||
            sessionPropertiesResponse.status === "error"
          ) {
            // Auth0 authenticated successfully, but we couldn't authenticate with igvfd. Log back
            // out of Auth0 and go to an error page.
            authenticationContext.setAuthTransitionPath("");
            logoutAuthProvider(logout, "/auth-error");
            return null;
          }

          // Auth0 and the server authenticated successfully. Set the session-properties object in
          // the session context so that any downstream component can retrieve it without doing a
          // request to /session-properties.
          setSessionProperties(
            sessionPropertiesResponse as SessionPropertiesObject
          );
          return getSession(dataProviderUrl);
        })
        .then((signedInSession) => {
          // Set the logged-in session object in the session context so that any downstream
          // component can retrieve it without doing a request to /session. Clear the transition
          // path so we know we've completed both Auth0 and igvfd authentication.
          setSession(signedInSession);
          authenticationContext.setAuthTransitionPath("");

          // Auth0 might have redirected to the page the user had viewed when they signed in
          // before igvfd authentication completed, so the page shows only public data. In this
          // case, reload the page to get the latest data.
          const viewedPath = `${window.location.pathname}${window.location.search}`;
          if (authenticationContext.authTransitionPath === viewedPath) {
            router.push(viewedPath);
          }
        });
    }
  }, [
    authenticationContext.authTransitionPath,
    dataProviderUrl,
    getAccessTokenSilently,
    authStage,
    isAuthenticated,
    logout,
    router,
    session,
    setSession,
  ]);

  useEffect(() => {
    // Detect that the user has logged out of Auth0. Respond by logging them out of igvfd.
    if (!isAuthenticated && !isLoading && authStage === AuthStage.LOGOUT) {
      setAuthStage(AuthStage.NONE);
      logoutDataProvider().then(() => {
        router.push("/");
      });
    }
  }, [isAuthenticated, isLoading, authStage]);

  return (
    <SessionContext.Provider
      value={{
        session: session!,
        sessionProperties: sessionProperties!,
        profiles: profiles!,
        collectionTitles: collectionTitles!,
        setAuthStageLogin: () => setAuthStage(AuthStage.LOGIN),
        setAuthStageLogout: () => setAuthStage(AuthStage.LOGOUT),
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

type SessionContextProviderProps = {
  children: React.ReactNode;
};

/**
 * Custom hook to access the session context.
 * @returns {SessionContextProps} The global context for the application.
 */
export function useSessionContext() {
  return useContext(SessionContext);
}
