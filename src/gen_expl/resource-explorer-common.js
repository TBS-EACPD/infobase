import { 
  TM,
  TextMaker,
  Format,
} from '../util_components.js';



export const get_col_defs = ({doc}) => [
  {
    id: 'name',
    width: 250,
    textAlign: "left",
    header_display: <TM k="name" />,
    get_val: ({data}) => data.name,
  },
  {
    id: "spending",
    width: 150,
    textAlign: "right",
    header_display: (
      <TextMaker 
        text_key={ 
          doc === 'dp17' ? 
          "tag_nav_exp_header_dp17" : 
          'tag_nav_exp_header_drr16' 
        } 
      />
    ),
    get_val: node => _.get(node, "data.resources.spending"),
    val_display: val => <Format type="compact1" content={val} />,
  },
  {
    id: "ftes",
    width: 150,
    textAlign: "right",
    header_display: (
      <TextMaker 
        text_key={ 
          doc === 'dp17' ? 
          "tag_nav_fte_header_dp17" : 
          'tag_nav_fte_header_drr16' 
        } 
      />
    ),
    get_val: node => _.get(node, "data.resources.ftes"),
    val_display: val => <Format type="big_int_real" content={val} />,
  },
];
