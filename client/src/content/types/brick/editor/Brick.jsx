import { useEffect, useState, useRef } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import { notify } from '../../../../components/notification';
import { useProject } from '../../../../contexts/project';
import { Tooltip, Button, Input } from 'antd';
import { CommentOutlined, DashOutlined, CloseOutlined} from '@ant-design/icons';
const { TextArea } = Input;

function Comment(props) {
	let Icon = props.comment ? CommentOutlined : DashOutlined;
	let iconStyle;
	if (props.visible) iconStyle = { color: 'yellow' };
	return <>
		<Button size='small' shape='round' className='comment-button' onClick={props.toggle}>
			<Icon style={iconStyle}/>
		</Button>
		{props.visible && <div className='comment'>
			<div>Comment</div>
			<TextArea 
				autoSize
				autoFocus
				className='comment-input' 
				placeholder='Enter comment' 
				defaultValue={props.comment}
				onChange={(event) => props.onChange(event.target.value)}
			/>
		</div>}
	</>
}

function BrickName(props) {
	let isCustom = props.name.includes('custom');
	if (isCustom) return <Tooltip title='Double click to open'>
		<div onDoubleClick={props.onDoubleClick} className="brick-name">
			{props.name}
		</div>
	</Tooltip>;
	return <div className="brick-name">
		{props.name}
	</div>;
}


export default function Brick(props) {
	let { projectName } = useProject();
	const brick = props.data.brick;
	const brickLibrary = props.data.brickLibrary;
	const [ commentVisible, setCommentVisible ] = useState(false);
	let brickRef = useRef();

	// validation
	let errorBrick = false;
	let brickSignature = brickLibrary[brick.lib][brick.func];
	if (!brickSignature) {
		brickSignature = brickLibrary[brick.lib].error;
		errorBrick = true;
	}
	if (brick.func === 'arg') {
		let argSignature = brickLibrary[brick.lib][`arg.${brick.params.name}`];
		if (!argSignature) {
			brickSignature = brickLibrary[brick.lib].error;
			errorBrick = true;
		}
	}

	let nestedParams = [];
	let inlineParams = [];
	brickSignature.params.forEach((param) => {
		if (param.type.brickType) nestedParams.push(param); // TODO appropriate check
		else inlineParams.push(param);
	});

	const onRemoveButtonClicked = () => {
		props.data.onRemoveButtonClicked(props.data.brickTree, props.data.parentBrick, props.data.paramCode);
	};

	const onChangeComment = (comment) => {
		brick.comment = comment ?? undefined;
		props.data.onChange()
	}

	const onDoubleClick = () => {
		let objId = brick.func.split('.')[1];
		window.open(`/${projectName}/template/customBricks/${objId}/brick`, '_blank', 'noopener');
	};

	const toggleCommentVisibility = () => {
		setCommentVisible(!commentVisible);
	}

	let isHovered = false;

	const copy = () => {
		let brickJson = JSON.stringify(props.data.brick);
		notify({
			message: 'Brick copied',
			description: brickJson.substring(0, 30) + '...',
			color: '#DDFFDD',
		});
		navigator.clipboard.writeText(brickJson);
	};

	const paste = () => {
		navigator.clipboard.readText().then((clipboardContents) => {
			if (!clipboardContents) return;

			let pastedBrickTree = null;
			try {
				pastedBrickTree = JSON.parse(clipboardContents);
			} catch {
				notify({
					message: 'Invalid brickTree format in clipboard',
					description: clipboardContents,
					color: '#FFDDDD',
				});
			}
			if (!pastedBrickTree) return; // TODO: add validation
			props.data.onPaste(pastedBrickTree, props.data.brickTree, props.data.parentBrick, props.data.paramCode);
		});
	};

	useEffect(() => {
		const onKeyDown = (e) => {
			if (!isHovered) return;
			if (!e.ctrlKey) return;
			let charCode = String.fromCharCode(e.which).toLowerCase();
			if (charCode === 'c') copy();
			if (charCode === 'v') paste();
		};

		window.addEventListener('keydown', onKeyDown);
		return () => {
			window.removeEventListener('keydown', onKeyDown);
		};
	});

	let width = brickSignature.width ?? Math.max(15, brickSignature.name.length * 0.7, 4 + nestedParams.length * 6);
	
	return (
		<>
			<div
				className={`brick ${brickSignature.lib} ${brickSignature.func} ${props.data.fullscreen ? '' : 'small'} ${
					props.data.readonly ? 'readonly' : ''
				} ${errorBrick ? 'error' : ''}`}
				onPointerEnter={() => (isHovered = true)}
				onPointerLeave={() => (isHovered = false)}
				style={{ width: `${width}rem` }}
				ref={brickRef}
			>
				<div className='brick-header'>
					<BrickName name={brickSignature.name} onDoubleClick={onDoubleClick}/>
					{!props.data.readonly && props.data.fullscreen && (
						<Button size='small' className='remove-button' onClick={onRemoveButtonClicked}>
							<CloseOutlined/>
						</Button>
					)}
				</div>
				<Comment 
					visible={commentVisible} 
					toggle={toggleCommentVisibility}
					onChange={onChangeComment}
					comment={brick.comment}
					brick={brickRef}
				/>
				{inlineParams.map((param) => (
					<div className="field-container" key={param.code}>
						<div>{param.name}</div>
						<param.type.valueRender id={param.code}
							type={param.type}
							defaultValue={brick.params[param.code]}
							onChange={
								!param.readonly && !props.data.readonly
									? (value) => {
											brick.params[param.code] = value;
											props.data.onChange();
									  }
									: null
							}
						/>
					</div>
				))}
				{props.data.parentBrick && <Handle type="target" position={Position.Top} />}
				{nestedParams.map((param, index) => (
					<Handle
						id={`h${props.id}-${param.code}`}
						key={param.code}
						type="source"
						position={Position.Bottom}
						style={{
							left: Math.round((100 / (nestedParams.length + 1)) * (index + 1)) + '%',
							bottom: '-1.5rem',
						}}
					>
						<div className={'handle-label' + (props.data.readonly ? ' readonly' : '')}>{param.name}</div>
					</Handle>
				))}
			</div>
		</>
	);
}
