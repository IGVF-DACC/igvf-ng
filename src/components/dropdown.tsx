"use client";

/**
 * This module lets you have a button that displays a dropdown when clicked. The dropdown can
 * contain any content. See the documentation in ./docs/dropdown.md for details.
 */

// node_modules
import {
  autoPlacement,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  type FloatingContext,
  type Placement,
  type ReferenceType,
} from "@floating-ui/react";
import {
  Children,
  cloneElement,
  ReactElement,
  useEffect,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
// lib
import { toShishkebabCase } from "../lib/general";

/**
 * ID of the dropdown portal DOM root-level element that dropdowns render into to avoid z-index
 * and parent-width issues.
 */
const DROPDOWN_PORTAL_ROOT_ID = "dropdown-portal-root";

/**
 * Object that contains all the properties that you need to track a dropdown. You can only control
 * one dropdown with this object. If you need more than one dropdown, you need to call `useDropdown()`
 * once for each dropdown.
 * @typedef {object} DropdownAttr
 * @property {string} id Unique ID for the dropdown
 * @property {React.RefObject<HTMLDivElement>} refEl Ref object for the dropdown reference element
 * @property {function} refProps Callback to get the dropdown reference element props
 * @property {boolean} isVisible True if the dropdown is visible
 * @property {React.RefObject<HTMLDivElement>} dropdownEl Ref object for the dropdown element
 * @property {function} dropdownProps Callback to get the dropdown element props
 * @property {object} context Context object for the dropdown
 * @property {object} styles Styles object for the dropdown
 */
type DropdownAttr = {
  id: string;
  refEl: (node: ReferenceType | null) => void;
  refProps: () => Record<string, unknown>;
  dropdownEl: (node: HTMLElement | null) => void;
  dropdownProps: () => object;
  context: FloatingContext;
  styles: CSSProperties;
  get isVisible(): boolean;
  set isVisible(value: boolean);
};

/**
 * Pass any of these values for the `type` property of `<DropdownRef>`. This gets assigned to the
 * `aria-haspopup` attribute of the dropdown reference child element. See:
 * https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-haspopup#values
 */
export const enum DropdownType {
  TRUE = "true",
  MENU = "menu",
  LISTBOX = "listbox",
  TREE = "tree",
  GRID = "grid",
  DIALOG = "dialog",
}

/**
 * Pass either of these values for the `alignment` argument to `useDropdown()` to have the dropdown
 * appear left aligned or right aligned with the dropdown reference.
 */
export const enum DropdownAlignment {
  LEFT = "DROPDOWN_ALIGN_LEFT",
  RIGHT = "DROPDOWN_ALIGN_RIGHT",
}

/**
 * Allowed placements for the dropdowns. The `autoPlacement()` middleware uses these values to
 * determine where to place the dropdown relative to the dropdown reference.
 */
type PlacementsType = {
  [key in DropdownAlignment]: Placement[];
};

/**
 * Values to assign to `allowedPlacements` in the `autoPlacement()` middleware for both left- and
 * right-aligned dropdowns.
 */
const placements: PlacementsType = {
  [DropdownAlignment.LEFT]: ["top-start", "bottom-start"],
  [DropdownAlignment.RIGHT]: ["top-end", "bottom-end"],
} as const;

/**
 * Call this custom hook within any component that uses a dropdown. It returns props that you pass
 * to both `<DropdownRef>` and `<Dropdown>`. It can only control one dropdown, so if you need to
 * have more than one, you need to call this hook once for each dropdown.
 *
 * You generally assign the return results to a variable named `dropdownAttr`, and then pass that
 * variable to both `<DropdownRef>` and `<Dropdown>` in their `dropdownAttr` properties.
 *
 * Each dropdown needs an ID unique within the page, which you pass to this hook. It gets used for
 * accessibility.
 *
 * These dropdowns use the `floating-ui` npm package. See their documentation at:
 * https://floating-ui.com/docs/react
 *
 * @param {string} id Unique ID for the dropdown
 * @param {string} alignment Either `DROPDOWN_ALIGN_LEFT` or `DROPDOWN_ALIGN_RIGHT`
 * @returns {object} Object with props for `<DropdownRef>` and `<Dropdown>`
 */
export function useDropdown(id: string, alignment = DropdownAlignment.LEFT) {
  // True if the dropdown is visible
  const [isVisible, setIsVisible] = useState(false);

  // Get the allowed placements for the dropdown.
  const allowedPlacements = placements[alignment];
  if (!allowedPlacements) {
    throw new Error(`Invalid value for alignment: ${alignment}`);
  }

  // Set up the floating UI for the dropdown.
  const { context, floatingStyles, refs } = useFloating({
    middleware: [autoPlacement({ allowedPlacements }), shift(), offset(4)],
    onOpenChange: setIsVisible,
    open: isVisible,
  });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
  ]);

  // Return the dropdown attributes that ties together a <DropdownRef>/<Dropdown> pair. Client
  // components should consider this object mostly opaque. They should only read and mutate the
  // `isVisible` property.
  return {
    id: `dropdown-${toShishkebabCase(id)}`,
    refEl: refs.setReference,
    refProps: getReferenceProps,
    dropdownEl: refs.setFloating,
    dropdownProps: getFloatingProps,
    context,
    styles: floatingStyles,

    // Public getter and setter for the `isVisible` React state.
    get isVisible() {
      return isVisible;
    },
    set isVisible(value) {
      setIsVisible(value);
    },
  } as DropdownAttr;
}

