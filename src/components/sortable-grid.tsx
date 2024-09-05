"use client";

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
  PropsWithChildren,
  useRef,
  useState,
} from "react";
// components
import {
  DataGrid,
  DataGridContainer,
  type DataGridRow,
  type RowComponentProps,
} from "@/components/data-grid";
import { Pager } from "@/components/pager";
import { TableCount } from "@/components/table-count";
// types
import type { DatabaseObject } from "@/globals.d";

/**
 * Default maximum number of items to display per page in the table.
 */
const DEFAULT_MAX_ITEMS_PER_PAGE = 10;

/**
 * Sorting direction for a column in the grid.
 * @property {string} ASC Sort in ascending order
 * @property {string} DESC Sort in descending order
 */
export type SortDirection = "asc" | "desc";

/**
 * Configuration for the pager control.
 * @property {number} [currentPageIndex] Currently displayed page; 0-based index
 * @property {number} [maxItemsPerPage] Maximum number of items to display in the table before the pager
 *    appears
 */
export type PagerConfig = {
  currentPageIndex?: number;
  maxItemsPerPage?: number;
};

/**
 * Configures the initial sorting of the grid.
 * @property {string} [initialColumnId] ID of the column to sort by initially
 * @property {SortDirection} [initialDirection] Initial sort direction
 * @property {boolean} [isSortingSuppressed] True to disable sorting for all columns; probably used
 */
export type SortingConfig = {
  initialColumnId?: string;
  initialDirection?: SortDirection;
  isSortingSuppressed?: boolean;
};

/**
 * Properties passed to the optional display component for a column.
 * @property {DatabaseObject} source The object to display
 * @property {Record<string, any>} [meta] Additional metadata for the display component
 */
export type DisplayComponentProp = {
  source: DatabaseObject;
  meta?: Record<string, any>;
};

/**
 * React component to display the contents of a column in the grid.
 */
export type DisplayComponent = React.ComponentType<DisplayComponentProp>;

/**
 * Type for the function that returns a simple value for each cell in a column.
 */
export type ValueFunction = (item: DatabaseObject) => string;

/**
 * Type for the function that returns a sorting value for each cell in a column.
 */
export type SorterFunction = (
  item: DatabaseObject,
  meta: Record<string, any>
) => string | number;

/**
 * Function to determine whether to hide a column.
 */
export type HideFunction = (
  data: DatabaseObject[],
  columns: SortableGridColumn[],
  meta: Record<string, any>
) => boolean;

/**
 * Configuration for a column in the sortable grid.
 * @property {string} id Unique ID of the column, often the key in the object
 * @property {React.ReactNode} title Title of the column, displayed in the header
 * @property {DisplayComponent} [display] React component to display the contents of the column
 * @property {ValueFunction} [value] Function to extract the cell's value from the object
 * @property {SorterFunction} [sorter] Function to extract the sorting value from the object
 * @property {boolean} [isSortable] True if the column is sortable; default is true
 * @property {HideFunction} [hide] Function to determine whether to hide the column
 */
export interface SortableGridColumn {
  id: string;
  title: React.ReactNode;
  display?: DisplayComponent;
  value?: ValueFunction;
  sorter?: SorterFunction;
  hide?: HideFunction;
  isSortable?: boolean;
}

/**
 * Properties passed to the React component that renders each column's header cell.
 * @property {SortableGridColumn} columnConfiguration Configuration for the current column
 * @property {string} sortBy ID of the column to sort by
 * @property {SortDirection} sortDirection Sort direction; ascending or descending
 */
type HeaderCellProps = {
  columnConfiguration: SortableGridColumn;
  sortBy: string;
  sortDirection: SortDirection;
};

/**
 * Metadata for each cell in the grid, including `meta` passed to `<SortableGrid>`.
 * @property {string} sortBy ID of the column to sort by
 * @property {SortableGridColumn[]} columns Column configuration for the sortable grid
 * @property {SortDirection} sortDirection Sort direction; asc or desc
 * @property {() => void} handleSortClick Function to call when a sortable column header is clicked
 * @property {number} dataLength Number of items in the data array
 * @property {Record<string, any>} [key] Additional metadata passed to `<SortableGrid>`
 */
