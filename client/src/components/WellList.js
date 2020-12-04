import React from "react";

const WellList = ({ elements }) => (
  <div>
    <ul className="list-unstyled">
      {_.chain(elements)
        .map(({ display, href, children }, index) =>
          _.isEmpty(children) ? null : (
            <li key={index} style={{ padding: "0px 20px" }}>
              <div className="well well-sm mrgn-bttm-0">
                {href ? (
                  <a href={href} style={{ color: "white" }}>
                    {display}
                  </a>
                ) : (
                  <span style={{ color: "white" }}>{display}</span>
                )}
              </div>
              <ul className="list-group list-group--withheader">
                {_.map(children, ({ display, href }, ix) => (
                  <li key={ix} className="list-group-item">
                    {href ? (
                      <a href={href}>{display}</a>
                    ) : (
                      <span>{display}</span>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          )
        )
        .value()}
    </ul>
  </div>
);

export { WellList };
