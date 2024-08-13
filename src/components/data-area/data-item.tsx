/**
 * Display the label of a data item label/value pair.
 * @property {string} className - Additional Tailwind CSS classes to apply to the label <div> element
 */
export function DataItemLabel({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`text-data-label @md:mt-0 mt-4 break-words font-semibold first:mt-0 dark:text-gray-400 ${className}`}
      data-testid="dataitemlabel"
    >
      {children}
    </div>
  );
}

/**
 * Display the value of a data item label/value pair.
 * @property {string} className - Additional Tailwind CSS classes to apply to the value <div> element
 */
export function DataItemValue({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`text-data-value @md:mb-0 @md:min-w-0 mb-4 font-medium last:mb-0 ${className}`}
      data-testid="dataitemvalue"
    >
      {children}
    </div>
  );
}

/**
 * Display the value of a data item that consists of a URL. This will break the URL at any
 * character so it doesn't overflow the data panel.
 * @property {string} className - Additional Tailwind CSS classes to apply to the value <div> element
 */
export function DataItemValueUrl({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <DataItemValue className={`break-all ${className}`}>
      {children}
    </DataItemValue>
  );
}
