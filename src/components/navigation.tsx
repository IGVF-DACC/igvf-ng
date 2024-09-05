"use client";

// node_modules
import { motion, AnimatePresence } from "framer-motion";
import {
  Bars2Icon,
  MinusIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/20/solid";
import Link from "next/link";
import React, {
  Children,
  isValidElement,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
// components
import {
  standardAnimationTransition,
  standardAnimationVariants,
} from "@/components/animation";
import { useSessionStorage } from "@/components/browser-storage";
import { GlobalContext } from "@/components/global-context";
import { Icon } from "@/components/icon";
import { SiteLogo } from "@/components/logo";
// lib
import { UC } from "../lib/constants";

/**
 * Icon for opening the sidebar navigation.
 * @param {string} className Tailwind CSS class name to add to the svg element
 * @param {string} testid Optional data-testid for the svg element
 */
function NavExpandIcon({
  className = "",
  testid = "icon-nav-expand",
}: NavExpandIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      stroke="currentColor"
      data-testid={testid}
    >
      <g className="stroke-nav-collapse fill-none stroke-1">
        <path
          d="M13.1,15.5H6.9c-1.3,0-2.4-1.1-2.4-2.4V6.9c0-1.3,1.1-2.4,2.4-2.4h6.2c1.3,0,2.4,1.1,2.4,2.4v6.2
	C15.5,14.4,14.4,15.5,13.1,15.5z"
        />
        <line x1="7.8" y1="4.5" x2="7.8" y2="15.5" />
        <polyline points="10.6,12.1 12.7,10 10.6,7.9" />
      </g>
    </svg>
  );
}

type NavExpandIconProps = {
  className?: string;
  testid?: string;
};

/**
 * Icon for closing the sidebar navigation.
 * @param {string} className Tailwind CSS class name to add to the svg element
 * @param {string} testid Optional data-testid for the svg element
 */
function NavCollapseIcon({
  className = "",
  testid = "icon-nav-collapse",
}: NavCollapseIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      stroke="currentColor"
      data-testid={testid}
    >
      <g className="stroke-nav-collapse fill-none stroke-1">
        <path
          d="M13.1,15.5H6.9c-1.3,0-2.4-1.1-2.4-2.4V6.9c0-1.3,1.1-2.4,2.4-2.4h6.2c1.3,0,2.4,1.1,2.4,2.4v6.2
	C15.5,14.4,14.4,15.5,13.1,15.5z"
        />
        <line x1="7.8" y1="4.5" x2="7.8" y2="15.5" />
        <polyline points="12.7,12.1 10.6,10 12.7,7.9" />
      </g>
    </svg>
  );
}

type NavCollapseIconProps = {
  className?: string;
  testid?: string;
};

/**
 * Renders collapsible navigation items, both for the mobile menu and for collapsible children of
 * grouped navigation items.
 * @param {boolean} isOpen True if the collapsable navigation area is visible
 * @param {string} testid Optional data-testid for the motion div
 */
