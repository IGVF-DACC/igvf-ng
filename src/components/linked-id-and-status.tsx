// node_modules
import Link from "next/link";
// components
import Status from "./status";
// types
import type { DatabaseObject } from "@/globals.d";

/**
 * Display a link to an item's summary page along with its abbreviated status.
 */
export default function LinkedIdAndStatus({
  item,
  status = "",
  className = "",
  children,
}: {
  item: DatabaseObject;
  status?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <div className="flex items-center gap-1">
        <Link href={item["@id"]!} className="block">
          {children}
        </Link>
        <Status status={status || item.status!} isAbbreviated />
      </div>
    </div>
  );
}
