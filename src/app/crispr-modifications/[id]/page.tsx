// node_modules
import { notFound } from "next/navigation";
// lib
import FetchRequest from "@/lib/fetch-request";
import { type ErrorObject } from "@/lib/fetch-request.d";
import { errorObjectToProps } from "@/lib/errors";
// root
import { type DatabaseObject } from "@/globals.d";

/**
 * Fetch a modification object from the database.
 * @param id uuid of the modification object to fetch
 * @returns the modification object or null if not found
 */
async function fetchObject(id: string): Promise<DatabaseObject | null> {
  const request = new FetchRequest();
  const modification = (
    await request.getObject(`/crispr-modifications/${id}/`)
  ).union() as DatabaseObject | ErrorObject;
  if (FetchRequest.isResponseSuccess(modification)) {
    return modification as DatabaseObject;
  }
  return null;
}

/**
 * Display a CRISPR modification object page.
 */
export default async function CrisprModification({
  params,
}: {
  params: { id: string };
}): Promise<JSX.Element> {
  const modification = await fetchObject(params.id);
  if (!modification) {
    notFound();
  }

  const modificationObject = modification as DatabaseObject;
  return <h1>CRISPR Modification {modificationObject.uuid}</h1>;
}
