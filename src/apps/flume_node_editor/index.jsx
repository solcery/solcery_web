import React from 'react'
import { NodeEditor } from "flume";
import config from './config'
import { Button } from 'antd';

const Header = (Wrapper, nodeType, actions) => {
  return <Wrapper>
    <div>
      LOL {nodeType.label}
      {/*<Button onClick={actions.deleteNode}>DELETE</Button>*/}
    </div>
  </Wrapper>;
}

const Flume = () => {
  console.log('rerender')
  return (
    <div style={{ width: '100%', height: 1000 }}>
       <NodeEditor
        defaultNodes={[{ type: 'onLeftClick' }]}
        portTypes={config.portTypes}
        nodeTypes={config.nodeTypes}
        // renderNodeHeader = {Header}
      />
    </div>
  )
}

export default Flume;