type CellMeta = {
  sortBy: string;
  columns: SortableGridColumn[];
  sortDirection: SortDirection;
  handleSortClick: (column: string) => void;
  dataLength: number;
  [key: string]: any;
};

/**
 * `SortableGrid` renders an array of objects of a type. This function converts the contents of
 * this array to a form that `DataGrid` can render.
 * @param {DatabaseObject[]} items Array of objects to render in a sortable grid
 * @param {SortableGridColumn[]} columns Column definitions for the sortable grid
 * @param {string} [keyProp] Property of each item to use as the React key; index used if not provided
 * @returns {DataGridRow[]} `items` contents in a form suitable for passing to <DataGrid>
 */
function convertObjectArrayToDataGrid(
  items: DatabaseObject[],
  columns: SortableGridColumn[],
  keyProp = ""
): DataGridRow[] {
  return items.map((item, index) => {
    return {
      id: keyProp ? (item[keyProp] as string) : String(index),
      cells: columns.map((column) => {
        let content = column.display || item[column.id] || "";

        // If the column configuration `value()` specified for the current column, call it to
        // extract the cell's value.
        if (column.value) {
          content = column.value(item);
        }
        return { id: column.id, content, source: item };
      }),
    } as DataGridRow;
  });
}

/**
 * Sort the data according to the provided column and direction.
 * @param {DatabaseObject[]} data Array of objects to sort
 * @param {Record<string, any>} meta Metadata for the grid
 * @param {SortableGridColumn[]} columns Column definitions for the sortable grid
 * @param {string} sortBy ID of the column to sort by
 * @param {SortDirection} sortDirections Sort direction; asc or desc
 * @returns {DatabaseObject[]} Sorted copy of incoming array of objects
 */
function sortData(
  data: DatabaseObject[],
  meta: Record<string, any>,
  columns: SortableGridColumn[],
  sortBy: string,
  sortDirections: SortDirection
): DatabaseObject[] {
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
 * @param {SortableGridColumn} columnConfiguration Configuration for the current column
 * @param {string} sortBy ID of the column to sort by
 * @param {SortDirection} sortDirection Sort direction; ascending or descending
 */
function HeaderSortIcon({
  columnConfiguration,
  sortBy,
  sortDirection,
}: HeaderSortIconProps) {
  // Determine the appearance of the sorting icon based on the sort direction.
  const SortIcon = sortDirection === "asc" ? ChevronUpIcon : ChevronDownIcon;

  return (
    <SortIcon
      className={`h-5 w-5 ${
        sortBy === columnConfiguration.id ? "" : "invisible"
      }`}
    />
  );
}

type HeaderSortIconProps = {
  columnConfiguration: SortableGridColumn;
  sortBy: string;
  sortDirection: SortDirection;
};

/**
 * Renders a sortable table header cell; one that reacts to clicks to sort the column.
 * @param {SortableGridColumn} columnConfiguration Configuration for the current column
 * @param {string} sortBy ID of the column to sort by
 * @param {SortDirection} sortDirection Sort direction; ascending or descending
 * @param {() => void} onClick Function to call when the header cell is clicked
 * @param {string} className CSS classes to apply to the header cell
 */
function SortableHeaderCell({
  columnConfiguration,
  sortBy,
  sortDirection,
  onClick,
  className,
  children,
}: PropsWithChildren<SortableHeaderCellProps>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`justify-between hover:bg-gray-300 ${className}`}
    >
      <div className="flex-auto">{children}</div>
      <div className="flex-initial">
        <HeaderSortIcon
          columnConfiguration={columnConfiguration}
          sortBy={sortBy}
          sortDirection={sortDirection}
        />
      </div>
    </button>
  );
}

type SortableHeaderCellProps = {
  columnConfiguration: SortableGridColumn;
  sortBy: string;
  sortDirection: SortDirection;
  onClick: () => void;
  className: string;
  children: React.ReactNode;
};

