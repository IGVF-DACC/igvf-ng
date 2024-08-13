/**
 * Wrapper for an area containing data items, setting up a grid to display labels on the left and
 * their values to their right on desktop. You only need this to wrap these kinds of data items.
 * Any display not comprising labels and their values can appear outside a <DataAre>.
 */
export function DataArea({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="@md:grid @md:grid-cols-data-item @md:gap-4"
      data-testid="dataarea"
    >
      {children}
    </div>
  );
}

/**
 * Displays the title above a data panel or table.
 * @property {string} className - Additional Tailwind CSS classes to apply to the title <h2> element
 */
export function DataAreaTitle({
  className = "flex items-end justify-between",
  children,
}: {
  // Additional Tailwind CSS classes to apply to the <h2> element
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      className={`mb-1 mt-4 text-2xl font-light ${className}`}
      data-testid="dataareatitle"
    >
      {children}
    </h2>
  );
}