function MobileCollapsableArea({
  isOpen,
  testid = "",
  children,
}: MobileCollapsableAreaProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          data-testid={testid}
          className="overflow-hidden md:hidden"
          initial="collapsed"
          animate="open"
          exit="collapsed"
          transition={standardAnimationTransition}
          variants={standardAnimationVariants}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type MobileCollapsableAreaProps = {
  isOpen: boolean;
  testid?: string;
  children: React.ReactNode;
};

/**
 * Wrapper for the navigation icons to add Tailwind CSS classes to the icon svg.
 * @param {boolean} isNarrowNav True if the navigation is in narrow mode
 */
function NavigationIcon({ isNarrowNav, children }: NavigationIconProps) {
  const iconElement = Children.only(children);
  if (isValidElement(iconElement)) {
    return React.cloneElement(
      iconElement as ReactElement<{ className?: string }>,
      {
        className: `${isNarrowNav ? "h-8 w-8" : "mr-1 h-4 w-4}"} ${
          (iconElement.props as any).className || ""
        }`,
      }
    );
  }
  return children;
}

type NavigationIconProps = {
  isNarrowNav?: boolean;
  children: React.ReactNode;
};

/**
 * Generate the Tailwind CSS classes for a navigation item.
 * @param {boolean} isNarrowNav True if navigation is collapsed
 * @param {boolean} isChildItem True if this item is a child of another navigation item
 * @returns {string} Tailwind CSS classes for the navigation item
 */
function navigationClasses(isNarrowNav: boolean, isChildItem: boolean) {
  if (isNarrowNav) {
    // For the collapsed-navigation case.
    return "block h-8 w-8 text-black dark:text-gray-300";
  }

  // The expanded-navigation case.
  const childClasses = isChildItem
    ? "text-sm font-normal"
    : "text-base font-medium";
  return `flex w-full items-center rounded-full border border-transparent px-2 py-1 text-left text-white no-underline hover:bg-nav-highlight disabled:text-gray-500 md:text-black md:hover:border md:hover:border-nav-border md:hover:bg-nav-highlight md:dark:text-gray-200 ${childClasses}`;
}

/**
 * Renders navigation items containing links to pages.
 * @param {string} id ID of the navigation item
 * @param {string} href URI for the navigation item
 * @param {function} onClick Function to call when the user clicks the navigation item
 * @param {boolean} isNarrowNav True if the user has collapsed navigation
 * @param {boolean} isChildItem True if this item is a child of another navigation item
 */
function NavigationLink({
  id,
  href,
  onClick,
  isNarrowNav = false,
  isChildItem = false,
  children,
}: NavigationLinkProps) {
  // Helps determine if the link should reload the page or use NextJS navigation
  const { linkReload } = useContext(GlobalContext);
  const cssClasses = navigationClasses(isNarrowNav, isChildItem);

  if (linkReload.isEnabled) {
    return (
      <a
        href={href}
        onClick={onClick}
        data-testid={`navigation-${id}`}
        className={cssClasses}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      data-testid={`navigation-${id}`}
      className={cssClasses}
    >
      {children}
    </Link>
  );
}

type NavigationLinkProps = {
  id: string;
  href: string;
  onClick: () => void;
  isNarrowNav?: boolean;
  isChildItem?: boolean;
  children: React.ReactNode;
};

/**
 * Renders navigation buttons that perform actions.
 * @param {string} id ID of the navigation item
 * @param {function} onClick Function to call when the user clicks the navigation item
 * @param {boolean} isNarrowNav True if the user has collapsed navigation
 * @param {boolean} isChildItem True if this item is a child of another navigation item
 * @param {boolean} isDisabled True if the button should appear disabled
 */
function NavigationButton({
  id,
  onClick,
  isNarrowNav = false,
  isChildItem = false,
  isDisabled = false,
  children,
}: NavigationButtonProps) {
  const cssClasses = navigationClasses(isNarrowNav, isChildItem);
  return (
    <button
      onClick={onClick}
      data-testid={`navigation-${id}`}
      disabled={isDisabled}
      className={cssClasses}
    >
      {children}
    </button>
  );
}

type NavigationButtonProps = {
  id: string;
  onClick: () => void;
  isNarrowNav?: boolean;
  isChildItem?: boolean;
  isDisabled?: boolean;
  children: React.ReactNode;
};

/**
 * Renders a single navigation item that links to a URI.
 * @param {string} id ID of the navigation item
 * @param {string} href URI for the navigation item
 * @param {function} navigationClick Function to call when the user clicks the navigation item
 * @param {boolean} isChildItem True if this item is a child of another navigation item
 * @param {boolean} isNarrowNav True if the navigation is collapsed
 */
function NavigationHrefItem({
  id,
  href,
  navigationClick,
  isChildItem = false,
  isNarrowNav = false,
  children,
}: NavigationHrefItemProps) {
  return (
    <li>
      <NavigationLink
        id={id}
        href={href}
        onClick={navigationClick}
        isNarrowNav={isNarrowNav}
        isChildItem={isChildItem}
      >
        {children}
      </NavigationLink>
    </li>
  );
}

type NavigationHrefItemProps = {
  id: string;
  href: string;
  navigationClick: () => void;
  isChildItem?: boolean;
  isNarrowNav?: boolean;
  children: React.ReactNode;
};

/**
 * Icon for expanding or collapsing a navigation group item.
 * @param {boolean} isGroupOpened True if the navigation group is open
 */
function NavigationGroupExpandIcon({
  isGroupOpened,
}: NavigationGroupExpandIconProps) {
  return (
    <div className="ml-auto h-4 w-4">
      {isGroupOpened ? <MinusIcon /> : <PlusIcon />}
    </div>
  );
}

type NavigationGroupExpandIconProps = {
  isGroupOpened: boolean;
};

/**
 * Handles a navigation group item, reacting to clicks to expand or collapse the group, and
 * rendering the child items.
 * @param {string} id ID of the navigation group item
 * @param {string} title Displayed title of the navigation group item
 * @param {React.ReactNode} icon Component that renders the icon for this item
 * @param {boolean} isGroupOpened True if the parent navigation item is open
 * @param {function} handleGroupClick Function to call when the user clicks the parent navigation item
 */
function NavigationGroupItem({
  id,
  title,
  icon,
  isGroupOpened,
  handleGroupClick,
  children,
}: NavigationGroupItemProps) {
  return (
    <li>
      <NavigationButton
        id={id}
        onClick={() => handleGroupClick(id)}
        isNarrowNav={false}
      >
        <NavigationIcon>{icon}</NavigationIcon>
        {title}
        <NavigationGroupExpandIcon isGroupOpened={isGroupOpened} />
      </NavigationButton>
      <MobileCollapsableArea isOpen={isGroupOpened}>
        <ul className="ml-5">{children}</ul>
      </MobileCollapsableArea>
    </li>
  );
}

type NavigationGroupItemProps = {
  id: string;
  title: string;
  icon: React.ReactNode;
  isGroupOpened: boolean;
  handleGroupClick: (id: string) => void;
  children: React.ReactNode;
};

/**
 * Handles the button to expand or collapse the sidebar navigation.
 * @param {function} toggleNavCollapsed Function to call when the user clicks the collapse button
 * @param {boolean} isNavCollapsed True if the main sidebar navigation is collapsed
 */
function NavigationCollapseButton({
  toggleNavCollapsed,
  isNavCollapsed,
}: NavigationCollapseButtonProps) {
  return (
    <button
      title={`${isNavCollapsed ? "Expand" : "Collapse"} navigation ${UC.cmd}${
        UC.shift
      }D or ${UC.ctrl}${UC.shift}D`}
      onClick={toggleNavCollapsed}
      data-testid={
        isNavCollapsed ? "nav-expand-trigger" : "nav-collapse-trigger"
      }
    >
      {isNavCollapsed ? (
        <NavExpandIcon className="h-8 w-8" />
      ) : (
        <NavCollapseIcon className="h-8 w-8" />
      )}
    </button>
  );
}

type NavigationCollapseButtonProps = {
  toggleNavCollapsed: () => void;
  isNavCollapsed: boolean;
};

/**
 * Navigation-area item to handle the collapse/expand button.
 * @param {function} toggleNavCollapsed Function to call when the user clicks the collapse button
 * @param {boolean} isNavCollapsed True if the main sidebar navigation is collapsed
 */
function NavigationCollapseItem({
  toggleNavCollapsed,
  isNavCollapsed,
}: NavigationCollapseItemProps) {
  return (
    <li>
      <NavigationCollapseButton
        toggleNavCollapsed={toggleNavCollapsed}
        isNavCollapsed={isNavCollapsed}
      />
    </li>
  );
}

type NavigationCollapseItemProps = {
  toggleNavCollapsed: () => void;
  isNavCollapsed: boolean;
};

/**
 * Wraps the navigation items in <nav> and <ul> tags.
 * @param {string} className Tailwind CSS class name to add to the nav element
 */
function NavigationList({ className = "", children }: NavigationListProps) {
  return (
    <nav className={className}>
      <ul className="[&>li]:block">{children}</ul>
    </nav>
  );
}

type NavigationListProps = {
  className?: string;
  children: React.ReactNode;
};

/**
 * Renders the navigation area for mobile and desktop.
 * @param {function} navigationClick Function to call when the user clicks a navigation item
 * @param {function} toggleNavCollapsed Function to call when the user clicks the collapse button
 */
function NavigationExpanded({
  navigationClick,
  toggleNavCollapsed,
}: NavigationExpandedProps) {
  // Holds the ids of the currently open parent navigation items
  const [openedParents, setOpenedParents] = useState<string[]>([]);
  const extraQueries = "";

  /**
   * Called when the user clicks a group navigation item to open or close it.
   * @param {string} parentId ID of the clicked parent navigation item
   */
  function handleParentClick(parentId: string) {
    if (openedParents.includes(parentId)) {
      // Close the parent navigation item.
      setOpenedParents(openedParents.filter((id) => id !== parentId));
    } else {
      // Open the parent navigation item.
      setOpenedParents([...openedParents, parentId]);
    }
  }

  return (
    <>
      {toggleNavCollapsed && (
        <NavigationLogo
          toggleNavCollapsed={toggleNavCollapsed}
          isNavCollapsed={false}
        />
      )}
      <NavigationList className="p-4">
        <NavigationGroupItem
          id="data"
          title="Data"
          icon={<Icon.Data />}
          isGroupOpened={openedParents.includes("data")}
          handleGroupClick={handleParentClick}
        >
          <NavigationHrefItem
            id="raw-datasets"
            href={`/search/?type=MeasurementSet${extraQueries}`}
            navigationClick={navigationClick}
            isChildItem
          >
            Raw Data Sets
          </NavigationHrefItem>
          <NavigationHrefItem
            id="processed-datasets"
            href={`/search/?type=AnalysisSet${extraQueries}`}
            navigationClick={navigationClick}
            isChildItem
          >
            Processed Data Sets
          </NavigationHrefItem>
          <NavigationHrefItem
            id="files"
            href={`/search/?type=File${extraQueries}`}
            navigationClick={navigationClick}
            isChildItem
          >
            Files
          </NavigationHrefItem>
        </NavigationGroupItem>

        <NavigationGroupItem
          id="methodology"
          title="Methodology"
          icon={<Icon.Methodology />}
          isGroupOpened={openedParents.includes("methodology")}
          handleGroupClick={handleParentClick}
        >
          <NavigationHrefItem
            id="experimental-standards"
            href="/methodology/experimental_standards"
            navigationClick={navigationClick}
            isChildItem
          >
            Experimental Standards
          </NavigationHrefItem>
          <NavigationHrefItem
            id="computational-standards"
            href="/methodology/computational_standards"
            navigationClick={navigationClick}
            isChildItem
          >
            Computational Standards
          </NavigationHrefItem>
          <NavigationHrefItem
            id="genome-references"
            href={`/search?type=CuratedSet&file_set_type=genome${extraQueries}`}
            navigationClick={navigationClick}
            isChildItem
          >
            Genome References
          </NavigationHrefItem>
          <NavigationHrefItem
            id="audits"
            href="/audits"
            navigationClick={navigationClick}
            isChildItem
          >
            Audit Documentation
          </NavigationHrefItem>
        </NavigationGroupItem>

        <NavigationGroupItem
          id="data-model"
          title="Data Model"
          icon={<Icon.DataModel />}
          isGroupOpened={openedParents.includes("data-model")}
          handleGroupClick={handleParentClick}
        >
          <NavigationHrefItem
            id="schemas"
            href="/profiles"
            navigationClick={navigationClick}
            isChildItem
          >
            Schemas
          </NavigationHrefItem>
        </NavigationGroupItem>

        <NavigationGroupItem
          id="about"
          title="About"
          icon={
            <Icon.Brand className="[&>g]:fill-black dark:[&>g]:fill-white dark:[&>path]:fill-gray-300" />
          }
          isGroupOpened={openedParents.includes("about")}
          handleGroupClick={handleParentClick}
        >
          <NavigationHrefItem
            id="policies"
            href="/policies"
            navigationClick={navigationClick}
            isChildItem
          >
            Policies
          </NavigationHrefItem>
          <NavigationHrefItem
            id="igvf-help"
            href="/help/about-igvf"
            navigationClick={navigationClick}
            isChildItem
          >
            IGVF
          </NavigationHrefItem>
        </NavigationGroupItem>

        <NavigationGroupItem
          id="help"
          title="Help"
          icon={<QuestionMarkCircleIcon />}
          isGroupOpened={openedParents.includes("help")}
          handleGroupClick={handleParentClick}
        >
          <NavigationHrefItem
            id="submission"
            href="/help/data-submission"
            navigationClick={navigationClick}
            isChildItem
          >
            Data Submission
          </NavigationHrefItem>
          <NavigationHrefItem
            id="general-help"
            href="/help/general-help"
            navigationClick={navigationClick}
            isChildItem
          >
            General Help
          </NavigationHrefItem>
        </NavigationGroupItem>
      </NavigationList>
    </>
  );
}

type NavigationExpandedProps = {
  navigationClick: () => void;
  toggleNavCollapsed?: () => void;
};

/**
 * Renders the collapsed form of navigation.
 * @param {function} navigationClick Function to call when the user clicks a navigation item
 * @param {function} toggleNavCollapsed Function to call when the user clicks the collapse button
 */
function NavigationCollapsed({
  navigationClick,
  toggleNavCollapsed,
}: NavigationCollapsedProps) {
  return (
    <NavigationList className="w-full [&>ul>li]:my-2 [&>ul]:flex [&>ul]:flex-col [&>ul]:items-center">
      <NavigationCollapseItem
        toggleNavCollapsed={toggleNavCollapsed}
        isNavCollapsed
      />
      <NavigationHrefItem
        id="home"
        href="/"
        navigationClick={navigationClick}
        isNarrowNav
      >
        <NavigationIcon isNarrowNav>
          <Icon.Brand />
        </NavigationIcon>
      </NavigationHrefItem>
      <NavigationHrefItem
        id="help"
        href="/help/general-help/"
        navigationClick={navigationClick}
        isNarrowNav
      >
        <NavigationIcon isNarrowNav>
          <QuestionMarkCircleIcon />
        </NavigationIcon>
      </NavigationHrefItem>
    </NavigationList>
  );
}

type NavigationCollapsedProps = {
  navigationClick: () => void;
  toggleNavCollapsed: () => void;
};

/**
 * Displays the full IGVF logo and the sidebar navigation collapse button.
 * @param {function} toggleNavCollapsed Function to call when the user clicks the collapse button
 * @param {boolean} isNavCollapsed True if the main sidebar navigation is collapsed
 */
function NavigationLogo({
  toggleNavCollapsed,
  isNavCollapsed,
}: NavigationLogoProps) {
  return (
    <div className="flex">
      <SiteLogo />
      <NavigationCollapseButton
        toggleNavCollapsed={toggleNavCollapsed}
        isNavCollapsed={isNavCollapsed}
      />
    </div>
  );
}

type NavigationLogoProps = {
  toggleNavCollapsed: () => void;
  isNavCollapsed: boolean;
};

/**
 * Displays the navigation bar (for mobile) or the sidebar navigation (for desktop).
 */
export function NavigationSection() {
  // True if user has opened the mobile menu
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  // True if user has collapsed the sidebar menu
  const [isNavCollapsed, setIsNavCollapsed] = useSessionStorage(
    "nav-collapsed",
    false
  );

  /**
   * Called when the user clicks a navigation menu item.
   */
  function navigationClick() {
    setIsMobileNavOpen(false);
  }

  /**
   * Called when the user collapses or expands the main sidebar navigation. We have to cache this
   * function because the key listener has this as a dependency.
   */
  const toggleNavCollapsed = useCallback(() => {
    setIsNavCollapsed(!isNavCollapsed);
  }, [isNavCollapsed, setIsNavCollapsed]);

  useEffect(() => {
    /**
     * Called when the user types a key. Use this to toggle the collapsed state of navigation.
     * @param {object} event React synthetic keyboard event
     */
    function handleCollapseKeypress(event: KeyboardEvent) {
      if (
        (event.key === "d" || event.key === "D") &&
        (event.metaKey || event.ctrlKey) &&
        event.shiftKey
      ) {
        event.preventDefault();
        event.stopPropagation();
        toggleNavCollapsed();
        return false;
      }
      return true;
    }

    document.addEventListener("keydown", handleCollapseKeypress);
    return () => {
      document.removeEventListener("keydown", handleCollapseKeypress);
    };
  }, [toggleNavCollapsed]);

  return (
    <section
      className={`bg-brand md:sticky md:top-0 md:h-screen md:shrink-0 md:grow-0 md:overflow-y-auto md:bg-transparent ${
        isNavCollapsed ? "md:w-12" : "md:w-72"
      }`}
    >
      <div className="flex h-14 items-center justify-between p-2 md:hidden">
        <SiteLogo />
        <button
          data-testid="mobile-navigation-trigger"
          className="stroke-white md:hidden"
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
        >
          <Bars2Icon className="h-5 w-5 fill-white" />
        </button>
      </div>

      <div className={isNavCollapsed ? "md:p-0" : "md:px-4"}>
        <div className="hidden md:block">
          {isNavCollapsed ? (
            <NavigationCollapsed
              navigationClick={navigationClick}
              toggleNavCollapsed={toggleNavCollapsed}
            />
          ) : (
            <NavigationExpanded
              navigationClick={navigationClick}
              toggleNavCollapsed={toggleNavCollapsed}
            />
          )}
        </div>
      </div>

      <MobileCollapsableArea
        isOpen={isMobileNavOpen}
        testid="mobile-navigation"
      >
        <NavigationExpanded navigationClick={navigationClick} />
      </MobileCollapsableArea>
    </section>
  );
}
