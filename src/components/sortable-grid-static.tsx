/**
 * Displays a sortable grid of data comprising an array of objects. The displayed grid uses CSS
 * grid (https://developer.mozilla.org/en-US/docs/Web/CSS/grid). See
 * components/docs/sortable-grid.md for documentation. As you make changes to this file, please
 * keep the documentation up to date.
 */

// node_modules
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import _ from "lodash";
import React, {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
} from "react";
// components
import DataGrid, {
  DataGridContainer,
  type DataGridRow,
  type RowComponentProps,
} from "@/components/data-grid";
import { SortableGridCore } from "@/components/sortable-grid-core";
// lib
import { requestBiosamples } from "@/lib/common-requests";
import FetchRequest from "@/lib/fetch-request";
// types
import type { DatabaseObject } from "@/globals.d";
import SortableGrid from "./sortable-grid";

/**
 * The default maximum number of items in the table before the pager gets displayed.
 */
const DEFAULT_MAX_ITEMS_PER_PAGE = 10;

enum SortDirection {
  ASC = "asc",
  DESC = "desc",
}

export type DisplayComponentProp = {
  source: DatabaseObject;
  meta?: Record<string, any>;
};
export type DisplayComponentType = React.ComponentType<DisplayComponentProp>;

export type SortableGridColumn = {
  id: string;
  title: string | React.ReactNode;
  display?: DisplayComponentType;
  value?: (item: any) => any;
  sorter?: (item: any, meta: Record<string, any>) => any;
  isSortable?: boolean;
  hide?: (
    data: any[],
    columns: SortableGridColumn[],
    meta: Record<string, any>
  ) => boolean;
};

type HeaderCellProps = {
  columnConfiguration: SortableGridColumn;
  sortBy: string;
  sortDirection: SortDirection;
};

/**
 * `SortableGrid` renders an array of objects of a type. This function converts the contents of
 * this array to a form that `DataGrid` can render.
 * @param {array} items Array of objects to render in a sortable grid
 * @param {array} columns Column definitions for the sortable grid
 * @param {string} keyProp Property of each item to use as the React key; index used if not provided
 * @returns {array} `items` contents in a form suitable for passing to <DataGrid>
 */
function convertObjectArrayToDataGrid(
  items: any[],
  columns: SortableGridColumn[],
  keyProp: string
): DataGridRow[] {
  return items.map((item, index) => {
    return {
      id: keyProp ? item[keyProp] : index,
      cells: columns.map((column) => {
        let content = column.display || item[column.id] || null;

        // If the column configuration `value()` specified for the current column, call it to
        // extract the cell's value.
        if (column.value) {
          content = column.value(item);
        }
        return { id: column.id, content, source: item };
      }),
    };
  });
}

/**
 * Sort the data according to the provided column and direction.
 * @param {array} data Array of objects to sort
 * @param {object} meta Metadata for the grid
 * @param {string} sortBy ID of the column to sort by
 * @param {string} sortDirections Sort direction; asc or desc
 * @returns {array} Sorted copy of incoming array of objects
 */
function sortData(
  data: any[],
  meta: Record<string, any>,
  columns: SortableGridColumn[],
  sortBy: string,
  sortDirections: SortDirection
): any[] {
  const sortedColumnConfig = columns.find((column) => column.id === sortBy);
  if (sortedColumnConfig?.sorter) {
    return _.orderBy(
      data,
      (item) => sortedColumnConfig.sorter!(item, meta),
      sortDirections
    );
  }

  // If the sorted column's configuration includes a `value` transform function, use it to sort
  // the transformed data.
  if (sortedColumnConfig?.value) {
    return _.orderBy(
      data,
      (item) => sortedColumnConfig.value!(item).toString().toLowerCase(),
      [sortDirections]
    );
  }

  // No `sorter` nor `value` transform function; sort by the primitive data value.
  return _.orderBy(data, [sortBy], [sortDirections]);
}

/**
 * Display the sorting icon (including a blank icon for currently sorted and non-sortable columns)
 * for the current sortable table-header cell.
 */
