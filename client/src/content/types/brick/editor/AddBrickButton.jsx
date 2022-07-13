import { useState, useEffect } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import Select from 'react-select';

export default function AddBrickButton(props) {
	const brickType = props.data.brickType; // TODO: type
	const brickLibrary = props.data.brickLibrary;
	const brickSignatures = [];
	if (brickType === 'any') {
		Object.values(brickLibrary).forEach(lib => Object.values(lib).forEach(brick => brickSignatures.push(brick)));
	} else {
		let lib = brickLibrary[brickType]
		Object.values(lib).forEach(brick => brickSignatures.push(brick))
	}
	const [isNodeTypeSelectorVisible, setNodeTypeSelectorVisible] = useState(false);

	const onAddButtonPointerUp = (event) => {
		setNodeTypeSelectorVisible(true);
		event.stopPropagation();
	};

	const onSelectorPointerUp = (event) => {
		event.stopPropagation();
	};

	const onBrickSubtypeSelected = (option) => {
		const brickSignature = option.value;
		props.data.onBrickSubtypeSelected(
			brickSignature,
			props.data.brickTree,
			props.data.parentBrick,
			props.data.paramCode
		);
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
	const selectorOptions = brickSignatures
		.filter(sig => !sig.hidden)
		.map(sig => {
			return { value: sig, label: sig.name };
		});
	return (
		<>
			<div
				className={`add-brick-button ${!props.data.readonly && !props.data.small ? 'active' : ''}`}
				onPointerUp={onAddButtonPointerUp}
				onPointerEnter={() => (isHovered = true)}
				onPointerLeave={() => (isHovered = false)}
			>
				+
			</div>
			{props.data.parentBrick && <Handle type="target" position={Position.Top} />}
			{isNodeTypeSelectorVisible && (
				<div className="brick-subtype-selector nowheel" onPointerUp={onSelectorPointerUp}>
					<Select
						classNamePrefix="react-select"
						options={selectorOptions}
						placeholder="Search..."
						autoFocus={true}
						defaultMenuIsOpen={true}
						onChange={onBrickSubtypeSelected}
					/>
				</div>
			)}
		</>
	);
}
