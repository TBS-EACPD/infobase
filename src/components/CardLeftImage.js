import './CardLeftImage.scss';

import { TM } from './TextMaker.js';

const CardLeftImage = ({
  img_src,
  title_key,
  text_key,
  link_key,
  link_href,
  text_args,
}) => (
  <div className="left-img-card col-content-child">
    { img_src &&
      <div className="left-img-card__left">
        <a className="left-img-card__img-link" href={link_href}>
          <img
            src={`${CDN_URL}/${img_src}`}
            className="left-img-card__img" 
          />
        </a>
      </div>
    }
    <div className="left-img-card__right-container">
      <div className="left-img-card__right">
        <header className="left-img-card__title">
          <TM k={title_key}/>
        </header>
        <div className="left-img-card__text">
          <TM k={text_key} args={text_args} />
        </div>
        <div className="left-img-card__bottom-right">
          <a href={link_href}>
            <TM k={link_key} />
          </a>
        </div>
      </div>
    </div>
  </div>
)

export { CardLeftImage }