// node_modules
import { PropsWithChildren } from "react";

/**
 * Display the label of a data item label/value pair.
 * @param {string} [className] Additional Tailwind CSS classes to apply to the label div element
 */
export function DataItemLabel({
  className = "",
  children,
}: PropsWithChildren<DataPanelProps>) {
  return (
    <div
      className={`text-data-label mt-4 break-words font-semibold first:mt-0 @md:mt-0 dark:text-gray-400 ${className}`}
      data-testid="dataitemlabel"
    >
      {children}
    </div>
  );
}

type DataPanelProps = {
  className?: string;
  children: React.ReactNode;
};

/**
 * Display the value of a data item label/value pair.
 * @param {string} [className] Additional Tailwind CSS classes to apply to the value div element.
 */
export function DataItemValue({
  className = "",
  children,
}: PropsWithChildren<DataItemValueProps>) {
  return (
    <div
      className={`text-data-value mb-4 font-medium last:mb-0 @md:mb-0 @md:min-w-0 ${className}`}
      data-testid="dataitemvalue"
    >
      {children}
    </div>
  );
}

type DataItemValueProps = {
  className?: string;
  children: React.ReactNode;
};

/**
 * Display the value of a data item that consists of a URL. This will break the URL at any
 * character so it doesn't overflow the data panel.
 * @param {string} [className] Additional Tailwind CSS classes to apply to the value <div>
 *    element
 */
export function DataItemValueUrl({
  className = "",
  children,
}: PropsWithChildren<DataItemValueUrlProps>) {
  return (
    <DataItemValue className={`break-all ${className}`}>
      {children}
    </DataItemValue>
  );
}

type DataItemValueUrlProps = {
  className?: string;
  children: React.ReactNode;
};
