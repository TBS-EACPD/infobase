import React from "react";

import { TM } from "./TextMaker.js";

import "./CardLeftImage.scss";

const CardLeftImage = ({
  img_src,
  title_key,
  text_key,
  button_text_key,
  link_href,
  text_args,
  tmf,
}) => (
  <a className="link-unstyled" href={link_href}>
    <div className="left-img-card">
      {img_src && (
        <div className="left-img-card__left">
          <img
            aria-hidden="true"
            src={img_src}
            className="left-img-card__img"
          />
        </div>
      )}
      <div className="left-img-card__right-container">
        <div className="left-img-card__right">
          <div className="left-img-card__title">
            <TM k={title_key} tmf={tmf} args={text_args} />
          </div>
          <div className="left-img-card__text">
            <TM k={text_key} tmf={tmf} args={text_args} />
          </div>
          {button_text_key && (
            <div className="left-img-card__bottom-right">
              <div tabIndex={0} className="left-img-card__badge">
                <TM k={button_text_key} tmf={tmf} args={text_args} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </a>
);

export { CardLeftImage };
