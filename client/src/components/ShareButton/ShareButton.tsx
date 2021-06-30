import React, { Fragment } from "react";

import { StatelessModal } from "src/components/modals_and_popovers/index";

import { create_text_maker } from "src/models/text";

import { textLightColor, tertiaryColor } from "src/core/color_defs";

import {
  IconShare,
  IconFacebook,
  IconTwitter,
  IconReddit,
  IconEmail,
} from "src/icons/icons";

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

interface ShareButtonProps {
  button_class_name: string;
  button_description?: string;
  icon_alternate_color?: string | boolean;
  icon_color?: string;
  icon_size: number | string;
  title: string;
  url: string;
}

interface ShareButtonState {
  showModal: boolean;
}
export class ShareButton extends React.Component<
  ShareButtonProps,
  ShareButtonState
> {
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
          onClick={() => this.toggleModal(true)}
          className={button_class_name}
        >
          <IconShare
            title={button_description}
            color={icon_color}
            alternate_color={icon_alternate_color}
            width={icon_size}
            height={icon_size}
          />
        </button>
        <StatelessModal
          show={this.state.showModal}
          on_close_callback={() => this.toggleModal(false)}
          title={
            <Fragment>
              <IconShare
                title={text_maker("share")}
                color={tertiaryColor}
                alternate_color={false}
              />
              {text_maker("share")}
            </Fragment>
          }
          subtitle={title}
          body={
            <Fragment>
              <CommonSocialMediaShareButton
                complete_url={`https://www.facebook.com/sharer/sharer.php?u=${encoded_url}`}
                media_icon={
                  <IconFacebook
                    {...common_icon_props}
                    title={`${text_maker("share_on")} Facebook`}
                  />
                }
              />
              <CommonSocialMediaShareButton
                complete_url={`https://twitter.com/intent/tweet?url=${encoded_url}`}
                media_icon={
                  <IconTwitter
                    {...common_icon_props}
                    title={`${text_maker("share_on")} Twitter`}
                  />
                }
              />
              <CommonSocialMediaShareButton
                complete_url={`https://www.reddit.com/submit?url=${encoded_url}&title=${title}`}
                media_icon={
                  <IconReddit
                    {...common_icon_props}
                    title={`${text_maker("share_on")} Reddit`}
                  />
                }
              />
              <CommonSocialMediaShareButton
                complete_url={`mailto:?subject=${title}&body=${encoded_url}`}
                media_icon={
                  <IconEmail
                    {...common_icon_props}
                    title={text_maker("share_via_email")}
                  />
                }
              />
            </Fragment>
          }
          close_text={text_maker("cancel")}
        />
      </Fragment>
    );
  }
  static defaultProps = {
    button_description: text_maker("share"),
    icon_color: textLightColor,
    icon_alternate_color: false,
  };
}
