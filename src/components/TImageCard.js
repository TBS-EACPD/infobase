import classNames from 'classnames';
import './TImageCard.scss';

import { TM } from './TextMaker.js';

const TImageCard = ({
  img_src,
  title_key,
  text_key,
  link_key,
  link_href,
  text_args,
  is_ellen_image,
}) => (
  <div className="t-img-card col-content-child">
    { img_src &&
    <div>
      <div className="t-img-card__right">
        <a className="t-img-card__img-link" href={link_href}>
          <img
            src={`${CDN_URL}/${img_src}`}
            className={classNames("t-img-card__img")}
          />
        </a>
      </div>
    </div>
    }
    <div className="t-img-card__left-container">
      <div className="t-img-card__left">
        <header className="t-img-card__title">
          <TM k={title_key}/>
        </header>
        <div className="t-img-card__text">
          <TM k={text_key} args={text_args} />
        </div>
      </div>
    </div>
    <div className="t-img-card__bottom-right">
      <div className="t-img-card__link">
        <a href={link_href}>
          <TM k={link_key}/>
        </a>
      </div>
    </div>
  </div>
)

export { TImageCard }