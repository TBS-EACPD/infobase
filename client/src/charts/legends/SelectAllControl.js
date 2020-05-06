import { Fragment } from 'react';
import { TrivialTM } from '../../components/index.js';

export const SelectAllControl = ({SelectAllOnClick, SelectNoneOnClick}) =>
  <Fragment>
    <TrivialTM k="select" />:
    <span
      onClick={SelectAllOnClick}
      className="link-styled"
      style={{margin: "0px 5px 0px 5px"}}
    >
      <TrivialTM k="all"/>
    </span>
|
    <span
      onClick={SelectNoneOnClick}
      className="link-styled" 
      style={{marginLeft: "5px"}}
    >
      <TrivialTM k="none"/>
    </span> 
  </Fragment>;
