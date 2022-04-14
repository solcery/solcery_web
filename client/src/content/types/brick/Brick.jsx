import { useEffect } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import { defaultBricksByType } from './index'
import { notify } from "../../../components/notification";

export default function Brick(props) {

	const brick = props.data.brick;
	const brickClass = props.data.brickClass;
	let brickSignature = props.data.brickLibrary[brick.type][brick.func]
	// if (!brickSignature) {
	// 	brickSignature = defaultBricksByType.get(brick.type)
	// }
	let nestedParams = [];
	let inlineParams = [];
	brickSignature.params.forEach((param) => {

		if (param.type.brickType) nestedParams.push(param); // TODO appropriate check
		else inlineParams.push(param);
	});

	const onRemoveButtonClicked = () => {
		props.data.onRemoveButtonClicked(props.data.brickTree, props.data.parentBrick, props.data.paramCode);
	};

	let isHovered = false;

	useEffect(() => {
		let isCtrlDown = false;
		
		const onKeyDown = (e) => {
			isCtrlDown = e.keyCode === 17 || e.keyCode === 91;
		};
		const onKeyUp = (e) => {
			isCtrlDown = !(e.keyCode === 17 || e.keyCode === 91); // Ctrl or Cmd keys
			
			if (isCtrlDown && e.keyCode === 67 /*'C' key*/ && isHovered) {
				let brickJson = JSON.stringify(props.data.brick)
				notify({
					message: "Brick copied", 
					description: brickJson.substring(0, 30) + '...', color: '#DDFFDD'
				})
				navigator.clipboard.writeText(brickJson);
			}

			if (isCtrlDown && e.keyCode === 86 /*'V' key*/ && isHovered) {

				navigator.clipboard.readText().then((clipboardContents) => {
					if (!clipboardContents) return;
					
					let pastedBrickTree = null;
					try {
						pastedBrickTree = JSON.parse(clipboardContents);
					} catch {
						notify({ message: "Invalid brickTree format in clipboard", description: clipboardContents, color: '#FFDDDD'})
					}
					if (!pastedBrickTree) return; // TODO: add validation
					props.data.onPaste(pastedBrickTree, props.data.brickTree, props.data.parentBrick, props.data.paramCode);
				});
			}
		};
		
		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('keyup', onKeyUp);
		
		return () => {
			window.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('keyup', onKeyUp);
		};
	});
	return (
		<div className={ props.data.readonly ? "brick" : "brick brick-active" } onPointerEnter={() => isHovered = true} onPointerLeave={() => isHovered = false}>
			<div className={ props.data.readonly ? "remove-button" : "remove-button remove-button-active" } onClick={onRemoveButtonClicked}>x</div>
			<div className="brick-name">{brickSignature.name}</div>
			{inlineParams.map((param) =>
				<div className="field-container" key={ param.code }>
					<div>{param.name}</div>
					<param.type.valueRender 
						type = { param.type }
						defaultValue = { brick.params[param.code] } 
						onChange={ !props.data.readonly ?
						(value) => {
							brick.params[param.code] = value
							props.data.onChange()
						} : null } 
					/>
				</div>
			)}
			{props.data.parentBrick &&
			<Handle type="target" position={Position.Top} />}
			{nestedParams.map((param, index) =>
				<Handle id={`h${props.id}-${param.code}`} key={param.code} type="source" position={Position.Bottom}
				        style={{ left: Math.round(100 / (nestedParams.length + 1) * (index + 1)) + '%' }}>
					<div className="handle-label">{param.name}</div>
				</Handle>
			)}
		</div>
	);
}
