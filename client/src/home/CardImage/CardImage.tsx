import React from "react";

import { TM, TMProps } from "src/components/TextMaker";

import "./CardImage.scss";

interface CardImageProps {
  svg?: string;
  title_key: string;
  text_key: string;
  link_href: string;
  link_open_in_new_tab?: boolean;
  text_args?: Record<string, unknown>;
  tmf: TMProps["tmf"];
}

const CardImage: React.FC<CardImageProps> = ({
  svg,
  title_key,
  text_key,
  link_href,
  link_open_in_new_tab,
  text_args,
  tmf,
}) => (
  <a
    className={"top-img-card-container link-unstyled"}
    href={link_href}
    target={link_open_in_new_tab ? "_blank" : "_self"}
    rel={link_open_in_new_tab ? "noopener noreferrer" : ""}
  >
    <div className="top-img-card">
      {svg && <div className="top-img-card__top">{svg}</div>}
      <div className="top-img-card__bottom">
        <div className="top-img-card__title">
          <TM k={title_key} tmf={tmf} args={text_args} />
        </div>
        <div className="top-img-card__text">
          <TM k={text_key} tmf={tmf} args={text_args} />
        </div>
      </div>
    </div>
  </a>
);

export { CardImage };
