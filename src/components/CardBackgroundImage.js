import classNames from 'classnames';
import './CardBackgroundImage.scss';

import { TM } from './TextMaker.js';

const CardBackgroundImage = ({
  img_src,
  title_key,
  text_key,
  link_key,
  link_href,
  text_args,
}) => (
  <div className="background-img-card col-content-child">
    { img_src &&
    <div>
      <div className="background-img-card__right">
        <a className="background-img-card__img-link" href={link_href}>
          <img
            src={`${CDN_URL}/${img_src}`}
            className={classNames("background-img-card__img")}
          />
        </a>
      </div>
    </div>
    }
    <div className="background-img-card__left-container">
      <div className="background-img-card__left">
        <header className="background-img-card__title">
          <TM k={title_key}/>
        </header>
        <div className="background-img-card__text">
          <TM k={text_key} args={text_args} />
        </div>
      </div>
    </div>
    <div className="background-img-card__bottom-right">
      <div className="background-img-card__link">
        <a href={link_href}>
          <TM k={link_key}/>
        </a>
      </div>
    </div>
  </div>
)

export { CardBackgroundImage }