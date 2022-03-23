import _ from "lodash";
import React, { Fragment } from "react";

import "./Tombstones.scss";

interface UnlabeledTombstoneProps {
  items: React.ReactNode[];
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
  labels_and_items: [React.ReactNode, React.ReactNode][];
}

const LabeledTombstone = ({ labels_and_items }: LabeledTombstoneProps) => (
  <dl className="col tombstone-data-list">
    {_.map(labels_and_items, ([label, item], ix) => (
      <Fragment key={ix}>
        <div className="row tombstone-data-div">
          <dt className="col-12 col-lg-2">{label}</dt>
          <dd className="col-12 col-lg-10">{item}</dd>
        </div>
      </Fragment>
    ))}
  </dl>
);

export { UnlabeledTombstone, LabeledTombstone };
