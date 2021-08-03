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
  <div>
    {_.map(labels_and_items, ([label, item], ix) => (
      <Fragment key={ix}>
        <dl className="row tombstone-data-list">
          <dt className="col-12 col-lg-2">{label}</dt>
          <dd className="col-12 col-lg-10">{item}</dd>
        </dl>
        {ix !== _.size(labels_and_items) - 1 && (
          <hr style={{ width: "100%" }} />
        )}
      </Fragment>
    ))}
  </div>
);

export { UnlabeledTombstone, LabeledTombstone };
