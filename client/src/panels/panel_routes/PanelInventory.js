import _ from "lodash";
import React from "react";
import { Link } from "react-router-dom";
import { createSelector } from "reselect";

import { get_panels_for_subject } from "src/panels/get_panels_for_subject/index";
import { PanelRegistry } from "src/panels/PanelRegistry";
import { PanelRenderer } from "src/panels/PanelRenderer";

import { LeafSpinner } from "src/components/index";

import { Dept, Program, Gov, CRSO, ProgramTag } from "src/models/subjects";

import { create_text_maker } from "src/models/text";

import { ensure_loaded } from "src/core/ensure_loaded";
import { StandardRouteContainer } from "src/core/NavComponents";

import { EverythingSearch } from "src/search/EverythingSearch";

import panel_text from "./PanelInventory.yaml";

const tm = create_text_maker(panel_text);

function url_template(subject, panel) {
  return `/panel-inventory/${subject.subject_type}/${panel.key}/${subject.id}`;
}

const defaultSubjectKeys = {
  dept: "1",
  program: "AGR-AAA00", //business risk management
  tag: "GOC001",
  crso: "TBC-BXA00",
};

const getSubj = (subject_type, id) => {
  let subject;
  switch (subject_type) {
    case "dept":
      subject = Dept.store.has(id)
        ? Dept.store.lookup(id)
        : Dept.store.lookup(defaultSubjectKeys.dept);
      break;
    case "tag":
      subject = ProgramTag.store.has(id)
        ? ProgramTag.store.lookup(id)
        : ProgramTag.store.lookup(defaultSubjectKeys.tag);
      break;
    case "program":
      subject = Program.store.has(id)
        ? Program.store.lookup(id)
        : Program.store.lookup(defaultSubjectKeys.program);
      break;
    case "crso":
      subject = CRSO.store.has(id)
        ? CRSO.store.lookup(id)
        : CRSO.store.lookup(defaultSubjectKeys.crso);
      break;
    default:
      subject = Gov;
  }
  return subject;
};

// Bring back footnotes inventory ??
// const link_to_footnotes = ( panel_key, subject_type) => `#footnotes/panel/${panel_key}/${subject_type}`;

function panels_of_interest(panel) {
  const { depends_on, key } = panel;
  const same_key = _.filter(
    PanelRegistry.panels,
    (g) => g.key === key && g !== panel
  );
  const similar_dependencies = _.chain(PanelRegistry.panels)
    .filter((g) => !_.isEmpty(_.intersection(g.depends_on, depends_on)))
    .reject((g) => g === panel)
    .value();

  const rest = _.chain(PanelRegistry.panels)
    .map()
    .difference([panel, ...similar_dependencies])
    .sortBy("key")
    .value();

  return { same_key, similar_dependencies, rest };
}

const get_subj = createSelector(
  (props) => _.get(props, "match.params"),
  ({ subject_type, id }) => {
    if (_.isEmpty(subject_type)) {
      subject_type = "gov";
    }
    return getSubj(subject_type, id);
  }
);

const get_panel_obj = createSelector(
  get_subj,
  (props) => _.get(props, "match.params.panel"),
  (subject, panel_key) => {
    return panel_key
      ? PanelRegistry.lookup(panel_key, subject.subject_type)
      : PanelRegistry.lookup("financial_key_concepts", "gov");
  }
);

const get_related_panels = createSelector(get_panel_obj, (panel) =>
  panels_of_interest(panel)
);

const get_derived_props = (props) => {
  return {
    subject: get_subj(props),
    panel: get_panel_obj(props),
    related_panels: get_related_panels(props),
  };
};

