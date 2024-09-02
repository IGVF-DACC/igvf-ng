"use client";

// node_modules
import _ from "lodash";
import Link from "next/link";
// components
import { LinkedIdAndStatus } from "@/components/linked-id-and-status";
import { SeparatedList } from "@/components/separated-list";
import {
  SortableGrid,
  type SortableGridColumn,
  type DisplayComponentProp,
} from "@/components/sortable-grid";
// root
import { DatabaseObject } from "@/globals.d";

/**
 * Columns for samples
 */
const sampleColumns: SortableGridColumn[] = [
  {
    id: "accession",
    title: "Accession",
    display: ({ source }: DisplayComponentProp) => (
      <LinkedIdAndStatus item={source}>{source.accession}</LinkedIdAndStatus>
    ),
  },
  {
    id: "type",
    title: "Type",
    display: ({ source }: DisplayComponentProp) => {
      // Map the first @type to a human-readable collection title if available.
      const sourceType = source["@type"][0];
      return <>{sourceType}</>;
    },
  },
  {
    id: "sample_terms",
    title: "Sample Terms",
    display: ({ source }: DisplayComponentProp) => {
      const sampleTerms = (source.sample_terms as DatabaseObject[]) || [];
      if (sampleTerms.length > 0) {
        const sortedTerms = _.sortBy(sampleTerms, (term) =>
          (term.term_name as string).toLowerCase()
        );
        return (
          <SeparatedList>
            {sortedTerms.map((terms) => (
              <Link href={terms["@id"]!} key={terms["@id"]}>
                <>{terms.term_name}</>
              </Link>
            ))}
          </SeparatedList>
        );
      }
      return null;
    },
  },
  {
    id: "disease_terms",
    title: "Disease Terms",
    display: ({ source }: DisplayComponentProp) => {
      const diseaseTerms = (source.disease_terms as DatabaseObject[]) || [];
      if (diseaseTerms.length > 0) {
        const sortedTerms = _.sortBy(diseaseTerms, (disease) =>
          (disease.term_name as string).toLowerCase()
        );
        return (
          <SeparatedList>
            {sortedTerms.map((term) => (
              <Link href={term["@id"]!} key={term["@id"]}>
                <>{term.term_name}</>
              </Link>
            ))}
          </SeparatedList>
        );
      }
      return null;
    },
  },
  {
    id: "summary",
    title: "Summary",
  },
];

/**
 * Display a sortable table of the given sample objects. These objects must already be in memory.
 * @param {DatabaseObject[]} samples The sample objects to display in the table
 */
export function SampleTable({ samples }: SampleTableProps) {
  return <SortableGrid data={samples} columns={sampleColumns} keyProp="@id" />;
}

export type SampleTableProps = {
  samples: DatabaseObject[];
};
