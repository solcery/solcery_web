import { useState, useEffect } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import Select from 'react-select';

export default function AddBrickButton(props) {
	const brickType = props.data.brickType; // TODO: type
	const brickSignaturesOfType = props.data.brickLibrary[brickType];

	const [ isNodeTypeSelectorVisible, setNodeTypeSelectorVisible ] = useState(false);

	// stopPropagation() is used extensively below to correctly handle config selector hiding on any click outside of it
	
	const onAddButtonPointerUp = (event) => {
		setNodeTypeSelectorVisible(true);
		event.stopPropagation();
	};

	const onSelectorPointerUp = (event) => {
		event.stopPropagation();
	};

	const onBrickSubtypeSelected = (option) => {
		console.log(option)
		const func = option.value;
		const brickSignature = brickSignaturesOfType[func];
		console.log(brickSignature)
		props.data.onBrickSubtypeSelected(brickSignature, props.data.brickTree, props.data.parentBrick, props.data.paramCode);
		setNodeTypeSelectorVisible(false);
	};

	useEffect(() => {
		const onMouseUp = () => {
			setNodeTypeSelectorVisible(false);
		};
		window.addEventListener('pointerup', onMouseUp);
		return () => {
			window.removeEventListener('pointerup', onMouseUp);
		};
	}, []);

	let isHovered = false;

	useEffect(() => {
		let isCtrlDown = false;
		
		const onKeyDown = (e) => {
			isCtrlDown = e.keyCode === 17 || e.keyCode === 91;
		};
		const onKeyUp = (e) => {
			isCtrlDown = !(e.keyCode === 17 || e.keyCode === 91); // Ctrl or Cmd keys
			
			if (isCtrlDown && e.keyCode === 86 /*'V' key*/ && isHovered) {
				navigator.clipboard.readText().then((clipboardContents) => {
					if (!clipboardContents) return;
					
					let pastedBrickTree: any = null;
					try {
						pastedBrickTree = JSON.parse(clipboardContents);
					} catch {}
					if (!pastedBrickTree) return;
					
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

	const selectorOptions = Object.entries(brickSignaturesOfType).map(([name, sig]) => {
		return { value: name, label: sig.name };
	});
	return (
		<>
			<div className = { props.data.readonly ? "add-brick-button" : "add-brick-button add-brick-button-active" }
			     onPointerUp = { onAddButtonPointerUp}
			     onPointerEnter={() => isHovered = true }
			     onPointerLeave={() => isHovered = false }>+</div>
			{props.data.parentBrick &&
			<Handle type="target" position={Position.Top} />}
			{isNodeTypeSelectorVisible &&
			<div className="brick-subtype-selector nowheel" onPointerUp={onSelectorPointerUp}>
				<Select classNamePrefix="react-select" options={selectorOptions} placeholder="Search..."
				        autoFocus={true} defaultMenuIsOpen={true} onChange={onBrickSubtypeSelected} />
			</div>}
		</>
	);
}
