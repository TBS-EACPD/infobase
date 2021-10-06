import React from "react";

import { get_panels_for_subject } from "src/panels/get_panels_for_subject/index";
import { PanelRenderer } from "src/panels/PanelRenderer";

import { LeafSpinner } from "src/components/index";

import { Dept, Program, Gov, CRSO, Tag } from "src/models/subject_index";

import { create_text_maker } from "src/models/text";

import { ensure_loaded } from "src/core/ensure_loaded";
import { StandardRouteContainer } from "src/core/NavComponents";

import text from "./IsolatedPanel.yaml";

const text_maker = create_text_maker(text);

const get_subject = (level, id) => {
  switch (level) {
    case "dept":
      return Dept.store.lookup(id);
    case "tag":
      return Tag.store.lookup(id);
    case "program":
      return Program.store.lookup(id);
    case "crso":
      return CRSO.store.lookup(id);
    default:
      return Gov;
  }
};

export default class IsolatedPanel extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: true,
    };
  }
  loadDeps(props) {
    const {
      match: {
        params: { level, subject_id, panel_key },
      },
    } = this.props;

    if (!(level && subject_id && panel_key)) {
      this.setState({ loading: false, panel_key: undefined });
    } else {
      const subject = get_subject(level, subject_id);
      get_panels_for_subject(subject).then(() =>
        ensure_loaded({
          subject: subject,
          has_results: true,
          panel_keys: [panel_key],
          subject_level: subject.level,
          footnotes_for: subject,
        }).then(() => this.setState({ loading: false, subject, panel_key }))
      );
    }
  }
  componentDidMount() {
    this.loadDeps({ ...this.props });
  }
  componentDidUpdate() {
    if (this.state.loading) {
      this.loadDeps({ ...this.props });
    }
  }

  render() {
    const { loading, subject, panel_key } = this.state;
    if (loading) {
      return <LeafSpinner config_name={"sub_route"} />;
    } else {
      return (
        <StandardRouteContainer
          title={text_maker("individual_panel_title")}
          breadcrumbs={[text_maker("individual_panel_title")]}
          description={undefined}
          route_key={"panel"}
        >
          <div id="main" style={{ marginTop: "10px" }}>
            <h1>{subject.name}</h1>
            {panel_key && (
              <PanelRenderer
                panel_key={panel_key}
                subject={subject}
                key={`${panel_key}-${subject.guid}`}
              />
            )}
          </div>
        </StandardRouteContainer>
      );
    }
  }
}
