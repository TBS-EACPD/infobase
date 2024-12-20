import React, { Fragment } from "react";

import { StatelessModal } from "src/components/modals_and_popovers/index";

import { create_text_maker } from "src/models/text";

import { debounced_log_standard_event } from "src/core/analytics";

import {
  IconShare,
  IconFacebook,
  IconTwitter,
  IconReddit,
  IconEmail,
} from "src/icons/icons";
import { textLightColor, tertiaryColor } from "src/style_constants/index";

import text from "./ShareButton.yaml";
import "./ShareButton.scss";

const text_maker = create_text_maker(text);

const CommonSocialMediaShareButton = ({
  complete_url,
  media_icon,
}: {
  complete_url: string;
  media_icon: React.ReactNode;
}) => (
  <a
    href={complete_url}
    target="_blank"
    rel="noopener noreferrer"
    className="link-unstyled"
  >
    {media_icon}
  </a>
);

const ShareButtondefaultProps = {
  button_description: text_maker("share") as string,
  icon_color: textLightColor,
};
type ShareButtonProps = typeof ShareButtondefaultProps & {
  title: string;
  url: string;
  button_class_name: string;
  icon_size: number | string;
  icon_alternate_color?: string;
};

interface ShareButtonState {
  showModal: boolean;
}

export class ShareButton extends React.Component<
  ShareButtonProps,
  ShareButtonState
> {
  static defaultProps = ShareButtondefaultProps;

  constructor(props: ShareButtonProps) {
    super(props);
    this.state = {
      showModal: false,
    };
  }

  toggleModal(bool: boolean) {
    this.setState({ showModal: bool });
  }

  render() {
    const {
      url,
      button_class_name,
      title,
      button_description,
      icon_color,
      icon_alternate_color,
      icon_size,
    } = this.props;

    const common_icon_props = {
      width: "50px",
      height: "50px",
    };
    const encoded_url = encodeURIComponent(url);

    return (
      <Fragment>
        <button
          onClick={() => {
            debounced_log_standard_event("PANEL_LINK_SHARED", title);
            this.toggleModal(true);
          }}
          className={button_class_name}
        >
          <IconShare
            aria_label={button_description}
            color={icon_color}
            alternate_color={icon_alternate_color}
            width={icon_size}
            height={icon_size}
          />
        </button>
        <StatelessModal
          show={this.state.showModal}
          on_close_callback={() => this.toggleModal(false)}
          title={text_maker("share")}
          subtitle={
            <Fragment>
              <IconShare
                aria_label={text_maker("share")}
                color={tertiaryColor}
                alternate_color={false}
              />
              {title}
            </Fragment>
          }
          close_text={text_maker("cancel")}
        >
          <CommonSocialMediaShareButton
            complete_url={`https://www.facebook.com/sharer/sharer.php?u=${encoded_url}`}
            media_icon={
              <IconFacebook
                {...common_icon_props}
                aria_label={`${text_maker("share_on")} Facebook`}
              />
            }
          />
          <CommonSocialMediaShareButton
            complete_url={`https://twitter.com/intent/tweet?url=${encoded_url}`}
            media_icon={
              <IconTwitter
                {...common_icon_props}
                aria_label={`${text_maker("share_on")} Twitter`}
              />
            }
          />
          <CommonSocialMediaShareButton
            complete_url={`https://www.reddit.com/submit?url=${encoded_url}&title=${title}`}
            media_icon={
              <IconReddit
                {...common_icon_props}
                aria_label={`${text_maker("share_on")} Reddit`}
              />
            }
          />
          <CommonSocialMediaShareButton
            complete_url={`mailto:?subject=${title}&body=${encoded_url}`}
            media_icon={
              <IconEmail
                {...common_icon_props}
                aria_label={text_maker("share_via_email")}
              />
            }
          />
        </StatelessModal>
      </Fragment>
    );
  }
}
