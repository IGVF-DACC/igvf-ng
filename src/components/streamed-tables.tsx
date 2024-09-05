// node_modules
import { Suspense } from "react";
// components
import { DataAreaTitle } from "@/components/data-area";
import { SampleTableClient } from "@/components/sample-table";
// lib
import { requestBiosamples } from "@/lib/common-requests";
import { FetchRequest } from "@/lib/fetch-request";
// root
import { DatabaseObject } from "@/globals.d";

/**
 * Given their paths, fetch samples from the database and display them in a table.
 * @param {string[]} samplePaths The paths to the samples to display
 * @param {string} [title] The title of the table
 */
async function SampleTableRetriever({
  samplePaths,
  title = "Samples",
}: SampleTableRetrieverProps) {
  const request = new FetchRequest();
  const samples = (await requestBiosamples(
    samplePaths,
    request
  )) as unknown as DatabaseObject[];

  return (
    <>
      <DataAreaTitle>{title}</DataAreaTitle>
      <SampleTableClient samples={samples} />
    </>
  );
}

type SampleTableRetrieverProps = {
  samplePaths: string[];
  title?: string;
};

/**
 * Display a table of samples given paths to those samples.
 * @param {string[]} samplePaths The paths to the samples to display
 */
export function SampleTable({ samplePaths }: SampleTableProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SampleTableRetriever samplePaths={samplePaths} />
    </Suspense>
  );
}

type SampleTableProps = {
  samplePaths: string[];
};
