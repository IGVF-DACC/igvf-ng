// node_modules
import { TableCellsIcon } from "@heroicons/react/20/solid";
import _ from "lodash";
import Link from "next/link";
import PropTypes from "prop-types";
import { useContext } from "react";
// components
import { DataAreaTitle } from "@/components/data-area";
import { SampleTable } from "@/components/sample-table";
// lib
import { requestBiosamples } from "@/lib/common-requests";
import FetchRequest from "@/lib/fetch-request";
// types
import type { DatabaseObject } from "@/globals.d";
import React, { Suspense } from "react";

type SampleTableProps = {
  samples: string[];
  title?: string;
};

/**
 * Display a sortable table of the given sample objects.
 */
export default async function SampleTableStreamed({
  samples,
  title = "Samples",
}: SampleTableProps) {
  const request = new FetchRequest();
  const displayData = (await requestBiosamples(
    samples,
    request
  )) as unknown as DatabaseObject[];

  console.log("SAMPLE TABLE STREAMED ------------------------------------");
  return (
    <>
      <DataAreaTitle>{title}</DataAreaTitle>
      <SampleTable samples={displayData} />
    </>
  );
}
