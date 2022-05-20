// node_modules
import PropTypes from "prop-types"
// components
import Breadcrumbs from "../../components/breadcrumbs"
import {
  Collection,
  CollectionCount,
  CollectionItem,
  CollectionItemName,
} from "../../components/collection"
import NoCollectionData from "../../components/no-collection-data"
import PagePreamble from "../../components/page-preamble"
// libs
import buildBreadcrumbs from "../../libs/breadcrumbs"
import Request from "../../libs/request"

const TechnicalSampleList = ({ technicalSamples }) => {
  return (
    <>
      <Breadcrumbs />
      <PagePreamble />
      <Collection>
        {technicalSamples.length > 0 ? (
          <>
            <CollectionCount count={technicalSamples.length} />
            {technicalSamples.map((sample) => (
              <CollectionItem
                key={sample.uuid}
                href={sample["@id"]}
                label={`Technical Sample ${sample.title}`}
                status={sample.status}
              >
                <CollectionItemName>
                  {sample.accession} &mdash; {sample.sample_material}
                </CollectionItemName>
                {sample.additional_description && (
                  <div>{sample.additional_description}</div>
                )}
              </CollectionItem>
            ))}
          </>
        ) : (
          <NoCollectionData />
        )}
      </Collection>
    </>
  )
}

TechnicalSampleList.propTypes = {
  // Technical samples to display in the list
  technicalSamples: PropTypes.array.isRequired,
}

export default TechnicalSampleList

export const getServerSideProps = async ({ req }) => {
  const request = new Request(req?.headers?.cookie)
  const technicalSamples = await request.getCollection("technical-samples")
  const breadcrumbs = await buildBreadcrumbs(technicalSamples, "title")
  return {
    props: {
      technicalSamples: technicalSamples["@graph"],
      pageContext: { title: technicalSamples.title },
      breadcrumbs,
      sessionCookie: req?.headers?.cookie,
    },
  }
}
