import { Fragment } from "react";

import { get_static_url, make_request } from "../request_utils.js";

import { log_standard_event } from "./analytics.js";

const NoIndex = () =>
  ReactDOM.createPortal(
    <meta name="robots" content="noindex" />,
    document.head
  );

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
    const { children } = this.props;
    const { error, testing_for_stale_client } = this.state;

    if (_.isNull(error)) {
      return children;
    } else if (testing_for_stale_client) {
      this.catch_stale_client_error_case();
      return null;
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
          <Fragment>
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
          </Fragment>
          <NoIndex />
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

export { ErrorBoundary };
