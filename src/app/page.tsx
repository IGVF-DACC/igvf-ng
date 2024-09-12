// node_modules
import { DocumentTextIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
// components
import { ChartFileSetRelease } from "@/components/chart-file-set-release";
import { DataAreaTitle, DataPanel } from "@/components/data-area";
import { HomeTitle } from "@/components/home-title";
import { Icon } from "@/components/icon";
// lib
import { buildCookieString } from "@/lib/cookie";
import { FetchRequest } from "../lib/fetch-request";
import { requestDatasetSummary } from "../lib/common-requests";
import { abbreviateNumber } from "../lib/general";
import { convertFileSetsToReleaseData } from "../lib/home";
import { Suspense } from "react";
// root
import { DatabaseObject, SearchResults } from "@/globals";

type StatisticProps = {
  graphic: React.ReactNode;
  label: string;
  value: number;
  query: string;
  colorClass: string;
};

/**
 * Display a statistic panel that shows some property and count of their occurrences in the
 * database.
 * @param {React.ReactNode} graphic React component for an icon to display in the statistic panel
 * @param {string} label Label for the statistic
 * @param {number} value Value for the statistic
 * @param {string} query Statistic box links to search URI with this query
 * @param {string} colorClass Add Tailwind CSS color classes to the statistic box
 */
function Statistic({
  graphic,
  label,
  value,
  query,
  colorClass,
}: StatisticProps) {
  return (
    <div
      className={`my-4 grow basis-1/3 rounded border @xl/home:my-0 ${colorClass}`}
    >
      <Link
        href={`/search/?${query}`}
        className={`flex h-full items-center gap-4 p-2 no-underline`}
      >
        <div className="h-10 w-10 min-w-10 basis-10 rounded-full border border-gray-400 p-2 dark:border-gray-500">
          {graphic}
        </div>
        <div className="shrink">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {label}
          </div>
          <div className="text-4xl font-light text-gray-800 dark:text-gray-200">
            {abbreviateNumber(value)}
          </div>
        </div>
      </Link>
    </div>
  );
}

/**
 * Display the chart of file sets by lab and summary, along with the chart's title.
 * @param {string} title Title for the chart
 */
function FileSetChartSection({
  title = "",
  children,
}: FileSetChartSectionProps) {
  return (
    <section className="relative my-8 hidden @xl/home:block">
      {title && <DataAreaTitle className="text-center">{title}</DataAreaTitle>}
      <DataPanel className="px-0 py-4">{children}</DataPanel>
    </section>
  );
}

type FileSetChartSectionProps = {
  title: string;
  children: React.ReactNode;
};

/**
 * Titles for the two charts on the home page. Used for the chart panel title and the chart aria
 * labels.
 */
const FILESET_RELEASE_TITLE = "Data Sets Released";

type StatisticsSectionProps = {
  fileSets: DatabaseObject[];
  request: FetchRequest;
};

/**
 * Display the statistics section of the home page, including the number of file sets, files, and
 * samples in the database.
 * @param {DatabaseObject[]} fileSets File-set data used for the home-page charts and statistics
 * @param {string} cookie Cookie string for the FetchRequest
 */
async function StatisticsSection({
  fileSets,
  request,
}: StatisticsSectionProps) {
  const fileResponse = (
    await request.getObject("/search/?type=File&limit=0")
  ).optional();
  const sampleResponse = (
    await request.getObject("/search/?type=Sample&limit=0")
  ).optional();

  const fileResults = fileResponse
    ? (fileResponse as unknown as SearchResults)
    : null;
  const sampleResults = sampleResponse
    ? (sampleResponse as unknown as SearchResults)
    : null;

  return (
    <section className="my-4 @xl/home:flex @xl/home:gap-4">
      <Statistic
        graphic={<Icon.FileSet className="fill-sky-600" />}
        label="Data Sets (Measurement Sets)"
        value={fileSets.length}
        query="type=MeasurementSet"
        colorClass="bg-sky-100 dark:bg-sky-900 border-sky-600 hover:bg-sky-200 dark:hover:bg-sky-800"
      />
      <Statistic
        graphic={<DocumentTextIcon className="fill-teal-600" />}
        label="Files"
        value={fileResults?.total || 0}
        query="type=File"
        colorClass="bg-teal-200 dark:bg-teal-900 border-teal-600 hover:bg-teal-300 dark:hover:bg-teal-800"
      />
      <Statistic
        graphic={<Icon.Sample className="fill-yellow-600" />}
        label="Samples"
        value={sampleResults?.total || 0}
        query="type=Sample"
        colorClass="bg-yellow-100 dark:bg-yellow-900 border-yellow-600 hover:bg-yellow-200 dark:hover:bg-yellow-800"
      />
    </section>
  );
}

async function SiteData() {
  const cookie = buildCookieString();
  const request = new FetchRequest({ cookie });
  const results = await requestDatasetSummary(request);
  const fileSets = results["@graph"] || [];
  const releaseData = convertFileSetsToReleaseData(fileSets);

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <StatisticsSection fileSets={fileSets} request={request} />
      </Suspense>
      {releaseData.length >= 2 && (
        <FileSetChartSection title={FILESET_RELEASE_TITLE}>
          <ChartFileSetRelease releaseData={releaseData} />
        </FileSetChartSection>
      )}
    </>
  );
}

export default async function Home() {
  return (
    <div className="@container/home">
      <HomeTitle />
      <p className="my-8">
        The NHGRI is funding this collaborative program that brings together
        teams of investigators who will use state-of-the-art experimental and
        computational approaches to model, predict, characterize and map genome
        function, how genome function shapes phenotype, and how these processes
        are affected by genomic variation. These joint efforts will produce a
        catalog of the impact of genomic variants on genome function and
        phenotypes.
      </p>
      <Suspense fallback={<div>Loading...</div>}>
        <SiteData />
      </Suspense>
    </div>
  );
}
