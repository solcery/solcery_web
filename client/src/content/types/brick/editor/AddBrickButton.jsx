import { useState, useEffect, useRef } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import Select from 'react-select';
import { useHotkeyContext } from '../../../../contexts/hotkey';

export default function AddBrickButton(props) {
	let { addHotkey, removeHotkey } = useHotkeyContext();
	let pasteHotkeyId = useRef(undefined);

	const brickType = props.data.brickType; // TODO: type
	const brickLibrary = props.data.brickLibrary;
	const brickSignatures = [];
	if (brickType === 'any') {
		Object.values(brickLibrary).forEach((lib) => Object.values(lib).forEach((brick) => brickSignatures.push(brick)));
	} else {
		let lib = brickLibrary[brickType];
		Object.values(lib).forEach((brick) => brickSignatures.push(brick));
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

	const paste = async () => {
		let clipboardContents = await navigator.clipboard.readText()
		if (!clipboardContents) return;

		let pastedBrickTree: any = null;
		try {
			pastedBrickTree = JSON.parse(clipboardContents);
		} catch {}
		if (!pastedBrickTree) return;
		props.data.onPaste(pastedBrickTree, props.data.brickTree, props.data.parentBrick, props.data.paramCode);
	}

	const onPointerEnter = () => {
		pasteHotkeyId.current = addHotkey({ key: 'Ctrl+KeyV', callback: paste })
	}
	const onPointerLeave = () => {
		removeHotkey('Ctrl+KeyV', pasteHotkeyId.current)
	}

	const selectorOptions = brickSignatures
		.filter((sig) => !sig.hidden)
		.map((sig) => {
			return { value: sig, label: sig.name };
		});
	return (
		<>
			<div
				className={`add-brick-button ${!props.data.readonly && !props.data.small ? 'active' : ''}`}
				onPointerUp={onAddButtonPointerUp}
				onPointerEnter={onPointerEnter}
				onPointerLeave={onPointerLeave}
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
