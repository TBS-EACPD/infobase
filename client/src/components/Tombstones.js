import _ from "lodash";
import React, { Fragment } from "react";


import "./Tombstones.scss";

const UnlabeledTombstone = ({ items }) => (
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

const LabeledTombstone = ({ labels_and_items }) => (
  <dl className="dl-horizontal tombstone-data-list">
    {_.map(labels_and_items, ([label, item], ix) => (
      <Fragment key={ix}>
        <dt>{label}</dt>
        <dd>{item}</dd>
      </Fragment>
    ))}
  </dl>
);

export { UnlabeledTombstone, LabeledTombstone };
