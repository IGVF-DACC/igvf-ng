import { notFound } from "next/navigation";
// components
import { AliasList } from "@/components/alias-list";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "@/components/data-area";
import { SampleTable } from "@/components/sample-table";
// lib
import { requestSamples } from "@/lib/common-requests";
import { FetchRequest, type ErrorObject } from "@/lib/fetch-request";
// root
import { type DatabaseObject } from "@/globals.d";

export interface CrisprModificationObject extends DatabaseObject {
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
}

/**
 * Fetch a modification object from the database.
 * @param {string} id uuid of the modification object to fetch
 * @returns {Promise<CrisprModificationObject>} The modification object
 */
async function fetchPageObject(id: string): Promise<CrisprModificationObject> {
  const request = new FetchRequest();
  const requestedObject = (
    await request.getObject(`/crispr-modifications/${id}/`)
  ).union() as DatabaseObject | ErrorObject;
  if (FetchRequest.isResponseSuccess(requestedObject)) {
    return requestedObject as CrisprModificationObject;
  }
  if (!requestedObject) {
    notFound();
  }
  return {} as CrisprModificationObject;
}

/**
 * Fetch the biosamples modified by a modification object.
 * @param {CrisprModificationObject} modification Modification object to get biosamples from
 * @returns {Promise<DatabaseObject[]>} The biosamples modified by the modification object
 */
async function fetchBiosamplesModified(
  modification: CrisprModificationObject
): Promise<DatabaseObject[]> {
  if (modification.biosamples_modified.length > 0) {
    const request = new FetchRequest();
    return requestSamples(modification.biosamples_modified, request);
  }
  return [];
}

/**
 * Display a CRISPR modification object page.
 * @param {string} params.id The uuid of the modification object
 */
export default async function CrisprModification({
  params,
}: CrisprModificationProps) {
  const modification = await fetchPageObject(params.id);
  const biosamplesModified = await fetchBiosamplesModified(modification);

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
      </DataPanel>
      {biosamplesModified.length > 0 && (
        <SampleTable samples={biosamplesModified} />
      )}
    </>
  );
}

type CrisprModificationProps = {
  params: { id: string };
};
