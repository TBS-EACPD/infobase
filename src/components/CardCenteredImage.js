import classNames from 'classnames';
import './CardCenteredImage.scss';

import { TM } from './TextMaker.js';

const CardCenteredImage = ({
  img_src,
  title_key,
  text_key,
  link_key,
  link_href,
  text_args,
  tmf,
}) => (
  <a className="link-unstyled" href={link_href}>
    <div className="centered-img-card">
      <div className="centered-img-card__left">
        <header className="centered-img-card__title">
          <TM k={title_key} tmf={tmf} args={text_args} />
        </header>
        <div className="centered-img-card__text">
          <TM k={text_key} tmf={tmf} args={text_args} />
        </div>
      </div>
      { img_src &&
        <div>
          <div className="centered-img-card__right">
            <img
              src={img_src}
              className={classNames("centered-img-card__img")}
            />
          </div>
          <div className="centered-img-card__bottom-right">
            <div className="centered-img-card__badge">
              <TM k={link_key} tmf={tmf} args={text_args} />
            </div>
          </div>
        </div>
      }
    </div>
  </a>
)

export { CardCenteredImage }