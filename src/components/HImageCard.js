import './HImageCard.scss';

import { TM } from './TextMaker.js';

const HImageCard = ({
  img_src,
  title_key,
  text_key,
  link_key,
  link_href,
  text_args,
  tmf,
}) => (
  <div className="h-img-card col-content-child">
    { img_src &&
      <div className="h-img-card__left">
        <a className="h-img-card__img-link" href={link_href}>
          <img
            src={`${CDN_URL}/${img_src}`}
            className="h-img-card__img" 
          />
        </a>
      </div>
    }
    <div className="h-img-card__right-container">
      <div className="h-img-card__right">
        <header className="h-img-card__title">
          <TM tmf={tmf} k={title_key}/>
        </header>
        <div className="h-img-card__text">
          <TM tmf={tmf} k={text_key} args={text_args} />
        </div>
        <div className="h-img-card__bottom-right">
          <a href={link_href}>
            <TM tmf={tmf} k={link_key} />
          </a>
        </div>
      </div>
    </div>
  </div>
)

export { HImageCard }