/**
 * Displays a grid of data when given an array specially formatted for this purpose. The displayed
 * grid uses CSS * grid (https://developer.mozilla.org/en-US/docs/Web/CSS/grid). See
 * components/docs/data-grid.md for documentation. As you make changes to this file, please keep
 * the documentation up to date.
 */

// node_modules
import { forwardRef } from "react";

export type CellSimpleContent = string | number;

/**
 * Props for RowComponent. This is a component that wraps each row in the data grid. It can be used
 * to add additional functionality to each row, such as row highlighting or row selection.
 */
export type RowComponentProps = {
  id: string | number;
  cells: DataGridCell[];
  cellIndex: number;
  meta: Record<string, any>;
  children: React.ReactNode;
};

export type CellContent =
  | CellSimpleContent
  | React.ReactNode
  | ((cell: DataGridCell, meta: Record<string, any>) => React.ReactNode);

export type DataGridCell = {
  id: string | number;
  content: CellContent;
  columns?: number;
  role?: string;
  source?: object;
};

export type DataGridRow = {
  id: string | number;
  cells: DataGridCell[];
  children?: DataGridRow[];
  RowComponent?: React.ComponentType<RowComponentProps>;
};

/**
 * Default data grid cell. Custom data grid cells can use wrap or replace this; whatever they
 * choose.
 */
function DefaultCell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full bg-white p-2 dark:bg-gray-900">
      {children}
    </div>
  );
}

/**
 * Surround the <DataGrid> component with this wrapper component, or a custom one like it. Note
 * the use of CSS outlines instead of borders as all other panels use. This prevents Safari (12.4
 * at the time of writing) from allowing the table to scroll horizontally even if you can see the
 * entire table.
 */
export const DataGridContainer = forwardRef(function DataGridContainer(
  {
    className = "",
    children,
  }: { className?: string; children: React.ReactNode },
  ref: React.Ref<HTMLDivElement>
) {
  return (
    <div
      ref={ref}
      role="table"
      className={`border-1 grid w-full gap-px overflow-x-auto border border-panel bg-gray-300 text-sm dark:outline-gray-700 dark:bg-gray-700${
        className ? ` ${className}` : ""
      }`}
    >
      {children}
    </div>
  );
});

/**
 * Main data-grid interface.
 */
export default function DataGrid({
  data,
  CellComponent = DefaultCell,
  startingRow = 1,
  startingCol = 1,
  meta = {},
}: {
  data: DataGridRow[];
  CellComponent?: React.ComponentType<any>;
  startingRow?: number;
  startingCol?: number;
  meta?: Record<string, any>;
}): JSX.Element[] {
  let rowLine = startingRow;
  return data.reduce((acc: JSX.Element[], row) => {
    // Render the cells of a row.
    let colLine = startingCol;
    const childCount = row.children?.length || 1;
    const CellWrapper = row.RowComponent || CellComponent;
    const rowRenders = row.cells.map((cell, index) => {
      // The cell could contain a simple type or a React component.
      let CellRenderer: React.ComponentType<any> | undefined;
      let cellContent: CellSimpleContent | undefined;
      if (typeof cell.content === "function") {
        CellRenderer = cell.content;
      } else {
        cellContent = cell.content as CellSimpleContent;
      }

      // Render a single cell.
      const rowRender = (
        <div
          key={`${row.id}-${cell.id}`}
          style={{
            gridRow: `${rowLine} / ${rowLine + childCount}`,
            gridColumn: `${colLine} / ${colLine + (cell.columns || 1)}`,
          }}
          role={cell.role || "cell"}
        >
          <CellWrapper
            id={row.id}
            cells={row.cells}
            cellIndex={index}
            meta={meta}
          >
            {CellRenderer ? (
              <CellRenderer id={cell.id} source={cell.source} meta={meta} />
            ) : (
              <>{cellContent}</>
            )}
          </CellWrapper>
        </div>
      );
      colLine += cell.columns || 1;
      return rowRender;
    });

    // Render the child rows of the row, if any, recursively.
    const children = row.children ? (
      <DataGrid
        key={`${row.id}-children`}
        data={row.children}
        CellComponent={CellComponent}
        startingRow={rowLine}
        startingCol={colLine}
      />
    ) : null;
    rowLine += childCount;
    return children
      ? acc.concat(rowRenders).concat(children)
      : acc.concat(rowRenders);
  }, []);
}
