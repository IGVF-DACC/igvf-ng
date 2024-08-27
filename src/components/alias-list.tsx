/**
 * Display the given aliases as a list, suitable for a value in a DataArea.
 * @param {string[]} aliases The list of aliases to display
 * @param {string} [className] Additional Tailwind CSS classes to apply to the list
 */
export function AliasList({ aliases, className = "" }: AliasListProps) {
  return (
    <div className={className}>
      {aliases.map((alias) => (
        <div key={alias} className="my-2 break-all first:mt-0 last:mb-0">
          {alias}
        </div>
      ))}
    </div>
  );
}

type AliasListProps = {
  aliases: string[];
  className?: string;
};
