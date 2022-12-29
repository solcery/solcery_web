import React from 'react';
import { getBezierPath, useReactFlow } from 'reactflow';
import { useBrickLibrary } from 'contexts/brickLibrary';
import { useMemo } from 'react';

import 'reactflow/dist/style.css';

export function BrickEdge(props) {
  const { brickLibrary } = useBrickLibrary();
  const reactFlowInstance = useReactFlow();

  const {
    id,
    sourceX,
    sourceY,
    target,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    markerEnd,
  } = props;

  const style = useMemo(() => {
    let sourceNode = reactFlowInstance.getNode(props.source);
    if (!sourceNode) return;
    let targetNode = reactFlowInstance.getNode(props.target);
    if (!targetNode) return;
    let sourceSignature = brickLibrary.getBrick(sourceNode.data.lib, sourceNode.data.func);
    if (!sourceSignature) return;
    let param = sourceSignature.params.find(p => p.code === data.paramCode);
    if (!param) return;
    let style = {
      stroke: brickLibrary.getTypeColor(targetNode.data.lib),
      strokeWidth: 1.5,
    }
    if (param.pipeline) {
      style = {
        ...style,
        strokeDasharray: 5,
        WebkitAnimation: 'dashdraw 0.5s linear infinite',
        animation: 'dashdraw 0.5s linear infinite',
        strokeWidth: 3,
      }
    }
    return style;
  }, [ props.source, props.target, data ])

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return <>
    <path
      id={id}
      style={style}
      className="react-flow__edge-path"
      d={edgePath}
      markerEnd={markerEnd}
    />
  </>
}
