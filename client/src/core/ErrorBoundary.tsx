import _ from "lodash";
import React from "react";

import { lang, sha, is_dev } from "src/core/injected_build_constants";

import { NoIndex } from "src/components";
import { IconNotAvailable } from "src/icons/icons";

import { get_static_url, make_request } from "src/request_utils";

import { log_standard_event } from "./analytics";

// warning, at least right now, PromiseRejectionEvent["reason"] has type any. This isn't a useful type
type BoundaryHandledError =
  | { toString: () => string }
  | PromiseRejectionEvent["reason"];

const state_from_error = (error: BoundaryHandledError) => ({
  error: error,
  testing_for_stale_client: true,
});

const log_error = (error: BoundaryHandledError) => {
  console.error(error);

  !is_dev &&
    log_standard_event({
      SUBAPP: window.location.hash.replace("#", ""),
      MISC1: "ERROR_IN_PROD",
      MISC2: error.toString(),
    });
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}
interface ErrorBoundaryState {
  error?: BoundaryHandledError;
  testing_for_stale_client: boolean;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      error: null,
      testing_for_stale_client: false,
    };
  }

  static getDerivedStateFromError(error: BoundaryHandledError) {
    return state_from_error(error);
  }

  get_state_from_unhandled_rejection = (event: PromiseRejectionEvent) => {
    this.setState(state_from_error(event.reason));
  };
  componentDidMount() {
    window.addEventListener(
      "unhandledrejection",
      this.get_state_from_unhandled_rejection
    );
  }
  componentWillUnmount() {
    window.removeEventListener(
      "unhandledrejection",
      this.get_state_from_unhandled_rejection
    );
  }

  catch_stale_client_error_case() {
    const unique_query_param =
      Date.now() + Math.random().toString().replace(".", "");

    // Stale clients are our most likely production errors, always check for and attempt to handle them
    // That is, reload the page without cache if the client/CDN sha's are mismatched (and the build is non-dev)
    // Otherwise, log the error (again, if non-dev) and display error component
    make_request(get_static_url("build_sha.txt", unique_query_param))
      .then((resp) => resp.text())
      .then((build_sha) => {
        const local_sha_matches_remote_sha = build_sha.search(`^${sha}`) !== -1;

        if (!local_sha_matches_remote_sha && !is_dev) {
          window.location.reload();
        }
      })
      .finally(() => {
        log_error(this.state.error);

        this.setState({
          testing_for_stale_client: false,
        });
      });
  }

  render() {
    const { error, testing_for_stale_client } = this.state;

    if (_.isNull(error)) {
      return this.props.children;
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
          <NoIndex />
          <span>
            {
              {
                en: "An error has occured",
                fr: "Une erreur est survenue",
              }[lang]
            }
          </span>
          <IconNotAvailable
            color="#8c949e"
            width="400px"
            svg_style={{ maxWidth: "100%" }}
            alternate_color={false}
          />
          <span>
            {
              {
                en: "Please refresh the page, or ",
                fr: "Veuillez actualiser la page ou ",
              }[lang]
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
                }[lang]
              }
            </a>
          </span>
        </div>
      );
    }
  }
}
