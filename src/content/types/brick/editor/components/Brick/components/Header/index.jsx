import { CloseOutlined } from '@ant-design/icons';
import { useReactFlow } from 'reactflow';
import { Tooltip, Button } from 'antd';
import { useBrick } from '../../contexts/brick';
import { useBrickLibrary } from 'contexts/brickLibrary';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProject } from 'contexts/project';

import './style.scss';

function BrickTitle(props) {
	const { brick } = useBrick();
	const { brickLibrary } = useBrickLibrary();
	const { projectId } = useProject();

	const signature = useMemo(() => brickLibrary.getBrick(brick.lib, brick.func), [ brick, brickLibrary ]);

	if (signature) {
		var description = signature.description;
		var url = signature.url;
		
	}

	return <div className="brick-name">
		{(description || url) && <Tooltip title={description}>
			<Link style={{ pointerEvents: 'all' }} to={`/${projectId}/${url}`} target='_blank'>
				{`[?] `}
			</Link>
		</Tooltip>}
		{props.title}
	</div>
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