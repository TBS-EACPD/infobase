import { TM } from "./TextMaker.tsx";
import "./CardTopImage.scss";

const CardTopImage = ({
  img_src,
  title_key,
  text_key,
  link_key,
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
      {img_src && (
        <div className="top-img-card__top">
          <img aria-hidden="true" src={img_src} className="top-img-card__img" />
        </div>
      )}
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

export { CardTopImage };
