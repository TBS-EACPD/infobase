import { IconPermalink } from '../icons/icons.js';
import { panel_href_template } from '../infographic/routes.js';

export const PermalinkButton = (props) => {
  const {
    context,
    title,
  } = props;

  return (
    <div style={{display: 'inline'}}> 
      <a className='panel-heading-utils' href={panel_href_template(context.subject, context.bubble, context.graph_key)}>
        <IconPermalink
          title={title}
        />
      </a>
    </div>
  );
};