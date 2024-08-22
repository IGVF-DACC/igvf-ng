import { notFound } from "next/navigation";
// components
import AliasList from "@/components/alias-list";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "@/components/data-area";
import SampleTableStreamed from "@/components/sample-table-streamed";
import { ObjectJson } from "@/components/object-json";
import { ObjectJsonStatic } from "@/components/object-json-static";
import { JsonDisplay } from "@/components/json-display";
// lib
import FetchRequest from "@/lib/fetch-request";
import { type ErrorObject } from "@/lib/fetch-request";
// root
import { type DatabaseObject } from "@/globals.d";
import { Suspense } from "react";

type CrisprModificationObject = DatabaseObject & {
  biosamples_modified: string[];
  cas: string;
  cas_species: string;
  description?: string;
  fused_domain?: string;
  lot_id?: string;
  modality: string;
  product_id?: string;
  sources?: string[];
  tagged_protein?: string;
};

/**
 * Fetch a modification object from the database.
 * @param id uuid of the modification object to fetch
 * @returns the modification object or null if not found
 */
async function fetchObject(
  id: string
): Promise<CrisprModificationObject | void> {
  const request = new FetchRequest();
  const modification = (
    await request.getObject(`/crispr-modifications/${id}/`)
  ).union() as DatabaseObject | ErrorObject;
  if (FetchRequest.isResponseSuccess(modification)) {
    return modification as CrisprModificationObject;
  }
  if (!modification) {
    notFound();
  }
}

/**
 * Display a CRISPR modification object page.
 */
export default async function CrisprModification({
  params,
}: {
  params: { id: string };
}): Promise<JSX.Element> {
  const modification = (await fetchObject(
    params.id
  )) as CrisprModificationObject;

  console.log("OBJECT PAGE ------------------------------------");
  return (
    <>
      <DataPanel>
        <DataArea>
          <DataItemLabel>Modality</DataItemLabel>
          <DataItemValue>{modification.modality}</DataItemValue>
          <DataItemLabel>Cas</DataItemLabel>
          <DataItemValue>{modification.cas}</DataItemValue>
          <DataItemLabel>Cas Species</DataItemLabel>
          <DataItemValue>{modification.cas_species}</DataItemValue>
          {modification.fused_domain && (
            <>
              <DataItemLabel>Fused Domain</DataItemLabel>
              <DataItemValue>{modification.fused_domain}</DataItemValue>
            </>
          )}
          {modification.description && (
            <>
              <DataItemLabel>Description</DataItemLabel>
              <DataItemValue>{modification.description}</DataItemValue>
            </>
          )}
          {(modification.aliases?.length ?? 0 > 0) && (
            <>
              <DataItemLabel>Aliases</DataItemLabel>
              <DataItemValue>
                <AliasList aliases={modification.aliases!} />
              </DataItemValue>
            </>
          )}
          <DataItemLabel>Summary</DataItemLabel>
          <DataItemValue>{modification.summary}</DataItemValue>
        </DataArea>
        {/* <ObjectJson object={modification} /> */}
        {/* <ObjectJsonStatic object={modification}>
          <JsonDisplay object={modification} />
        </ObjectJsonStatic> */}
      </DataPanel>
      {modification.biosamples_modified.length > 0 && (
        <Suspense fallback={<div>Loading...</div>}>
          <SampleTableStreamed samples={modification.biosamples_modified} />
        </Suspense>
      )}
    </>
  );
}
