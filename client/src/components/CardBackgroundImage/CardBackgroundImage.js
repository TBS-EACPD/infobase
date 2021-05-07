import React from "react";

import { TM } from "../TextMaker.tsx";

import "./CardBackgroundImage.scss";

const CardBackgroundImage = ({
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
