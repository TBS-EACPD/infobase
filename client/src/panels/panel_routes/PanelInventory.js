import { Link } from "react-router-dom";
import { createSelector } from "reselect";

import { EverythingSearch, SpinnerWrapper } from "../../components/index.js";
import { ensure_loaded } from "../../core/lazy_loader.js";
import { StandardRouteContainer } from "../../core/NavComponents.js";
import { Subject } from "../../models/subject.js";
import { create_text_maker } from "../../models/text.js";
import { get_panels_for_subject } from "../get_panels_for_subject/index.js";
import { PanelRegistry } from "../PanelRegistry.js";
import { PanelRenderer } from "../PanelRenderer.js";

import panel_text from "./PanelInventory.yaml";

const tm = create_text_maker(panel_text);

const { Dept, Program, SpendArea, Tag, Gov, CRSO } = Subject;

function url_template(subject, panel) {
  return `/panel-inventory/${subject.level}/${panel.key}/${subject.id}`;
}

const defaultSubjectKeys = {
  dept: "1",
  program: "AGR-AAA00", //business risk management
  tag: "GOC001",
  crso: "TBC-BXA00",
};

const getSubj = (level, id) => {
  let subject;
  switch (level) {
    case "dept":
      subject = Dept.lookup(id) || Dept.lookup(defaultSubjectKeys.dept);
      break;
    case "tag":
      subject = Tag.lookup(id) || Tag.lookup(defaultSubjectKeys.tag);
      break;
    case "program":
      subject =
        Program.lookup(id) || Program.lookup(defaultSubjectKeys.program);
      break;
    case "spendarea":
      subject =
        SpendArea.lookup(id) || SpendArea.lookup(defaultSubjectKeys.spendarea);
      break;
    case "crso":
      subject = CRSO.lookup(id) || CRSO.lookup(defaultSubjectKeys.crso);
      break;
    default:
      subject = Gov;
  }
  return subject;
};

// Bring back footnotes inventory ??
// const link_to_footnotes = ( panel_key, level) => `#footnotes/panel/${panel_key}/${level}`;

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
  ({ level, id }) => {
    if (_.isEmpty(level)) {
      level = "gov";
    }
    return getSubj(level, id);
  }
);

const get_panel_obj = createSelector(
  get_subj,
  (props) => _.get(props, "match.params.panel"),
  (subject, panel_key) => {
    return (
      PanelRegistry.lookup(panel_key, subject.level) ||
      PanelRegistry.lookup("financial_key_concepts", "gov")
    );
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
            <th> level </th>
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
    panel.level === current_subject.level
      ? url_template(current_subject, panel)
      : url_template(getSubj(panel.level, current_subject.id), panel);

  return (
    <tr className={className}>
      <td>{panel.key}</td>
      <td>{panel.level}</td>
      <td>{panel.depends_on.join(", ")}</td>
      <td>{panel.notes}</td>
      <td>
        <Link to={url}>link</Link>
      </td>
    </tr>
  );
};

export default class panelInventory extends React.Component {
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
      subject_level: subject.level,
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
      content = <SpinnerWrapper config_name={"sub_route"} />;
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
              subject.level
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
          <Link to={href_template(Dept.lookup(151), panel)}>FCAC</Link>
        </div>
        <div>
          <Link to={href_template(Dept.lookup(94), panel)}>CSIS</Link>
        </div>
        <div>
          <Link to={href_template(Dept.lookup(249), panel)}>GG</Link>
        </div>
        <div>
          <Link to={href_template(Dept.lookup(219), panel)}>NCC (crown)</Link>
        </div>
        <div>
          <h5>CRSO</h5>
        </div>
        <div>
          <Link to={href_template(CRSO.lookup("NSERC-BNR00"), panel)}>
            NSERC-BNR00 (CR)
          </Link>
        </div>
        <div>
          <Link to={href_template(CRSO.lookup("INDSC-ISS00"), panel)}>
            INDSC-ISS00 (CR, Internal Services)
          </Link>
        </div>
        <div>
          <h5>Prog</h5>
        </div>
        <div>
          <Link to={href_template(Program.lookup("AGR-BWN08"), panel)}>
            AGR-BWN08 ({tm("non_active_program")})
          </Link>
        </div>
        <div>
          <Link to={href_template(Program.lookup("LAC-LJO00"), panel)}>
            LAC-LJO00 ({tm("small_numbers")})
          </Link>
        </div>
        <div>
          <Link to={href_template(Program.lookup("NCC-BSN00"), panel)}>
            NCC-BSN00 (crown)
          </Link>
        </div>
      </div>
    );
  }
}
