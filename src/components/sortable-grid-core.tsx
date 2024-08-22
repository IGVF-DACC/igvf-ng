"use client";

// root
import { DatabaseObject } from "@/globals.d";

export function SortableGridCore({
  displayData,
}: {
  displayData: DatabaseObject[];
}) {
  console.log("TABLE RENDER ************************************");
  return (
    <table>
      {displayData.length > 0 && (
        <tbody>
          {displayData.map((item, index) => (
            <tr
              key={item["@id"]}
              className="[&>td]:border [&>td]:border-black [&>td]:p-1"
            >
              <td>{index}.</td>
              <td>{item["@id"]}</td>
              <td>{item.accession}</td>
              <td>{(item.award as DatabaseObject)["@id"]}</td>
              <td>
                {(item.donors as string[])?.length > 0
                  ? (item.donors as string[]).join(", ")
                  : ""}
              </td>
              <td>{(item.modifications as DatabaseObject[])[0]["@id"]}</td>
              <td>{(item.sample_terms as DatabaseObject[])[0]["@id"]}</td>
              <td>{(item.sources as DatabaseObject[])[0]["@id"]}</td>
              <td>{item.release_timestamp}</td>
              <td>{item.status}</td>
            </tr>
          ))}
        </tbody>
      )}
    </table>
  );
}