const RelatedInfo = ({ subject, panel, related_panels }) => {
  const { similar_dependencies, same_key, rest } = related_panels;

  return (
    <div>
      <h2>{tm("related_panels")}</h2>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th> key </th>
            <th> subject type </th>
            <th> table deps </th>
            <th> notes </th>
            <th> url </th>
          </tr>
        </thead>
        <tbody>
          <PanelTableRow
            key="current_panel"
            className="success"
            panel={panel}
            current_subject={subject}
          />
          {_.map(same_key, (p) => (
            <PanelTableRow
              key={p.full_key}
              panel={p}
              className="info"
              current_subject={subject}
            />
          ))}
          {_.map(similar_dependencies, (p) => (
            <PanelTableRow
              key={p.full_key}
              panel={p}
              className="warning"
              current_subject={subject}
            />
          ))}
          {_.map(rest, (p) => (
            <PanelTableRow
              key={p.full_key}
              panel={p}
              current_subject={subject}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const PanelTableRow = ({ current_subject, panel, className }) => {
  const url =
    panel.subject_type === current_subject.subject_type
      ? url_template(current_subject, panel)
      : url_template(getSubj(panel.subject_type, current_subject.id), panel);

  return (
    <tr className={className}>
      <td>{panel.key}</td>
      <td>{panel.subject_type}</td>
      <td>{panel.depends_on.join(", ")}</td>
      <td>{panel.notes}</td>
      <td>
        <Link to={url}>link</Link>
      </td>
    </tr>
  );
};

export default class PanelInventory extends React.Component {
  constructor() {
    super();
    this.state = {
      initial_loading: true,
      loading: true,
      derived_props: {},
    };
  }
  loadDeps({ subject, panel }) {
    ensure_loaded({
      panel_keys: [panel.key],
      subject_type: subject.subject_type,
      subject,
      footnotes_for: subject,
    }).then(() => {
      this.setState({ loading: false });
    });
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    if (!prevState.initial_loading) {
      const old_derived_props = prevState.derived_props;
      const new_derived_props = get_derived_props(nextProps);
      if (!_.isEqual(old_derived_props, new_derived_props)) {
        return {
          loading: true,
          derived_props: new_derived_props,
        };
      }
    }
    return null;
  }
  componentDidMount() {
    Promise.all(
      _.chain(["gov", "dept", "crso", "program", "tag"])
        .map(getSubj)
        .map(get_panels_for_subject)
        .value()
    ).then(() => this.setState({ initial_loading: false }));
  }
  componentDidUpdate() {
    if (this.state.loading) {
      this.loadDeps(this.state.derived_props);
    }
  }

  render() {
    const { initial_loading, loading } = this.state;

    let content;
    if (initial_loading || loading) {
      content = <LeafSpinner config_name={"sub_route"} />;
    } else {
      const { subject, panel, related_panels } = get_derived_props(this.props);

      content = (
        <div>
          <h1>{tm("panel_inventory")}</h1>
          <div className="mrgn-bttm-lg">
            <EverythingSearch
              placeholder="See this panel with another subject"
              reject_dead_orgs={false}
              href_template={(subj) => url_template(subj, panel)}
            />
          </div>
          <div>
            <p>{`${tm("selected_subject")}: ${subject.name} (${
              subject.subject_type
            })}`}</p>
            <p>{`${tm("selected_panel")}: ${panel.key}`}</p>
          </div>
          <div id="main">
            <PanelRenderer
              panel_key={panel.key}
              subject={subject}
              key={`${panel.key}-${subject.guid}`}
            />
            {!_.isEmpty(panel.notes) && (
              <div>
                <h3>{tm("notes")}</h3>
                {panel.notes}
              </div>
            )}
          </div>
          <div>
            <TestSubjectLinks
              href_template={(subj) => url_template(subj, panel)}
            />
          </div>
          <div id="meta">
            <RelatedInfo
              {...{
                panel,
                subject,
                related_panels,
              }}
            />
          </div>
        </div>
      );
    }

    return (
      <StandardRouteContainer
        title={tm("panel_inventory")}
        breadcrumbs={[tm("panel_inventory")]}
        description={null}
        route_key={"panel_inventory"}
      >
        {content}
      </StandardRouteContainer>
    );
  }
}

class TestSubjectLinks extends React.Component {
  render() {
    const { panel, href_template } = this.props;
    return (
      <div>
        <h3>{tm("test_subjects")}</h3>
        <div>
          <Link to={href_template(Gov, panel)}>{tm("goc_total")}</Link>
        </div>
        <div>
          <h5>Dept</h5>
        </div>
        <div>
          <Link to={href_template(Dept.store.lookup(151), panel)}>FCAC</Link>
        </div>
        <div>
          <Link to={href_template(Dept.store.lookup(94), panel)}>CSIS</Link>
        </div>
        <div>
          <Link to={href_template(Dept.store.lookup(249), panel)}>GG</Link>
        </div>
        <div>
          <Link to={href_template(Dept.store.lookup(219), panel)}>
            NCC (crown)
          </Link>
        </div>
        <div>
          <h5>CRSO</h5>
        </div>
        <div>
          <Link to={href_template(CRSO.store.lookup("NSERC-BNR00"), panel)}>
            NSERC-BNR00 (CR)
          </Link>
        </div>
        <div>
          <Link to={href_template(CRSO.store.lookup("INDSC-ISS00"), panel)}>
            INDSC-ISS00 (CR, Internal Services)
          </Link>
        </div>
        <div>
          <h5>Prog</h5>
        </div>
        <div>
          <Link to={href_template(Program.store.lookup("AGR-BWN08"), panel)}>
            AGR-BWN08 ({tm("non_active_program")})
          </Link>
        </div>
        <div>
          <Link to={href_template(Program.store.lookup("LAC-LJO00"), panel)}>
            LAC-LJO00 ({tm("small_numbers")})
          </Link>
        </div>
        <div>
          <Link to={href_template(Program.store.lookup("NCC-BSN00"), panel)}>
            NCC-BSN00 (crown)
          </Link>
        </div>
      </div>
    );
  }
}
