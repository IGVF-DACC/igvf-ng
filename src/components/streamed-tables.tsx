// node_modules
import { Suspense } from "react";
// components
import { SampleTableClient } from "@/components/sample-table";
// lib
import { requestBiosamples } from "@/lib/common-requests";
import { FetchRequest } from "@/lib/fetch-request";
// root
import { DatabaseObject } from "@/globals.d";

/**
 * Given their paths, fetch samples from the database and display them in a table.
 * @param {string[]} samplePaths The paths to the samples to display
 */
async function SampleTableRetriever({
  samplePaths,
}: SampleTableRetrieverProps) {
  const request = new FetchRequest();
  const samples = (await requestBiosamples(
    samplePaths,
    request
  )) as unknown as DatabaseObject[];

  return <SampleTableClient samples={samples} />;
}

type SampleTableRetrieverProps = {
  samplePaths: string[];
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
