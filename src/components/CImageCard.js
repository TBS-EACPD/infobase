import classNames from 'classnames';
import './CImageCard.scss';

import { TM } from './TextMaker.js';

const CImageCard = ({
  img_src,
  title_key,
  text_key,
  link_key,
  link_href,
  text_args,
}) => (
  <div className="c-img-card col-content-child">
    <div className="c-img-card__left-container">
      <div className="c-img-card__left">
        <header className="c-img-card__title">
          <TM k={title_key}/>
        </header>
        <div className="c-img-card__text">
          <TM k={text_key} args={text_args} />
        </div>
      </div>
    </div>
    { img_src &&
      <div>
        <div className="c-img-card__right">
          <a className="c-img-card__img-link" href={link_href}>
            <img
              src={`${CDN_URL}/${img_src}`}
              className={classNames("c-img-card__img")}
            />
          </a>
        </div>
        <div className="c-img-card__bottom-right">
          <div className="c-img-card__link">
            <a href={link_href}>
              <TM k={link_key}/>
            </a>
          </div>
        </div>
      </div>
    }
  </div>
)

export { CImageCard }