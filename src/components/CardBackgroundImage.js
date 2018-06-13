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
  <div 
    className="background-img-card" 
    style={{ backgroundImage: img_src && `URL(${CDN_URL}/${img_src})`}}
    href={link_href}
  >
    <div className="background-img-card__top-left">
      <header className="background-img-card__title">
        <TM k={title_key}/>
      </header>
      <div className="background-img-card__text">
        <TM k={text_key} args={text_args} />
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