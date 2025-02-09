"use client";

// node_modules
import { Children, Fragment, PropsWithChildren } from "react";
// components
import {
  CollapseControlInline,
  DEFAULT_MAX_COLLAPSE_ITEMS_INLINE,
  useCollapseControl,
} from "@/components/collapse-control";
// root
import type { ReactNodeWithKey } from "@/globals.d";

/**
 * Display a list of inline React components with a separator between the items -- sort of like
 * .join() but for React components. By default, the separator is a comma and a space. You can use
 * any sequence of characters as the separator, or even a React component as the separator. Wrap
 * your array of React components you want separated in a SeparatedList component:
 *
 * componentList = [First React component, Second React component, Third React component]
 * <SeparatedList separator = " . ">
 *   {componentList.map((component) => (
 *     <div key={component.id}>{component}</div>
 *   )}
 * </SeparatedList>
 * // Expected output: "First React component . Second React component . Third React component"
 *
 * If you provide individual components between the <SeparatedList> and </SeparatedList> tags
 * instead of a loop, each of these components must include a key attribute.
 *
 * You can nest SeparatedList components to combine separated lists. Make sure to give each child
 * SeparatedList a unique key:
 *
 * componentList0 = [First component, Second component]
 * componentList1 = [Third component, Fourth component]
 * <SeparatedList separator={<a> LINK </>}>
 *   <SeparatedList key="0">
 *     {componentList0.map((component) => (
 *       <div key={component.id}>{component}</div>
 *     )}
 *   </SeparatedList>
 *   <SeparatedList key="1">
 *     {componentList1.map((component) => (
 *       <div key={component.id}>{component}</div>
 *     )}
 *   </SeparatedList>
 * </SeparatedList>
 * // Expected output: "First component, Second component LINK Third component, Fourth component"
 *
 * @param {React.ReactNode} [separator] The separator between the items in the list
 * @param {string} [className] Class name for the list container
 * @param {string} [testid] Test ID for the list container
 * @param {boolean} [isCollapsible] True if the list is collapsible
 * @param {number} [maxItemsBeforeCollapse] Maximum number of items to display before the list
 *     collapses
 */

export function SeparatedList({
  separator = ", ",
  className = "",
  testid = "",
  isCollapsible = false,
  maxItemsBeforeCollapse = DEFAULT_MAX_COLLAPSE_ITEMS_INLINE,
  children,
}: PropsWithChildren<SeparatedListProps>) {
  const collapser = useCollapseControl(
    children,
    maxItemsBeforeCollapse,
    isCollapsible
  );
  const items = isCollapsible ? collapser.items : Children.toArray(children);

  if (items.length > 0) {
    return (
      <div className={className || ""} data-testid={testid}>
        {items
          .filter(Boolean)
          .map((item, index) => (
            <Fragment key={(item as ReactNodeWithKey).key || index}>
              {item}
              {collapser.isCollapseControlVisible &&
              index === collapser.items.length - 1 ? (
                <CollapseControlInline
                  length={items.length}
                  isCollapsed={collapser.isCollapsed}
                  setIsCollapsed={collapser.setIsCollapsed}
                />
              ) : null}
            </Fragment>
          ))
          .reduce<React.ReactNode[]>(
            (combined, curr, index) => [
              ...combined,
              <Fragment key={`sep-${index}`}>{separator}</Fragment>,
              curr,
            ],
            []
          )
          .reduce((acc, curr) => (
            <>
              {acc}
              {curr}
            </>
          ))}
      </div>
    );
  }
}

export type SeparatedListProps = {
  separator?: React.ReactNode;
  className?: string;
  testid?: string;
  isCollapsible?: boolean;
  maxItemsBeforeCollapse?: number;
  children: React.ReactNode;
};
