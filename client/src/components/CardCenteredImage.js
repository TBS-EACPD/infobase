import classNames from "classnames";
import React from "react";

import { TM } from "./TextMaker.tsx";

import "./CardCenteredImage.scss";

const CardCenteredImage = ({
  img_src,
  title_key,
  text_key,
  link_key,
  link_href,
  text_args,
  tmf,
}) => (
  <div className="centered-img-card">
    <div className="centered-img-card__left">
      <div className="centered-img-card__title">
        <TM k={title_key} tmf={tmf} args={text_args} />
      </div>
      <div className="centered-img-card__text">
        <TM k={text_key} tmf={tmf} args={text_args} />
      </div>
    </div>
    <div>
      {img_src && (
        <div className="centered-img-card__right">
          <img
            aria-hidden="true"
            src={img_src}
            className={classNames("centered-img-card__img")}
          />
        </div>
      )}
      {link_key && (
        <div className="centered-img-card__bottom-right">
          <a className="link-unstyled" href={link_href}>
            <div tabIndex={0} className="centered-img-card__badge">
              <TM k={link_key} tmf={tmf} args={text_args} />
            </div>
          </a>
        </div>
      )}
    </div>
  </div>
);

export { CardCenteredImage };
