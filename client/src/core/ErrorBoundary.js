import { withRouter } from "react-router";

import { Subject } from "../models/subject.js";
import { trivial_text_maker } from "../models/text.js";
import { get_panels_for_subject } from "../panels/get_panels_for_subject";
import { get_static_url, make_request } from "../request_utils.js";

import { log_standard_event } from "./analytics.js";

const { Dept, Program, Tag, Gov, CRSO } = Subject;

const get_subject = (level, id) => {
  switch (level) {
    case "dept":
      return Dept.lookup(id);
    case "tag":
      return Tag.lookup(id);
    case "program":
      return Program.lookup(id);
    case "crso":
      return CRSO.lookup(id);
    default:
      return Gov;
  }
};

const NoIndex = () =>
  ReactDOM.createPortal(
    <meta name="robots" content="noindex" />,
    document.head
  );

const ErrorBoundary = withRouter(
  class ErrorBoundary extends React.Component {
    constructor() {
      super();

      this.state = {
        error: null,
        testing_for_stale_client: false,
      };
    }
    static getDerivedStateFromError(error) {
      return {
        error: error,
        testing_for_stale_client: true,
      };
    }
    catch_stale_client_error_case() {
      const unique_query_param =
        Date.now() + Math.random().toString().replace(".", "");

      // Stale clients are our most likely production errors, always check for and attempt to handle them
      // That is, reload the page without cache if the client/CDN sha's are mismatched (and the build is non-dev)
      // Otherwise, log the error (again, if non-dev) and display error component
      make_request(get_static_url("build_sha", unique_query_param))
        .then((build_sha) => {
          const local_sha_matches_remote_sha =
            build_sha.search(`^${window.sha}`) !== -1;

          if (!local_sha_matches_remote_sha && !window.is_dev) {
            window.location.reload(true);
          } else {
            this.log_error_and_display_error_page();
          }
        })
        .catch(() => {
          this.log_error_and_display_error_page();
        });
    }
    log_error_and_display_error_page() {
      if (!window.is_dev) {
        log_standard_event({
          SUBAPP: window.location.hash.replace("#", ""),
          MISC1: "ERROR_IN_PROD",
          MISC2: this.state.error.toString(),
        });
      }

      this.setState({
        testing_for_stale_client: false,
      });

      throw this.state.error;
    }
    render() {
      const { children, set_redirect_msg, location } = this.props;
      const { error, testing_for_stale_client } = this.state;

      if (_.isNull(error)) {
        return children;
      }
      if (testing_for_stale_client) {
        this.catch_stale_client_error_case();
        return null;
      } else {
        const redirect_to_parent_dept_or_home = (level, subj_id) => {
          const parent_dept_code = _.split(subj_id, "-")[0];
          const parent_dept = Dept.lookup(parent_dept_code);
          if ((level === "program" || level === "crso") && parent_dept) {
            set_redirect_msg(
              `The ${trivial_text_maker(
                level
              )} you tried to visit is either dead or invalid. We redirected you to its parent department.`
            );
            window.location.replace(
              `#orgs/dept/${parent_dept.id}/infograph/intro`
            );
          } else {
            set_redirect_msg(
              "The organization you tried to visit is invalid. We redirected you to homepage."
            );
            window.location.replace("#home");
          }
          window.location.reload();
        };
        const current_url = location.pathname;
        const regex_template =
          "orgs/(gov|dept|program|tag|crso)/(.*)/infograph/(.*)";

        // This one catches infograph url with / at the end and any panel string after that
        const infograph_regex_with_panel = new RegExp(
          `${regex_template}/`
        ).exec(current_url);
        // This one catches infograph url only with data area, without / at the end
        const infograph_regex_without_panel = new RegExp(regex_template).exec(
          current_url
        );

        if (infograph_regex_with_panel) {
          const [
            full_match_url,
            level,
            subj_id,
            data_area,
          ] = infograph_regex_with_panel;
          const target_subj = get_subject(level, subj_id);
          if (target_subj) {
            get_panels_for_subject(target_subj).then((panels_for_subj) => {
              const bubbles_for_subj = _.keys(panels_for_subj);
              // Everything matches, redirect to its infograph page
              if (_.includes(bubbles_for_subj, data_area)) {
                set_redirect_msg("The panel part of the link is invalid.");
                window.location.replace(`#${full_match_url}`);
              } else {
                /*  This doesn't actually seem to emit error but still check it nonetheless
                    data area doesn't match, redirect to its intro infograph page. */
                set_redirect_msg(
                  "You're redirected to intro because the data area is invalid"
                );
                window.location.replace(
                  `#${_.replace(full_match_url, data_area, "intro")}`
                );
              }
              window.location.reload();
              return;
            });
          } else {
            // subject doesn't exist, redirect to home
            redirect_to_parent_dept_or_home(level, subj_id);
            return;
          }
        } else if (infograph_regex_without_panel) {
          const [
            full_match_url, //eslint-disable-line no-unused-vars
            level,
            subj_id,
          ] = infograph_regex_without_panel;
          // Without panel part, url will only fail with subject not matching
          redirect_to_parent_dept_or_home(level, subj_id);
        } else {
          return (
            <div
              style={{
                fontSize: "32px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <NoIndex />
              <span>
                {
                  {
                    en: "An error has occured",
                    fr: "Une erreur est survenue",
                  }[window.lang]
                }
              </span>
              <img
                aria-hidden={true}
                id="error-boundary-icon"
                src={get_static_url("svg/not-available.svg")}
                style={{
                  maxWidth: "100%",
                  width: "400px",
                }}
              />
              <span>
                {
                  {
                    en: "Please refresh the page, or ",
                    fr: "Veuillez actualiser la page ou ",
                  }[window.lang]
                }
                <a
                  href="#start"
                  onClick={() => {
                    // React router's dead at this point, so hack our way home
                    window.location.replace("#start");
                    window.location.reload();
                  }}
                >
                  {
                    {
                      en: "return home",
                      fr: "retourner à la page d'accueil.",
                    }[window.lang]
                  }
                </a>
              </span>
            </div>
          );
        }
      }
    }
  }
);

export { ErrorBoundary };
