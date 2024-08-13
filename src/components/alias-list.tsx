/**
 * Display the given aliases as a list, suitable for a value in a <DataArea>.
 */
export default function AliasList({
  aliases,
  className = "",
}: {
  aliases: string[];
  className?: string;
}) {
  return (
    <div>
      {aliases.map((alias) => (
        <div key={alias} className="my-2 break-all first:mt-0 last:mb-0">
          {alias}
        </div>
      ))}
    </div>
  );
}
