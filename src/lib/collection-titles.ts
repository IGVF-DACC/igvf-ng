// libs
import { FetchRequest } from "@/lib/fetch-request";
// root
import { DataProviderObject } from "@/globals.d";

/**
 * Loads the mapping of schema name, @type, and collection names to human-readable titles.
 * @param {string} session Authentication session object
 * @returns {Promise<DataProviderObject | null>} Promise that resolves to the /collection-titles/ object
 */
export async function getCollectionTitles(
  dataProviderUrl: string
): Promise<DataProviderObject | null> {
  const request = new FetchRequest();
  return (
    await request.getObjectByUrl(`${dataProviderUrl}/collection-titles/`)
  ).optional();
}
