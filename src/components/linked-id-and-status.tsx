// node_modules
import Link from "next/link";
import { PropsWithChildren } from "react";
// components
import { Status } from "@/components/status";
// root
import type { DatabaseObject } from "@/globals.d";

/**
 * Display a link to an item's object page along with its abbreviated status.
 * @param {DataBaseObject} item The database object with an @id and status to link to
 * @param {string} [status] The status to display
 * @param {string} [className] Additional classes to apply to the container
 */
export function LinkedIdAndStatus({
  item,
  status = "",
  className = "",
  children,
}: PropsWithChildren<LinkedIdAndStatusProps>) {
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

export type LinkedIdAndStatusProps = {
  item: DatabaseObject;
  status?: string;
  className?: string;
  children: React.ReactNode;
};
