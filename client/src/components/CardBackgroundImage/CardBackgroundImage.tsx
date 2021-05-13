import React from "react";

import { TM, TMProps } from "src/components/TextMaker";

import "./CardBackgroundImage.scss";

interface CardBackgroundImageProps {
  img_src?: string;
  title_key: string;
  text_key: string;
  link_key: string;
  link_href: string;
  text_args: Object;
  tmf: TMProps["tmf"];
}

const CardBackgroundImage: React.FC<CardBackgroundImageProps> = ({
  img_src,
  title_key,
  text_key,
  link_key,
  link_href,
  text_args,
  tmf,
}) => (
  <a className="link-unstyled" href={link_href}>
    <div
      className="background-img-card"
      style={{ backgroundImage: img_src && `URL(${img_src})` }}
    >
      <div className="background-img-card__top-left">
        <div className="background-img-card__title">
          <TM k={title_key} tmf={tmf} args={text_args} />
        </div>
        <div className="background-img-card__text">
          <TM k={text_key} tmf={tmf} args={text_args} />
        </div>
      </div>
      <div className="background-img-card__bottom-right">
        <div tabIndex={0} className="background-img-card__badge">
          <TM k={link_key} tmf={tmf} args={text_args} />
        </div>
      </div>
    </div>
  </a>
);

export { CardBackgroundImage };
