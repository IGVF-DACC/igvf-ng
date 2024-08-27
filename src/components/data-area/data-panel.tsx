// node_modules
import { PropsWithChildren } from "react";

export type DataPanelProps = {
  className?: string;
  children: React.ReactNode;
};

/**
 * Displays a panel, typically to display data items for an object, but you can use this for
 * anything that should appear in a panel on the page.
 * @param {string} [className] Additional Tailwind CSS classes to apply to the panel
 */
export function DataPanel({
  className = "p-4",
  children,
}: PropsWithChildren<DataPanelProps>) {
  return (
    <div
      className={`border border-panel bg-panel @container ${className}`}
      data-testid="datapanel"
    >
      {children}
    </div>
  );
}
