import './CardTopImage.scss';

import { TM } from './TextMaker.js';

const CardTopImage = ({
  img_src,
  title_key,
  text_key,
  link_key,
  link_href,
}) => (
  <div className="top-img-card col-content-child">
    { img_src &&
      <div className="top-img-card__top-container">
        <div aria-hidden={true} className="top-img-card__top">
          <a className="top-img-card__img-link"  href={link_href}>
            <img
              src={`${CDN_URL}/${img_src}`}
              className="top-img-card__img" 
            />
          </a>
        </div>
      </div>
    }
    <a href={link_href}>
      <div className="top-img-card__bottom-container">
        <div className="top-img-card__bottom">
          <header className="top-img-card__title">
            <TM k={title_key} />
          </header>
          <div className="top-img-card__text">
            <TM k={text_key} />
          </div>
        </div>
      </div>
    </a>
  </div>
)

export { CardTopImage }