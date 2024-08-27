// node_modules
import { forwardRef, PropsWithChildren } from "react";

/**
 * Displays a grid of data when given an array specially formatted for this purpose. The displayed
 * grid uses CSS * grid (https://developer.mozilla.org/en-US/docs/Web/CSS/grid). See
 * components/docs/data-grid.md for documentation. As you make changes to this file, please keep
 * the documentation up to date.
 */

/**
 * Simple (usually meaning not a React component) content of a cell in the data grid. This can be
 * a string or number.
 */
export type CellSimpleContent = string | number;

/**
 * Props for RowComponent. This component wraps each cell in a row.
 * @property {string} id Unique identifier for the row
 * @property {DataGridCell[]} cells Cells in the row
 * @property {number} cellIndex Index of the current cell to render in the row
 * @property {Record<string, any>} meta Additional data for the row
 * @property {React.ReactNode} children Children of the row
 */
export type RowComponentProps = {
  id: string;
  cells: DataGridCell[];
  cellIndex: number;
  meta: Record<string, any>;
  children: React.ReactNode;
};

/**
 * Content of a cell in the data grid. This can be a simple string or number, a React component, or
 * a function that returns a React component.
 */
export type CellContent =
  | CellSimpleContent
  | React.ReactNode
  | ((cell: DataGridCell, meta: Record<string, any>) => React.ReactNode);

/**
 * Represents a cell within a row in the data grid.
 * @property {string} id Unique identifier for the cell
 * @property {CellContent} content Displayable content of the cell
 * @property {number} [columns] Number of columns the cell spans
 * @property {string} [role] ARIA role of the cell in the grid
  // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles
 * @property {object} [source] Source object for the cell
 */
export interface DataGridCell {
  id: string;
  content: CellContent;
  columns?: number;
  role?: string;
  source?: object;
}

/**
 * Represents a row in the data grid.
 * @property {string} id Unique identifier for the row
 * @property {DataGridCell[]} cells Cells in the row
 * @property {DataGridRow[]} [children] Rows nested within this row
 * @property {React.ComponentType} [RowComponent] Component for rendering just this row, overriding
 */
export interface DataGridRow {
  id: string;
  cells: DataGridCell[];
  children?: DataGridRow[];
  RowComponent?: React.ComponentType<RowComponentProps>;
}

/**
 * Default data grid cell. Custom data grid cells can wrap or replace this.
 */
function DefaultCell({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full w-full bg-white p-2">{children}</div>;
}

/**
 * Surround the DataGrid component with this wrapper component, or a custom one like it.
 */
export const DataGridContainer = forwardRef(function DataGridContainer(
  { className = "", children }: PropsWithChildren<DataGridContainerProps>,
  ref: React.Ref<HTMLDivElement>
) {
  return (
    <div
      ref={ref}
      role="table"
      className={`border-1 grid w-full gap-px overflow-x-auto border border-panel bg-gray-300 text-sm ${
        className || ""
      }`}
    >
      {children}
    </div>
  );
});

type DataGridContainerProps = {
  className?: string;
  children: React.ReactNode;
};

/**
 * Main data-grid component. It uses `data` using the format described above to render a grid of
 * data.
 * @param {DataGridRow[]} props.data The data to render in the grid
 * @param {React.ComponentType} [props.CellComponent] The component to use for each cell
 * @param {number} [props.startingRow] The row to start rendering at
 * @param {number} [props.startingCol] The column to start rendering at
 * @param {Record<string, any>} [props.meta] Additional data to pass to the grid
 */
export function DataGrid({
  data,
  CellComponent = DefaultCell,
  startingRow = 1,
  startingCol = 1,
  meta = {},
}: DataGridProps) {
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

export type DataGridProps = {
  data: DataGridRow[];
  CellComponent?: React.ComponentType<any>;
  startingRow?: number;
  startingCol?: number;
  meta?: Record<string, any>;
};
