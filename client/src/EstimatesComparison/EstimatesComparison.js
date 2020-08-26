import "./EstimatesComparison.scss";
import classNames from "classnames";
import { text_maker, TM } from "./text-provider.js";
import { StandardRouteContainer } from "../core/NavComponents";
import { infograph_href_template, rpb_link } from "../link_utils.js";
import { sources } from "../metadata/data_sources.js";
import {
  SpinnerWrapper,
  FootnoteList,
  HeightClipper,
  Format,
  RadioButtons,
  LabeledBox,
  CheckBox,
  Details,
} from "../components/index.js";
import { get_root } from "../explorer_common/hierarchy_tools.js";
import { map_state_to_root_props_from_memoized_funcs } from "../explorer_common/state_and_memoizing";
import {
  Explorer,
  ExplorerContainer,
} from "../explorer_common/explorer_components.js";
import { ensure_loaded } from "../core/lazy_loader.js";
import {
  estimates_diff_scheme,
  get_initial_state as get_initial_scheme_state,
  current_doc_is_mains,
  current_sups_letter,
} from "./scheme.js";
import { businessConstants } from "../models/businessConstants.js";

const { estimates_docs } = businessConstants;

const DetailedAmountsByDoc = ({ amounts_by_doc }) => {
  const sorted_items = _.sortBy(
    amounts_by_doc,
    ({ doc_code }) => estimates_docs[doc_code].order
  );

  return (
    <section className="LastYearEstimatesSection">
      <div>
        <div className="h6 heavy-weight">
          <TM k="doc_breakout_details" />
        </div>
        <table className="table tale-condensed">
          <thead>
            <tr>
              <th scope="column">
                <TM k="estimates_doc" />
              </th>
              <th scope="column">
                <TM k="last_year_authorities" />
              </th>
              <th scope="column">
                <TM k="this_year_authorities" />
              </th>
            </tr>
          </thead>
          <tbody>
            {_.map(
              sorted_items,
              ({ doc_code, amount_last_year, amount_this_year }) => (
                <tr key={doc_code}>
                  <td>{estimates_docs[doc_code][lang]}</td>
                  <td>
                    {amount_last_year && (
                      <Format type="compact2" content={amount_last_year} />
                    )}
                  </td>
                  <td>
                    {amount_this_year && (
                      <Format type="compact2" content={amount_this_year} />
                    )}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const get_non_col_content = ({ node }) => {
  const subject = _.get(node, "data.subject");
  const footnotes = _.get(node, "data.footnotes");
  const amounts_by_doc = _.get(node, "data.amounts_by_doc");

  return (
    <div>
      {!_.isEmpty(amounts_by_doc) && (
        <div>
          <DetailedAmountsByDoc amounts_by_doc={amounts_by_doc} />
        </div>
      )}
      {!_.isEmpty(footnotes) && (
        <div className={classNames(subject && "mrgn-bttm-lg")}>
          <HeightClipper allowReclip={true} clipHeight={150}>
            <Details
              summary_content={<TM k="footnotes" />}
              content={<FootnoteList footnotes={footnotes} />}
            />
          </HeightClipper>
        </div>
      )}
      {subject && (
        <div className="ExplorerNode__BRLinkContainer">
          <a href={infograph_href_template(subject)}>
            <TM k="infographic_for" args={{ subject }} />
          </a>
        </div>
      )}
    </div>
  );
};

class EstimatesExplorer extends React.Component {
  constructor() {
    super();
    this.state = { _query: "", show_inactive: false };
    this.debounced_set_query = _.debounce(this.debounced_set_query, 500);
  }

  handle_query_change = (new_query) => {
    this.setState({
      _query: new_query,
      loading: new_query.length > 3 ? true : undefined,
    });
    this.debounced_set_query(new_query);
  };
  debounced_set_query = (new_query) => {
    this.props.set_query(new_query);
    this.timedOutStateChange = setTimeout(() => {
      this.setState({ loading: false });
    }, 500);
  };

  componentWillUnmount = () => {
    !_.isUndefined(this.debounced_set_query) &&
      this.debounced_set_query.cancel();
    !_.isUndefined(this.timedOutStateChange) &&
      clearTimeout(this.timedOutStateChange);
  };

  clearQuery = () => {
    this.setState({ _query: "" });
    this.props.clear_query("");
  };

  componentDidUpdate = () => {
    const { route_h7y_layout, h7y_layout, set_h7y_layout } = this.props;

    if (h7y_layout && route_h7y_layout !== h7y_layout) {
      set_h7y_layout(route_h7y_layout);
    }
  };

  render() {
    const {
      history,

      flat_nodes,
      is_filtering,

      set_query,
      toggle_node,

      is_descending,
      sort_col,
      col_click,

      //scheme props
      doc_code,
      show_stat,
      toggle_stat_filter,
      use_legal_titles,
      toggle_legal_titles,
      column_defs,
      h7y_layout,
    } = this.props;

    const { loading } = this.state;

    const root = get_root(flat_nodes);

    const explorer_config = {
      column_defs,
      get_non_col_content,
      onClickExpand: (id) => toggle_node(id),
      is_sortable: true,
      zebra_stripe: true,
      col_click,
    };

    const filtered_root = this.state.show_inactive
      ? root
      : {
          ...root,
          children: _.map(root.children, (org) => ({
            ...org,
            children: _.reject(
              org.children,
              (estimate) =>
                estimate.data.current_value === 0 &&
                estimate.data.percent_value === -Infinity
            ),
          })),
        };

    return (
      <React.Fragment>
        <div style={{ marginBottom: "15px" }}>
          <LabeledBox label={<TM k="choose_grouping_scheme" />}>
            <div className="centerer">
              <RadioButtons
                options={[
                  {
                    id: "org",
                    active: h7y_layout === "org",
                    display: <TM k="by_org" />,
                  },
                  {
                    id: "item_type",
                    active: h7y_layout === "item_type",
                    display: <TM k="by_item_type" />,
                  },
                ]}
                onChange={(id) => history.push(`/compare_estimates/${id}`)}
              />
            </div>
          </LabeledBox>
        </div>
        <div>
          <form
            style={{ marginBottom: "15px" }}
            onSubmit={(evt) => {
              evt.preventDefault();
              evt.stopPropagation();
              set_query(evt.target.querySelector("input").value);
              this.refs.focus_mount.focus();
            }}
          >
            <input
              aria-label={text_maker("explorer_search_is_optional")}
              className="form-control input-lg"
              type="text"
              style={{ width: "100%" }}
              placeholder={text_maker("everything_search_placeholder")}
              onChange={(evt) => this.handle_query_change(evt.target.value)}
            />
            {window.is_a11y_mode && (
              <input
                type="submit"
                name="search"
                value={text_maker("explorer_search")}
              />
            )}
            {h7y_layout === "org" && (
              <div className="estimates-checkbox-row medium_panel_text">
                <CheckBox
                  label={text_maker("show_inactive_votes")}
                  active={this.state.show_inactive}
                  onClick={() =>
                    this.setState((prevState) => {
                      return { show_inactive: !prevState.show_inactive };
                    })
                  }
                  checkmark_vertical_align={6}
                  checkbox_style={{ marginTop: 4 }}
                />
                <CheckBox
                  label={text_maker("show_only_votes")}
                  active={!show_stat}
                  onClick={toggle_stat_filter}
                  checkmark_vertical_align={6}
                  checkbox_style={{ marginTop: 4 }}
                />
                <CheckBox
                  active={use_legal_titles}
                  onClick={toggle_legal_titles}
                  label={text_maker("use_legal_title")}
                  checkmark_vertical_align={6}
                  checkbox_style={{ marginTop: 4 }}
                />
              </div>
            )}
          </form>
        </div>
        <div
          tabIndex={-1}
          className="explorer-focus-mount"
          ref="focus_mount"
          style={{ position: "relative" }}
          aria-label={text_maker("explorer_focus_mount")}
        >
          {loading && (
            <div className="loading-overlay">
              <div style={{ height: "200px", position: "relative" }}>
                <SpinnerWrapper config_name={"sub_route"} />
              </div>
            </div>
          )}
          {is_filtering && _.isEmpty(filtered_root.children) && (
            <div
              style={{
                fontWeight: "500",
                fontSize: "1.5em",
                textAlign: "center",
              }}
            >
              <TM k="search_no_results" />
            </div>
          )}
          {!show_stat && (
            <div className="DiffFilterViewAlert">
              <TM k="showing_only_votes" />
            </div>
          )}
          <Explorer
            config={explorer_config}
            root={filtered_root}
            col_state={{
              sort_col,
              is_descending,
            }}
            min_width={525}
          />
        </div>
        <div className="h3" style={{ textAlign: "center" }}>
          <TM
            k="estimates_rpb_link"
            args={{
              href: rpb_link({
                table: "table8",
                columns: [
                  doc_code === "IM"
                    ? "{{est_next_year}}_estimates"
                    : "{{est_in_year}}_estimates",
                ],
                dimension: "by_estimates_doc",
                filter: estimates_docs[doc_code][window.lang],
              }),
            }}
          />
          <br />
          <TM
            k="estimates_source_link"
            args={{ href: sources.ESTIMATES.open_data[window.lang] }}
          />
        </div>
      </React.Fragment>
    );
  }
}

const map_state_to_props_from_memoized_funcs = (memoized_funcs) => {
  const { get_scheme_props } = memoized_funcs;
  const mapRootStateToProps = map_state_to_root_props_from_memoized_funcs(
    memoized_funcs
  );

  return (state) => ({
    ...mapRootStateToProps(state),
    ...get_scheme_props(state),
  });
};

const get_initial_state = ({ route_h7y_layout }) =>
  get_initial_scheme_state(route_h7y_layout);

export default class EstimatesComparison extends React.Component {
  constructor() {
    super();

    this.state = { loading: true };
  }

  componentDidMount() {
    ensure_loaded({
      table_keys: ["orgVoteStatEstimates"],
      footnotes_for: "estimates",
    }).then(() => {
      this.setState({ loading: false });
    });
  }

  render() {
    const {
      history,
      match: {
        params: { h7y_layout },
      },
    } = this.props;

    const title = text_maker("diff_view_title");

    const explorer_container_config = {
      scheme: estimates_diff_scheme,
      explorer: EstimatesExplorer,
      get_initial_state,
      map_state_to_props_from_memoized_funcs,
      data: {
        history,
        route_h7y_layout: h7y_layout,
        h7y_layout,
      },
    };

    return (
      <StandardRouteContainer
        title={title}
        breadcrumbs={[title]}
        description={text_maker("estimates_comparison_desc_meta_attr")}
        route_key="_dev"
      >
        <h1>
          <TM k="diff_view_title" />
        </h1>
        {this.state.loading ? (
          <SpinnerWrapper config_name={"sub_route"} />
        ) : (
          <div>
            <div className="medium_panel_text mrgn-tp-lg">
              <TM
                k="diff_view_top_text"
                args={{ current_doc_is_mains, current_sups_letter }}
              />
            </div>
            <h2>
              <TM k="general_info" />
            </h2>
            <div className="medium_panel_text">
              <TM k="estimates_expl" />
            </div>
            <ExplorerContainer {...explorer_container_config} />
          </div>
        )}
      </StandardRouteContainer>
    );
  }
}
