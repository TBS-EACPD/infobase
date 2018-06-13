import './VImageCard.scss';

import { TM } from './TextMaker.js';

const VImageCard = ({
  img_src,
  title_key,
  text_key,
  link_key,
  link_href,
  tmf,
}) => (
  <div className="v-img-card col-content-child">
    { img_src &&
      <div className="v-img-card__top-container">
        <div aria-hidden={true} className="v-img-card__top">
          <a className="v-img-card__img-link" href={link_href}>
            <img
              src={`${CDN_URL}/${img_src}`}
              className="v-img-card__img" 
            />
          </a>
        </div>
      </div>
    }
    <div className="v-img-card__bottom-container">
      <div className="v-img-card__bottom">
        <header className="v-img-card__title">
          <TM tmf={tmf} k={title_key} />
        </header>
        <div className="v-img-card__text">
          <TM tmf={tmf}  k={text_key} />
        </div>

        <div className="v-img-card__bottom-right">
          <a href={link_href}><TM tmf={tmf} k={link_key} /></a>
        </div>
      </div>
    </div>
  </div>
)

export { VImageCard }