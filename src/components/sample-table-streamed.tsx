// components
import { DataAreaTitle } from "@/components/data-area";
import { SampleTable } from "@/components/sample-table";
// lib
import { requestBiosamples } from "@/lib/common-requests";
import { FetchRequest } from "@/lib/fetch-request";
// types
import type { DatabaseObject } from "@/globals.d";

/**
 * Display a sortable table of the given sample objects.
 * @param {string[]} samples Paths to the sample objects to display in the table
 * @param {string} [title] The title to display above the table
 */
export async function SampleTableStreamed({
  samples,
  title = "Samples",
}: SampleTableProps) {
  const request = new FetchRequest();
  const displayData = (await requestBiosamples(
    samples,
    request
  )) as unknown as DatabaseObject[];

  return (
    <>
      <DataAreaTitle>{title}</DataAreaTitle>
      <SampleTable samples={displayData} />
    </>
  );
}

export type SampleTableProps = {
  samples: string[];
  title?: string;
};
