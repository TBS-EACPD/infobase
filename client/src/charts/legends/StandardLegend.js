import './StandardLegend.scss';

import { LegendList } from './LegendList.js';

export const StandardLegend = ({
  container_style,
  title,
  items, //required: [ {active, id, label, color} ]

  isHorizontal,

  onClick,
  LegendCheckBoxProps,

  Controls,
}) => (
  <div
    className="standard-legend-container"
    style={container_style}
  >
    <div style={{maxHeight: 'inherit', display: 'flex', flexDirection: 'column'}}>
      { title &&
        <p className="mrgn-bttm-0 mrgn-tp-0 nav-header centerer">
          {title}
        </p>
      }
      <div style={{overflowX: 'hidden'}}>
        <LegendList
          {...{
            items,
            isHorizontal,

            onClick,
            LegendCheckBoxProps,
          }}
        />
      </div>
      { Controls &&
        <div 
          style={{
            borderTop: `1px dashed ${window.infobase_color_constants.tertiaryColor}`,
            padding: "10px 0px 10px 5px",
          }}
        >
          {Controls}
        </div>
      }
    </div>
  </div>
);