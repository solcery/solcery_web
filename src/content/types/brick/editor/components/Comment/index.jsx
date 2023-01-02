import { Button, Input } from 'antd';
import { NodeResizeControl } from '@reactflow/node-resizer';
import { CloseOutlined } from '@ant-design/icons';
import { useReactFlow } from 'reactflow';

import './style.scss'
import '@reactflow/node-resizer/dist/style.css';

function ResizeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="#2abdd2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ position: 'absolute', right: 5, bottom: 5 }}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <polyline points="16 20 20 20 20 16" />
      <line x1="14" y1="14" x2="20" y2="20" />
      <polyline points="8 4 4 4 4 8" />
      <line x1="4" y1="4" x2="10" y2="10" />
    </svg>
  );
}

export function Comment(props) {
	const reactFlowInstance = useReactFlow();

	const remove = () => {
		let thisNode = reactFlowInstance.getNode(props.id);
		reactFlowInstance.deleteElements({ nodes: [ thisNode ] });
	}

	props.data.position = {
		x: props.xPos,
		y: props.yPos
	}

	const onResize = (_, rect) => {
		props.data.size = {
			width: rect.width,
			height: rect.height,
		}
	}

	const controlStyle = {
		background: 'transparent',
		border: 'none',
		zIndex: 1,
		opacity: props.selected ? 1 : 0,
	};

	const onChangeText = (value) => {
		props.data.text = value;
	}

	return <>
		<NodeResizeControl isVisible={props.selected} style={controlStyle} minWidth={100} minHeight={80} onResize={onResize}>
	    	<ResizeIcon />
	    </NodeResizeControl>
		
		<div 
			className={`comment ${props.selected ? 'selected' : ''}`}
			style={{ ...props.data.size }}
		>	
			<div className='header'>
				<div className='title'>Comment</div>
				<Button 
					size='small' 
					className='remove-button' 
					onClick={remove}
					style={{ 
						pointerEvents: !props.selected ? 'none' : 'all',
						opacity: props.selected ? 1 : 0,
					}}

				>
					<CloseOutlined/>
				</Button>
			</div>
			<Input.TextArea 
				disabled={!props.selected}
				style={{ resize: 'none', cursor: 'pointer', color: 'white' }} 
				className='text'
				defaultValue={props.data.text}
				onChange={event => onChangeText(event.target.value)}
			/>
		</div>
	</>
}

