import './CardTopImage.scss';

import { TM } from './TextMaker.js';

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
  <a className="link-unstyled" href={link_href} target={link_open_in_new_tab ? "_blank" : "_self"} rel={link_open_in_new_tab ? "noopener noreferrer" : ""}>
    <div className="top-img-card">
      { img_src &&
        <div className="top-img-card__top">
          <img
            src={img_src}
            className="top-img-card__img" 
          />
        </div>
      }
      <div className="top-img-card__bottom">
        <header className="top-img-card__title">
          <TM k={title_key} tmf={tmf} args={text_args} />
        </header>
        <div className="top-img-card__text">
          <TM k={text_key} tmf={tmf} args={text_args} />
        </div>
      </div>
    </div>
  </a>
)

export { CardTopImage }