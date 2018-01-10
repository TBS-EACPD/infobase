
const BubbleMenu = ({ bubbles, onSelectBubble }) => {

  return <div>
    <ul>
      {_.map(bubbles, ({ key, isActive, name }) => 
        <li
          style={isActive ? { color: "red" } : {} }
          key={key}
          onClick={()=>onSelectBubble(key)}
        >
          {name}
        </li>
      )}
    </ul>
  </div>

};

const bubbles = [
  {
    name: "Introduction",
    key: "intro",
  },
  {
    name: "Finances",
    key: "fin",
  },
  {
    name: "People",
    key: "ppl",
  },
];

export class Infograph extends React.Component {
  render(){
    const {
      match: {
        params: { level, id, bubble },
      },
      history,
    } = this.props;

    const bubbles_menu_args = bubbles.map( ({name, key}) => ({
      name,
      key,
      isActive: key === bubble,
    }));

    return <div>
      <BubbleMenu
        bubbles={bubbles_menu_args} 
        onSelectBubble={new_bubble_key => {
          const new_url = `/infographic/${level}/${id}/${new_bubble_key}`;
          history.push(new_url);
        }}
      />
      
    </div>;

  } 

}