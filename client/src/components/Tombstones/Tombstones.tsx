import _ from "lodash";
import React, { Fragment } from "react";

import "./Tombstones.scss";

interface UnlabeledTombstoneProps {
  items: (string | React.ReactNode)[];
}

const UnlabeledTombstone = ({ items }: UnlabeledTombstoneProps) => (
  <table className="tombstone-table">
    <tbody>
      {_.map(items, (item, ix) => (
        <tr key={ix}>
          <td>{item}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

interface LabeledTombstoneProps {
  labels_and_items: [
    string | React.ReactNode,
    string | string[] | React.ReactNode
  ][];
}

const LabeledTombstone = ({ labels_and_items }: LabeledTombstoneProps) => (
  <dl className="row tombstone-data-list">
    {_.map(labels_and_items, ([label, item], ix) => (
      <Fragment key={ix}>
        <dt className="col-12 col-lg-2">{label}</dt>
        <dd className="col-12 col-lg-10">{item}</dd>
        {ix !== _.size(labels_and_items) - 1 && (
          <hr style={{ width: "100%" }} />
        )}
      </Fragment>
    ))}
  </dl>
);

export { UnlabeledTombstone, LabeledTombstone };
