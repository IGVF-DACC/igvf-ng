// node_modules
import { PropsWithChildren } from "react";

/**
 * Wrapper for an area containing data items, setting up a grid to display labels on the left and
 * their values to their right on desktop. You only need this to wrap these kinds of data items.
 * Any display not comprising labels and their values can appear outside a <DataAre>.
 */
export function DataArea({ children }: PropsWithChildren<DataAreaProps>) {
  return (
    <div
      className="@md:grid @md:grid-cols-data-item @md:gap-4"
      data-testid="dataarea"
    >
      {children}
    </div>
  );
}

type DataAreaProps = {
  children: React.ReactNode;
};

/**
 * Wraps the title above a data panel or table in standard CSS.
 * @param {string} [className] Additional Tailwind CSS classes to apply to the title h2 element
 */
export function DataAreaTitle({
  className = "flex items-end justify-between",
  children,
}: PropsWithChildren<DataAreaTitleProps>) {
  return (
    <h2
      className={`mb-1 mt-4 text-2xl font-light ${className}`}
      data-testid="dataareatitle"
    >
      {children}
    </h2>
  );
}

type DataAreaTitleProps = {
  className?: string;
  children: React.ReactNode;
};
