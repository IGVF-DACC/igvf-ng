// node_modules
import PropTypes from "prop-types";
// components
import Breadcrumbs from "../../components/breadcrumbs";
import {
  Collection,
  CollectionContent,
  CollectionData,
  CollectionHeader,
  CollectionItem,
  CollectionItemName,
} from "../../components/collection";
import NoCollectionData from "../../components/no-collection-data";
import PagePreamble from "../../components/page-preamble";
// lib
import buildBreadcrumbs from "../../lib/breadcrumbs";
import errorObjectToProps from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";

const DifferentiatedCellList = ({ differentiatedCells }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <Collection>
        {differentiatedCells.length > 0 ? (
          <>
            <CollectionHeader count={differentiatedCells.length} />
            <CollectionContent collection={differentiatedCells}>
              {differentiatedCells.map((differentiatedCell) => {
                const termName = differentiatedCell.biosample_term?.term_name;
                return (
                  <CollectionItem
                    key={differentiatedCell.uuid}
                    testid={differentiatedCell.uuid}
                    href={differentiatedCell["@id"]}
                    label={`Differentiated Cell ${differentiatedCell.accession}`}
                    status={differentiatedCell.status}
                  >
                    <CollectionItemName>
                      {`${termName ? `${termName} — ` : ""}${
                        differentiatedCell.accession
                      }`}
                    </CollectionItemName>
                    <CollectionData>
                      <div>{differentiatedCell.taxa}</div>
                    </CollectionData>
                  </CollectionItem>
                );
              })}
            </CollectionContent>
          </>
        ) : (
          <NoCollectionData />
        )}
      </Collection>
    </>
  );
};

DifferentiatedCellList.propTypes = {
  // Differentiated cells list to display
  differentiatedCells: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default DifferentiatedCellList;

export const getServerSideProps = async ({ req }) => {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const differentiatedCells = await request.getCollection(
    "differentiated-cells"
  );
  if (FetchRequest.isResponseSuccess(differentiatedCells)) {
    await request.getAndEmbedCollectionObjects(
      differentiatedCells["@graph"],
      "biosample_term"
    );
    const breadcrumbs = await buildBreadcrumbs(differentiatedCells, "title");
    return {
      props: {
        differentiatedCells: differentiatedCells["@graph"],
        pageContext: { title: differentiatedCells.title },
        breadcrumbs,
      },
    };
  }
  return errorObjectToProps(differentiatedCells);
};
