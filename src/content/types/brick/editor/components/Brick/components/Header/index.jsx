import { CloseOutlined } from '@ant-design/icons';
import { useReactFlow } from 'reactflow';
import { Tooltip, Button } from 'antd';
import { useBrick } from '../../contexts/brick';
import { useBrickLibrary } from 'contexts/brickLibrary';

import './style.scss';

function BrickTitle(props) {
	if (props.onDoubleClick) return <Tooltip title='Double click to open'>
		<div onDoubleClick={props.onDoubleClick} className="brick-name">
			{props.title}
		</div>
	</Tooltip>;
	return <div className="brick-name">
		{props.title}
	</div>;
}

export function Header({ title }) {
	const { brick } = useBrick();
	const { readonly } = useBrickLibrary();
	const reactFlowInstance = useReactFlow();

	const removeBrick = () => {
		let thisNode = reactFlowInstance.getNode(`${brick.id}`);
		reactFlowInstance.deleteElements({ nodes: [ thisNode ] });
	}

	return <div className='brick-header'>
		<BrickTitle title={title}/>
		{!readonly && brick.func !== 'root' && <Button size='small' className='remove-button' onClick={removeBrick}>
			<CloseOutlined/>
		</Button>}
	</div>
}