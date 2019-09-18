import { IconPermalink } from '../icons/icons.js';

const default_props = {
  icon_color: window.infobase_color_constants.textLightColor,
  icon_alternate_color: false,
};

export const PermalinkButton = (props) => {

  const {
    button_class_name,
    url,
    title,

    icon_color,
    icon_alternate_color,
    icon_size,
  } = {...default_props, ...props};

  return (
    <div style={{display: 'inline'}}> 
      <a className={button_class_name} href={url}>
        <IconPermalink
          color={icon_color}
          alternate_color={icon_alternate_color}
          width={icon_size}
          height={icon_size}
          title={title}
        />
      </a>
    </div>
  );
};