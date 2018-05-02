import './HImageCard.scss';

import { TM } from './TextMaker.js';

const HImageCard = ({
  svg_src,
  png_src,
  title_key,
  text_key,
  link_key,
  link_href,
  text_args,
}) => (
  <div className="h-img-card col-content-child">
    { ( svg_src || (!svg_src && png_src) ) &&
      <div className="h-img-card__left">
        <a className="h-img-card__img-link" href={link_href}>
          { svg_src && 
            <svg
              src={`${CDN_URL}/svg/${svg_src}`}
              className="h-img-card__img" 
            />
          }
          { !svg_src && png_src && 
            <img
              src={`${CDN_URL}/png/${png_src}`}
              className="h-img-card__img" 
            />
          }
        </a>
      </div>
    }
    <div className="h-img-card__right-container">
      <div className="h-img-card__right">
        <header className="h-img-card__title">
          <TM k={title_key}/>
        </header>
        <div className="h-img-card__text">
          <TM k={text_key} args={text_args} />
        </div>
        <div className="h-img-card__bottom-right">
          <a href={link_href}>
            <TM k={link_key} />
          </a>
        </div>
      </div>
    </div>
  </div>
)

export { HImageCard }