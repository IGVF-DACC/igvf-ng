/**
 * Displays a panel -- typically to display data items for an object, but you can use this for
 * anything that should appear in a panel on the page.
 * @property {string} className - Additional Tailwind CSS classes to apply to the wrapper <div>
 */
export function DataPanel({
  className = "p-4",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`border-panel bg-panel @container border ${className}`}
      data-testid="datapanel"
    >
      {children}
    </div>
  );
}
