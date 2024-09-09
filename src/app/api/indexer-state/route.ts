// lib
import { FetchRequest } from "@/lib/fetch-request";
// types
import type { ErrorObject } from "@/lib/fetch-request";

/**
 * Reflects the data returned by the data provider's /indexer-info endpoint.
 */
type IndexerInfo = {
  invalidation_queue: {
    ApproximateNumberOfMessages: number;
    ApproximateNumberOfMessagesDelayed: number;
    ApproximateNumberOfMessagesNotVisible: number;
  };
  is_indexing: boolean;
  transaction_queue: {
    ApproximateNumberOfMessages: number;
    ApproximateNumberOfMessagesDelayed: number;
    ApproximateNumberOfMessagesNotVisible: number;
  };
};

/**
 * The indexer state returned by this API endpoint.
 */
export type IndexerState = {
  // True if the data provider is currently indexing.
  isIndexing: boolean;
  // The number of transactions remaining in the indexer's invalidation queue.
  indexingCount: number;
};

/**
 * This endpoint is used to determine if the indexer is currently indexing and how many
 * transactions are remaining in the invalidation queue. Request the indexer state from the data
 * provider. Convert this to the simplified `IndexerState` format.
 */
export async function GET() {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return new Response("{}", {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const request = new FetchRequest();
  const response = (await request.getObject(`/indexer-info`)).union();
  if (response.isError) {
    throw new Error((response as ErrorObject).description);
  } else {
    const stateFromDataProvider = response as IndexerInfo;
    const state: IndexerState = {
      isIndexing: stateFromDataProvider.is_indexing,
      indexingCount:
        stateFromDataProvider.invalidation_queue.ApproximateNumberOfMessages,
    };

    // Convert to a Response object
    return new Response(JSON.stringify(state), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
