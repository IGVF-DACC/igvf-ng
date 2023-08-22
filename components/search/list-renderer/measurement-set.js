// node_modules
import PropTypes from "prop-types";
// components/search/list-renderer
import {
  SearchListItemContent,
  SearchListItemMain,
  SearchListItemMeta,
  SearchListItemQuality,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";

export default function MeasurementSet({ item: measurementSet }) {
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={measurementSet} />
          {measurementSet.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>
          {measurementSet.assay_term.term_name}
        </SearchListItemTitle>
        <SearchListItemMeta>
          <div key="lab">{measurementSet.lab.title}</div>
          {measurementSet.summary && (
            <div key="summary">{measurementSet.summary}</div>
          )}
          {measurementSet.alternate_accessions?.length > 0 && (
            <div key="alternate_accessions">
              Alternate Accessions:{" "}
              {measurementSet.alternate_accessions.join(", ")}
            </div>
          )}
        </SearchListItemMeta>
      </SearchListItemMain>
      <SearchListItemQuality item={measurementSet} />
    </SearchListItemContent>
  );
}

MeasurementSet.propTypes = {
  // Single measurement set search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
