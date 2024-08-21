// root
import { type DatabaseObject } from "@/globals.d";

export function JsonDisplay({
  object,
  isVisible,
}: {
  object: DatabaseObject;
  isVisible: boolean;
}) {
  console.log("JSON DISPLAY *****", isVisible);
  if (isVisible) {
    return (
      <pre className="border border-black p-2 text-xs">
        {JSON.stringify(object, null, 2)}
      </pre>
    );
  }
}