type DropdownRefProps = {
  dropdownAttr: DropdownAttr;
  type?: DropdownType;
  children: React.ReactNode;
};

/**
 * Wrap the element that you want to trigger the dropdown with this component. You can only wrap one
 * element; more than one causes an error visible in the console. This dropdown ref wrapper normally
 * contains a button, as `<DropdownRef>` assigns a click handler to its child, making a button a
 * natural child element.
 * @param {DropdownAttr} dropdownAttr Object returned by `useDropdown()`
 * @param {string} type Value to assign to `aria-haspopup` attribute of the dropdown reference
 */
export function DropdownRef({
  dropdownAttr,
  type = DropdownType.TRUE,
  children,
}: DropdownRefProps) {
  // Make sure only one child exists. Add the floating-ui refs and its other props to this child.
  const child = Children.only(children) as ReactElement;
  const clonedElement = cloneElement(child, {
    id: `${dropdownAttr.id}-ref`,
    "aria-expanded": dropdownAttr.isVisible,
    "aria-haspopup": type,
    ref: dropdownAttr.refEl,
    ...dropdownAttr.refProps(),
  });

  return <>{clonedElement}</>;
}

type DropdownProps = {
  dropdownAttr: DropdownAttr;
  className?: string;
  children: React.ReactNode;
};

/**
 * Wrap the content that you want to show in the dropdown with this component. This content can
 * comprise one or many elements. Make sure your content works with both light and dark mode, and
 * with different browser widths and heights.
 * @param {object} dropdownAttr Object returned by `useDropdown()`
 * @param {string} className Tailwind CSS classes to apply to the dropdown
 */
export function Dropdown({
  dropdownAttr,
  className = "",
  children,
}: DropdownProps) {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalRoot(document.getElementById(DROPDOWN_PORTAL_ROOT_ID));
  }, []);

  if (portalRoot) {
    return (
      <>
        {dropdownAttr.isVisible &&
          createPortal(
            <div
              id={dropdownAttr.id}
              data-testid={dropdownAttr.id}
              aria-labelledby={`${dropdownAttr.id}-ref`}
              className={
                className || "rounded border border-panel bg-panel shadow-lg"
              }
              ref={dropdownAttr.dropdownEl}
              style={dropdownAttr.styles}
              role="menu"
              {...dropdownAttr.dropdownProps()}
            >
              {children}
            </div>,
            portalRoot
          )}
      </>
    );
  }
}

/**
 * Drop this component into the `<body>` of your HTML document. It creates the DOM root-level
 * portal that the dropdowns render into.
 */
export function DropdownPortalRoot() {
  return (
    <div id={DROPDOWN_PORTAL_ROOT_ID} data-testid={DROPDOWN_PORTAL_ROOT_ID} />
  );
}