/**
 * Renders a non-sortable table header cell.
 * @param {string} className CSS classes to apply to the header cell
 */
function NonSortableHeaderCell({
  className,
  children,
}: PropsWithChildren<NonSortableHeaderCellProps>) {
  return <div className={className}>{children}</div>;
}

type NonSortableHeaderCellProps = {
  className: string;
  children: React.ReactNode;
};

/**
 * Default renderer for each header cell in a sortable grid, called by `DataGrid`. This gets
 * overridden with the `CustomHeaderCell` prop for `SortableGrid`. See `RowComponentProps` for
 * the meanings of the props.
 */
function HeaderCell({
  cells,
  cellIndex,
  meta,
  children,
}: PropsWithChildren<RowComponentProps>) {
  const cellMeta = meta as CellMeta;

  // Get the definition for the current column.
  const columnConfiguration = cellMeta.columns[cellIndex];

  // Add potentially useful props to the cell children referencing React components for custom
  // header cell title renderers.
  const headerCellChildren = Children.map(children, (child) => {
    if (isValidElement(child)) {
      const componentChild = child as React.ReactElement<HeaderCellProps>;
      return cloneElement(componentChild, {
        columnConfiguration,
        sortBy: cellMeta.sortBy,
        sortDirection: cellMeta.sortDirection,
      });
    }
    return child;
  });

  // Determine whether to render a sortable (`isSortable` true or not used) or non-sortable
  // (`isSortable` false) header cell.
  const HeaderCellRenderer =
    (columnConfiguration.isSortable ||
      columnConfiguration.isSortable === undefined) &&
    cellMeta.dataLength > 1
      ? SortableHeaderCell
      : NonSortableHeaderCell;

  return (
    <HeaderCellRenderer
      columnConfiguration={columnConfiguration}
      sortBy={cellMeta.sortBy}
      sortDirection={cellMeta.sortDirection}
      onClick={() => cellMeta.handleSortClick(String(cells[cellIndex].id))}
      className="flex h-full w-full items-center bg-gray-200 p-2 text-left font-semibold"
    >
      {headerCellChildren}
    </HeaderCellRenderer>
  );
}

/**
 * Displays a pager control intended for a table, often used with `<SortableGrid>`. The pager only
 * appears when the number of items in the table exceeds the maximum number of items per page.
 * @param {DatabaseObject[]} data Objects to display in the table
 * @param {number} currentPageIndex Currently displayed page; 0-based index
 * @param {function} setCurrentPageIndex Function to call when the user selects a new page
 * @param {number} maxItemsPerPage Maximum number of items to display in the table before the pager
 */
function TablePager({
  data,
  currentPageIndex,
  setCurrentPageIndex,
  maxItemsPerPage,
}: TablePagerProps) {
  const totalPages = Math.ceil(data.length / maxItemsPerPage);
  if (totalPages > 1) {
    return (
      <div
        className="flex justify-center border-l border-r border-panel bg-gray-100 py-0.5 dark:bg-gray-900"
        data-testid="table-pager"
      >
        <Pager
          currentPage={currentPageIndex + 1}
          totalPages={totalPages}
          onClick={(newCurrentPage) => setCurrentPageIndex(newCurrentPage - 1)}
        />
      </div>
    );
  }
  return null;
}

type TablePagerProps = {
  data: DatabaseObject[];
  currentPageIndex: number;
  setCurrentPageIndex: (newCurrentPage: number) => void;
  maxItemsPerPage: number;
};

/**
 * Display a sortable grid of data according to the provided columns. The data has to be an array
 * of objects requiring no column nor row spans. It uses the provided `columns` configurations to
 * convert `data` to data-grid format. To help the header cells know how to react to the user's
 * clicks for sorting, plus any additional information custom header cells need, it passes the cell
 * configuration for each column in its data-grid format `meta` property.
 * @property {DatabaseObject[]} data Array of objects to display in the grid
 * @property {SortableGridColumn[]} columns Column definitions for the grid
 * @property {string} [keyProp] Property of each item to use as the React key; index used if
 *     not provided
 * @property {SortingConfig} [sortingConfig] Initial sorting configuration for the grid
 * @property {object} [meta] Additional custom information to pass to the grid
 * @property {boolean} [isTotalCountHidden] True if the total count of items is hidden
 * @property {React.ComponentType<RowComponentProps>} [CustomHeaderCell] Custom header cell
 *     component
 */
