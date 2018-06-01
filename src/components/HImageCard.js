import classNames from 'classnames';
import './HImageCard.scss';

import { TM } from './TextMaker.js';

const HImageCard = ({
  img_src,
  title_key,
  text_key,
  link_key,
  link_href,
  text_args,
  is_ellen_image,
}) => (
  <div className="h-img-card col-content-child">
    <div className="h-img-card__left-container">
      <div className="h-img-card__left">
        <header className="h-img-card__title">
          <TM k={title_key}/>
        </header>
        <div className="h-img-card__text">
          <TM k={text_key} args={text_args} />
        </div>
      </div>
    </div>
    { img_src &&
    <div>
      <div className="h-img-card__right">
        <a className="h-img-card__img-link" href={link_href}>
          <img
            src={`${CDN_URL}/${img_src}`}
            className={classNames("h-img-card__img", is_ellen_image && "h-img-card__img__ellen")}
          />
        </a>
      </div>
      <div className="h-img-card__bottom-right">
        <div className="h-img-card__link">
          <a href={link_href}>
            <TM k={link_key}/>
          </a>
        </div>
      </div>
    </div>
    }
  </div>
)

export { HImageCard }