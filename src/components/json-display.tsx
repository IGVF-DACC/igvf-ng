// root
import { type DatabaseObject } from "@/globals.d";

export function JsonDisplay({ object }: { object: DatabaseObject }) {
  console.log("JSON DISPLAY -----");
  return (
    <pre className="border border-black p-2 text-xs">
      {JSON.stringify(object, null, 2)}
    </pre>
  );
}
