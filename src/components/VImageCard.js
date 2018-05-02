import './VImageCard.scss';

import { TM } from './TextMaker.js';

const VImageCard = ({
  svg_src,
  png_src,
  title_key,
  text_key,
  link_key,
  link_href,
}) => (
  <div className="v-img-card col-content-child">
    { ( svg_src || (!svg_src && png_src) ) &&
      <div className="v-img-card__top-container">
        <div aria-hidden={true} className="v-img-card__top">
          <a className="v-img-card__img-link" href={link_href}>
            { svg_src && 
              <svg
                src={`${CDN_URL}/svg/${svg_src}`}
                className="v-img-card__img" 
              />
            }
            { !svg_src && png_src &&
              <img
                src={`${CDN_URL}/png/${png_src}`}
                className="v-img-card__img" 
              />
            }
          </a>
        </div>
      </div>
    }
    <div className="v-img-card__bottom-container">
      <div className="v-img-card__bottom">
        <header className="v-img-card__title">
          <TM k={title_key} />
        </header>
        <div className="v-img-card__text">
          <TM k={text_key} />
        </div>

        <div className="v-img-card__bottom-right">
          <a href={link_href}><TM k={link_key} /></a>
        </div>
      </div>
    </div>
  </div>
)

export { VImageCard }