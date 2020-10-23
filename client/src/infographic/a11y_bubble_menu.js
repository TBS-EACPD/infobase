import { trivial_text_maker } from "src/models/text.js";

import { TM } from "../components/index.js";

export default class AccessibleBubbleMenu extends React.Component {
  render() {
    const { items } = this.props;
    return (
      <nav aria-label={trivial_text_maker("dataset_navigation")}>
        <ul>
          {_.map(items, ({ id, active, title, a11y_description, href }) => (
            <li key={id}>
              <a
                onClick={() =>
                  document
                    .getElementById("infographic-explanation-focus")
                    .focus()
                }
                href={href}
              >
                {title}
                {active && (
                  <span>
                    - <TM k="you_are_here" />
                  </span>
                )}
              </a>
              <div dangerouslySetInnerHTML={{ __html: a11y_description }} />
            </li>
          ))}
        </ul>
      </nav>
    );
  }
}
