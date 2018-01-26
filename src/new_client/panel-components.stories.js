import { storiesOf } from '@storybook/react';

import { Panel, Col, StdPanel } from './panel-components.js';


storiesOf('Panel Components', module)
  .add("Low level panel API (no columns)", ()=> 
    <Panel
      title={"Panel Title"}
      sources={[
        {html: "source-link1 display", href: "#"},
        {html: "source-link1 display", href: "#"},
      ]}
      footnotes={[ "this is a footnote" ]}
    >
      children can be any content here.

    </Panel>
  )
  .add("High level Column API", ()=> 
    <StdPanel title={"title"}>
      <Col size={12}>
        only children of type Col are supported. If you need something non-column based, wrap it in a 12-sized Col
      </Col>
      <Col size={5} isText>
        Using the isText prop, the panel text will be appropriately sized
      </Col>
      <Col size={7} isGraph>
        <div style={{minWidth:"300px", minHeight:"300px"}}>
          <div 
            style={{
              position: "absolute",
              top: "0",
              left: "10px",
              transform: `translate(50%, 50%)`,
              backgroundColor:"#aaa",
            }}
          >
            use the isGraph prop to enable relative positioning
          </div>
        </div>
      </Col>
    </StdPanel>
  )
  .add("proper use of 'Col' children in StdPanel",()=> 
    <StdPanel title="">
      Some loose text
      <Col size={12}></Col>
    </StdPanel>
  )