import React from 'react';

import { storiesOf, configure } from '@storybook/react';

import { Welcome } from '@storybook/react/demo';

//attach globals that module expect to have
import './story-bootstrap.js';


const req = require.context('../src/', true, /\.stories\.js$/)

function loadStories() {
  req.keys().forEach((filename) => req(filename))
}

storiesOf('Welcome', module).add('to Storybook', () => <Welcome />);

configure(loadStories, module);
  
