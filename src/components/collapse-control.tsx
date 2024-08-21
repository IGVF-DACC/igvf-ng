"use client";

/**
 * Some lists of items might be so long that people don't want to see the whole thing by default.
 * This module lets you display a truncated list of items with an expand/collapse control, but only
 * if the list is long enough to need one. In this example, we show the list of items within a <ul>
 * and have a collapse button appear if the list is long enough to need one.
 *
 * ```jsx
 * const collapser = useCollapseControl(
 *   items,
 *   maxItemsBeforeCollapse,
 *   isCollapsible
 * );
 *
 * return (
 *   <div>
 *     <ul className={className} data-testid={testid}>
 *       {collapser.items.map((location) => (
 *         <li key={index}>
 *           {location}
 *         </li>
 *       ))}
 *     </ul>
 *     {collapser.isCollapseControlVisible && (
 *       <CollapseControlVertical
 *         length={locations.length}
 *         isCollapsed={collapser.isCollapsed}
 *         setIsCollapsed={collapser.setIsCollapsed}
 *       />
 *     )}
 *   </div>
 * );
 * ```
 */

// node_modules
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowDownIcon,
  ArrowUpIcon,
} from "@heroicons/react/20/solid";
import { Children, useState } from "react";

export type CollapseControl = {
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  isCollapseControlVisible: boolean;
  items: React.ReactNode[];
};

/**
 * Hook to control the collapsed state of a list. It keeps the collapsed/expanded state and
 * handles the truncation of the list of items while collapsed.
 * @param {React.ReactNode} items List of items to display
 * @param {number} maxItemsBeforeCollapse Max number of items before the list appears collapsed
 * @param {boolean} isCollapsible True if the list should be collapsible
 * @returns {CollapseControl} Object containing the collapsed state, the collapsed/expanded state
 *   setter, and the truncated list of items
 */
export function useCollapseControl(
  items: React.ReactNode,
  maxItemsBeforeCollapse: number,
  isCollapsible = true
): CollapseControl {
  // True if the list appears collapsed
  const [isCollapsed, setIsCollapsed] = useState(true);
  const iterableItems = Children.toArray(items);

  const isCollapseControlVisible =
    isCollapsible && iterableItems.length > maxItemsBeforeCollapse;
  const truncatedItems =
    isCollapseControlVisible && isCollapsed
      ? iterableItems.slice(0, maxItemsBeforeCollapse)
      : iterableItems;

  return {
    // True if the list appears collapsed; only applies if `isCollapsible` is true
    isCollapsed,
    // Function to set the collapsed state
    setIsCollapsed,
    // True if the list is collapsable and has enough items to need one
    isCollapseControlVisible,
    // Truncated list of items to display
    items: truncatedItems,
  };
}

/**
 * Default maximum number of inline items before the list appears collapsed, and an expand/collapse
 * control appears.
 */
export const DEFAULT_MAX_COLLAPSE_ITEMS_INLINE = 10;

/**
 * Default maximum number of vertical items before the list appears collapsed, and an
 * expand/collapse control appears.
 */
export const DEFAULT_MAX_COLLAPSE_ITEMS_VERTICAL = 5;

/**
 * Displays the expand/collapse control for a collapsible list.
 * @property {number} length - Number of items in the list
 * @property {boolean} isCollapsed - True if the list is collapsed
 * @property {function} setIsCollapsed - Function to set the collapsed state
 */
export function CollapseControlInline({
  length,
  isCollapsed,
  setIsCollapsed,
}: {
  length: number;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}) {
  const label = isCollapsed
    ? `Show all ${length} items in list`
    : `Show fewer items in list`;

  return (
    <button
      onClick={() => setIsCollapsed(!isCollapsed)}
      className="border-collapse-ctrl bg-collapse-ctrl text-collapse-ctrl ml-1 inline items-center rounded-sm border pl-1.5 pr-1 text-xs font-bold"
      data-testid="collapse-control-inline"
      aria-label={label}
    >
      {isCollapsed ? (
        <>
          {"ALL "}
          {length}
          <ArrowRightIcon className="inline-block h-3 w-3" />
        </>
      ) : (
        <>
          {"FEWER "}
          <ArrowLeftIcon className="inline h-4 w-4" />
        </>
      )}
    </button>
  );
}

/**
 * Displays the expand/collapse control for `<DataItemList>`.
 * @property {number} length - Number of items in the list
 * @property {boolean} isCollapsed - True if the list is collapsed
 * @property {function} setIsCollapsed - Function to set the collapsed state
 * @property {boolean} isFullBorder - True if the list shows a border around items when more than
 *   one item is displayed
 */
export function CollapseControlVertical({
  length,
  isCollapsed,
  setIsCollapsed,
  isFullBorder = false,
}: {
  length: number;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  isFullBorder?: boolean;
}) {
  const label = isCollapsed
    ? `Show all ${length} items in list`
    : `Show fewer items in list`;
  const borderClass = isFullBorder
    ? "border rounded-sm"
    : "border-b border-l border-r rounded-b-sm";

  return (
    <button
      onClick={() => setIsCollapsed(!isCollapsed)}
      className={`border-collapse-ctrl bg-collapse-ctrl text-collapse-ctrl flex items-center py-0.5 pl-2.5 pr-1.5 text-xs font-bold ${borderClass}`}
      data-testid="collapse-control-vertical"
      aria-label={label}
    >
      {isCollapsed ? (
        <>
          {"ALL "}
          {length}
          <ArrowDownIcon className="ml-0.5 h-3 w-3" />
        </>
      ) : (
        <>
          {"FEWER "}
          <ArrowUpIcon className="h-4 w-4" />
        </>
      )}
    </button>
  );
}
