import { Story, Meta } from "@storybook/react";
import React from "react";

import { KeyConceptList, KeyConceptListProps } from "./KeyConceptList";

export default {
  title: "KeyConceptList",
  component: KeyConceptList,
} as Meta;

const Template: Story<KeyConceptListProps> = (args) => (
  <KeyConceptList {...args} />
);

const lorem_ipsum1 = (
  <div>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce quis risus
    enim. Nulla a libero placerat, commodo purus at, rutrum nibh. Sed urna nunc,
    eleifend ac hendrerit in, dictum sit amet nulla. Suspendisse quis egestas
    ligula. Nunc mollis nibh ut ultricies ornare. Donec maximus feugiat eros, et
    rhoncus risus. Pellentesque dignissim leo velit, vitae hendrerit diam
    ultrices quis. Vivamus vulputate odio et orci vestibulum egestas.
    Pellentesque accumsan neque in libero pharetra, et congue urna fermentum.
    Aenean mattis sem ac erat interdum blandit.
  </div>
);

const lorem_ipsum2 = (
  <div>
    Etiam id magna mollis, pharetra metus cursus, scelerisque ante. Nullam
    luctus neque vel risus pellentesque, at fringilla sem euismod. Vivamus
    malesuada sem quam, sit amet volutpat dui venenatis a. Curabitur convallis
    tellus eu pharetra luctus. Nunc rutrum nulla ut ante dapibus finibus.
    Praesent ac tellus ac enim lacinia congue. In lacinia, diam vel egestas
    cursus, mi odio mattis mi, sed gravida quam neque a dolor. Aenean dapibus ac
    leo et suscipit. Nulla facilisi. Vestibulum commodo tellus sit amet justo
    lacinia porttitor.
  </div>
);

const lorem_ipsum3 = (
  <div>
    Integer laoreet, eros eget ullamcorper interdum, odio lorem eleifend libero,
    nec viverra velit elit eu ante. Donec urna arcu, laoreet non orci at,
    scelerisque suscipit tellus. Phasellus et malesuada dolor. Maecenas ac
    imperdiet tortor. Ut at ultricies massa. Fusce nisi nisl, fermentum nec
    ornare quis, tincidunt in dolor. Cras massa ante, egestas quis ullamcorper
    feugiat, congue eget lacus. In purus mauris, dictum vel neque in, rhoncus
    hendrerit eros. Maecenas malesuada nibh nec lobortis malesuada. Donec
    pellentesque arcu lobortis, cursus est quis, gravida lacus. Nulla nisi
    metus, sodales ut iaculis a, pharetra interdum velit. Cras a bibendum sem.
  </div>
);

export const Basic = Template.bind({});
Basic.args = {
  question_answer_pairs: [
    [<div key={1}>Lorem ispum 1</div>, lorem_ipsum1],
    [<div key={2}>Lorem ispum 2</div>, lorem_ipsum2],
    [<div key={3}>Lorem ispum 3</div>, lorem_ipsum3],
  ],
  compact: true,
};
