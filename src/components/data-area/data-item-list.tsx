"use client";

/**
 * Wrappers to display data items, typically used on pages that display a single object.
 *
 * <DataPanel>
 *   <DataArea>
 *     <DataItemLabel>Lab</DataItemLabel>
 *     <DataItemValue>{lab.title}</DataItemValue>
 *     ...
 *   </DataArea>
 * </DataPanel>
 */

// node_modules
import { Children } from "react";
// components
import {
  CollapseControlVertical,
  DEFAULT_MAX_COLLAPSE_ITEMS_VERTICAL,
  useCollapseControl,
} from "@/components/collapse-control";

/**
 * Display a collapsible list of items in the value area of a data item.
 * @property {boolean} isCollapsible - True if the list should be collapsible
 * @property {number} maxItemsBeforeCollapse - Maximum number of items to display before collapsing
 * @property {boolean} isUrlList - True if the list contains URLs
 */
export function DataItemList({
  isCollapsible = false,
  maxItemsBeforeCollapse = DEFAULT_MAX_COLLAPSE_ITEMS_VERTICAL,
  isUrlList = false,
  children,
}: {
  isCollapsible?: boolean;
  maxItemsBeforeCollapse?: number;
  isUrlList?: boolean;
  children: React.ReactNode;
}) {
  const childArray = Children.toArray(children);
  const collapser = useCollapseControl(
    childArray,
    maxItemsBeforeCollapse,
    isCollapsible
  );

  const hasSingleChild = childArray.length === 1;
  const urlListCss = isUrlList ? "break-all" : "";

  return (
    <div>
      <ul className={hasSingleChild ? "" : "border-data-list-item border"}>
        {Children.map(collapser.items, (child) => (
          <li
            className={`${
              hasSingleChild
                ? ""
                : "border-data-list-item border-b px-2 py-0.5 last:border-none"
            } ${urlListCss}`}
          >
            {child}
          </li>
        ))}
      </ul>
      {collapser.isCollapseControlVisible && (
        <CollapseControlVertical
          length={childArray.length}
          isCollapsed={collapser.isCollapsed}
          setIsCollapsed={collapser.setIsCollapsed}
        />
      )}
    </div>
  );
}
