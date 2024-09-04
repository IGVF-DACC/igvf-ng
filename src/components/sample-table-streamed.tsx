// components
import { SampleTable } from "@/components/sample-table";
// lib
import { requestBiosamples } from "@/lib/common-requests";
import { FetchRequest } from "@/lib/fetch-request";
// root
import { DatabaseObject } from "@/globals.d";

export async function SampleTableStreamed({
  samplePaths,
}: {
  samplePaths: string[];
}) {
  const request = new FetchRequest();
  const samples = (await requestBiosamples(
    samplePaths,
    request
  )) as unknown as DatabaseObject[];

  return <SampleTable samples={samples} />;
}
