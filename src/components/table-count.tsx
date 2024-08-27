/**
 * Displays the number of items in a collection above the list or table views.
 * @property {number} count The number of items in the collection.
 */
export function TableCount({ count }: TableCountProps) {
  if (count > 0) {
    return (
      <div
        data-testid="search-results-count"
        className="border-l border-r border-t border-panel bg-gray-300 py-1 text-center text-xs dark:bg-gray-700"
      >
        {count} {count === 1 ? "item" : "items"}
      </div>
    );
  }
}

export type TableCountProps = {
  count: number;
};
