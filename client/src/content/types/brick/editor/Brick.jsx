import { useEffect } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import { useNavigate } from 'react-router-dom';
import { notify } from '../../../../components/notification';

export default function Brick(props) {
	const navigate = useNavigate();
	const brick = props.data.brick;
	const brickLibrary = props.data.brickLibrary;

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

	const onDoubleClick = () => {
		let isCustomBrick = brick.func.includes('custom'); // TODO: add 'custom' key to brick itself
		if (!isCustomBrick) return;
		let objId = brick.func.split('.')[1];
		navigate(`../brickLibrary.${objId}?instant=brick`);
	};

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

	let width = brickSignature.width ?? Math.max(15, 4 + nestedParams.length * 5);
	return (
		<div
			className={`brick ${brickSignature.lib} ${brickSignature.func} ${props.data.small ? 'small' : ''} ${
				props.data.readonly ? 'readonly' : ''
			} ${errorBrick ? 'error' : ''}`}
			onPointerEnter={() => (isHovered = true)}
			onPointerLeave={() => (isHovered = false)}
			style={{ width: `${width}rem` }}
			onDoubleClick={onDoubleClick}
		>
			{!props.data.readonly && !props.data.small && (
				<div className={'remove-button'} onClick={onRemoveButtonClicked}>
					x
				</div>
			)}
			<div className="brick-name">{brickSignature.name}</div>
			{inlineParams.map((param) => (
				<div className="field-container" key={param.code}>
					<div>{param.name}</div>
					<param.type.valueRender
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
					}}
				>
					<div className="handle-label">{param.name}</div>
				</Handle>
			))}
		</div>
	);
}