function HeaderSortIcon({
  columnConfiguration,
  sortBy,
  sortDirection,
}: {
  columnConfiguration: SortableGridColumn;
  sortBy: string;
  sortDirection: SortDirection;
}) {
  // Determine the appearance of the sorting icon based on the sort direction.
  const SortIcon =
    sortDirection === SortDirection.ASC ? ChevronUpIcon : ChevronDownIcon;

  return (
    <SortIcon
      className={`h-5 w-5 ${
        sortBy === columnConfiguration.id ? "" : "invisible"
      }`}
    />
  );
}

/**
 * Renders a sortable table header cell; one that reacts to clicks to sort the column.
 */
function SortableHeaderCell({
  columnConfiguration,
  sortBy,
  sortDirection,
  className,
  children,
}: {
  columnConfiguration: SortableGridColumn;
  sortBy: string;
  sortDirection: SortDirection;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`justify-between hover:bg-gray-300 dark:hover:bg-gray-700 ${className}`}
    >
      <div className="flex-auto">{children}</div>
      <div className="flex-initial">
        <HeaderSortIcon
          columnConfiguration={columnConfiguration}
          sortBy={sortBy}
          sortDirection={sortDirection}
        />
      </div>
    </div>
  );
}

/**
 * Renders a non-sortable table header cell.
 */
function NonSortableHeaderCell({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return <div className={className}>{children}</div>;
}

/**
 * Default renderer for each header cell in a sortable grid, called by `DataGrid`. This gets
 * overridden with the `CustomHeaderCell` prop for `SortableGrid`.
 */
function HeaderCell({
  cells,
  cellIndex,
  meta,
  children,
}: {
  cells: any[];
  cellIndex: number;
  meta: Record<string, any>;
  children: React.ReactNode;
}) {
  // Get the definition for the current column.
  const columnConfiguration = meta.columns[cellIndex];

  // Add potentially useful props to the cell children referencing React components for custom
  // header cell title renderers.
  const headerCellChildren = Children.map(children, (child) => {
    if (isValidElement(child)) {
      const componentChild = child as React.ReactElement<HeaderCellProps>;
      return cloneElement(componentChild, {
        columnConfiguration,
        sortBy: meta.sortBy,
        sortDirection: meta.sortDirection,
      });
    }
    return child;
  });

  // Determine whether to render a sortable (`isSortable` true or not used) or non-sortable
  // (`isSortable` false) header cell.
  const HeaderCellRenderer =
    (columnConfiguration.isSortable ||
      columnConfiguration.isSortable === undefined) &&
    meta.dataLength > 1
      ? SortableHeaderCell
      : NonSortableHeaderCell;

  return (
    <HeaderCellRenderer
      columnConfiguration={columnConfiguration}
      sortBy={meta.sortBy}
      sortDirection={meta.sortDirection}
      className="flex h-full w-full items-center bg-gray-200 p-2 text-left font-semibold dark:bg-gray-800"
    >
      {headerCellChildren}
    </HeaderCellRenderer>
  );
}

/**
 * Display a sortable grid of data according to the provided columns. The data has to be an array
 * of objects requiring no column nor row spans. It uses the provided `columns` configurations to
 * convert `data` to data-grid format. To help the header cells know how to react to the user's
 * clicks for sorting, plus any additional information custom header cells need, it passes the cell
 * configuration for each column in its data-grid format `meta` property.
 */
export default async function SortableGridStatic({
  data,
  columns,
  keyProp = "",
  meta = {},
  CustomHeaderCell = HeaderCell,
}: {
  data: string[];
  columns: SortableGridColumn[];
  keyProp?: string;
  meta?: object;
  isTotalCountHidden?: boolean;
  CustomHeaderCell?: React.ComponentType<RowComponentProps>;
}) {
  const request = new FetchRequest();
  const displayData = (await requestBiosamples(
    data,
    request
  )) as unknown as DatabaseObject[];

  console.log("SAMPLE TABLE ****", displayData[0]);
  return <SortableGridCore displayData={displayData} />;
}
