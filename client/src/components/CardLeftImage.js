import './CardLeftImage.scss';

import { TM } from './TextMaker.js';

const CardLeftImage = ({
  img_src,
  title_key,
  text_key,
  link_key,
  link_href,
  text_args,
  tmf,
}) => (
  <div className="left-img-card">
    { img_src &&
      <div className="left-img-card__left">
        <a className="left-img-card__img-link" href={link_href}>
          <img
            aria-hidden="true"
            src={img_src}
            className="left-img-card__img" 
          />
        </a>
      </div>
    }
    <div className="left-img-card__right-container">
      <div className="left-img-card__right">
        <header className="left-img-card__title">
          <TM k={title_key} tmf={tmf} args={text_args} />
        </header>
        <div className="left-img-card__text">
          <TM k={text_key} tmf={tmf} args={text_args} />
        </div>
        { link_key &&
            <div className="left-img-card__bottom-right">
              <a className="link-unstyled" href={link_href}>
                <div tabIndex={0} className="left-img-card__badge">
                  <TM k={link_key} tmf={tmf} args={text_args} />
                </div>
              </a>
            </div>
        }
      </div>
    </div>
  </div>
)

export { CardLeftImage }