export function SortableGrid({
  data,
  columns,
  keyProp = "",
  pagerConfig = {},
  sortingConfig = {},
  meta = {},
  isTotalCountHidden = false,
  CustomHeaderCell = HeaderCell,
}: SortableGridProps) {
  // id of the currently sorted column
  const [sortBy, setSortBy] = useState(
    sortingConfig.initialColumnId || columns[0].id
  );
  // Whether the currently sorted column is sorted in ascending or descending order.
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    sortingConfig.initialDirection || "asc"
  );
  const gridRef = useRef(null);

  // Current page if the table has a pager not managed by the parent.
  const [pageIndex, setPageIndex] = useState(0);
  const currentPageIndex = pagerConfig?.currentPageIndex ?? pageIndex;
  const maxItemsPerPage =
    pagerConfig?.maxItemsPerPage || DEFAULT_MAX_ITEMS_PER_PAGE;

  /**
   * Called when the user clicks a column header to set its sorting.
   * @param {string} column - id of the column to sort by.
   */
  function handleSortClick(column: string) {
    if (sortBy === column) {
      // Sorted column clicked. Reverse the sort direction.
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Unsorted column clicked; sort by this column ascending.
      setSortBy(column);
      setSortDirection("asc");
    }
  }

  // Filter the columns to only include those that have a hide() function that returns false, or
  // that don't have a hide() function at all.
  const visibleColumns = columns.filter(
    (column) => !column.hide || !column.hide(data, columns, meta)
  );

  // Generate the cells within the header row. The column title can contain a string or a React
  // component.
  const headerCells = visibleColumns.map((column) => {
    return {
      id: column.id,
      content: column.title,
      role: "columnheader",
    };
  });

  // Generate the header row itself, containing the cells, as well as sorting information and the
  // column configuration.
  const headerRow: DataGridRow[] = [
    {
      id: "header",
      cells: headerCells,
      RowComponent: CustomHeaderCell,
    },
  ];

  // Make sure the `sortBy` column actually exists in the columns. Sort by the first column if not.
  const sortByColumn = visibleColumns.find((column) => column.id === sortBy);
  if (!sortByColumn) {
    setSortBy(visibleColumns[0].id);
    return null;
  }

  // Convert the data (simple array of objects) into a data grid array and render the table.
  const sortedData = sortingConfig.isSortingSuppressed
    ? data
    : sortData(data, meta, visibleColumns, sortBy, sortDirection);

  // Extract the current page of data from sortedData if the table has a pager.
  const pagedData = sortedData.slice(
    currentPageIndex * maxItemsPerPage,
    (currentPageIndex + 1) * maxItemsPerPage
  );
  const dataRows = convertObjectArrayToDataGrid(
    pagedData,
    visibleColumns,
    keyProp
  );
  return (
    <div>
      {!isTotalCountHidden && <TableCount count={data.length} />}
      <TablePager
        data={data}
        currentPageIndex={currentPageIndex}
        setCurrentPageIndex={setPageIndex}
        maxItemsPerPage={maxItemsPerPage}
      />
      <DataGridContainer ref={gridRef}>
        <DataGrid
          data={headerRow.concat(dataRows)}
          meta={{
            ...meta,
            sortBy,
            columns: visibleColumns,
            sortDirection,
            handleSortClick,
            dataLength: data.length,
          }}
        />
      </DataGridContainer>
    </div>
  );
}

export type SortableGridProps = {
  data: DatabaseObject[];
  columns: SortableGridColumn[];
  keyProp?: string;
  pagerConfig?: PagerConfig;
  sortingConfig?: SortingConfig;
  meta?: Record<string, any>;
  isTotalCountHidden?: boolean;
  CustomHeaderCell?: React.ComponentType<RowComponentProps>;
};
