// node_modules
import Link from "next/link";
import { notFound } from "next/navigation";
// components
import AliasList from "@/components/alias-list";
import {
  DataArea,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "@/components/data-area";
// lib
import FetchRequest from "@/lib/fetch-request";
import { type ErrorObject } from "@/lib/fetch-request.d";
import { errorObjectToProps } from "@/lib/errors";
// root
import { type DatabaseObject } from "@/globals.d";

type CrisprModificationObject = DatabaseObject & {
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

  return (
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
  );
}
