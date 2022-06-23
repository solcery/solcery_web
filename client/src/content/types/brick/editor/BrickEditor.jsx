import { useState, useEffect, useCallback, useRef } from 'react';
import ReactFlow, { ReactFlowProvider, isNode, useZoomPanHelper } from 'react-flow-renderer';
import AddBrickButton from './AddBrickButton';
import Brick from './Brick';
import { Button } from 'antd';
import LayoutHelper from './LayoutHelper';
import makeLayoutedElements from './dagreLayout';
import { notify } from '../../../../components/notification';
import './BrickEditor.scss';

let brickUniqueID = 0;

const nodeTypes = {
	add: AddBrickButton,
	brick: Brick,
};

export const BrickEditor = (props) => {
	let width = props.fullscreen ? window.innerWidth : props.width;
	let height = props.fullscreen ? window.innerHeight : props.height;

	const [state, setState] = useState({ elements: [], isLayouted: false });
	const [brickTree, setBrickTree] = useState(props.brickTree);
	const { fitView } = useZoomPanHelper();

	const sleepAndFit = useCallback(() => {
		new Promise((resolve) => setTimeout(resolve, 50)).then(() => {
			fitView();
		});
	}, [ fitView ]);

	useEffect(() => {
		setBrickTree(props.brickTree)
		sleepAndFit()
	}, [ props.brickTree ])

	const addBrick = useCallback(
		(brickSignature, bt, parentBrick, paramID) => {
			if (!props.onChange) return;
			const brick = {
				lib: brickSignature.lib,
				func: brickSignature.func,
				params: {},
			};
			brickSignature.params.forEach((param) => {
				brick.params[param.code] = param.value ?? (param.type.default && param.type.default());
			});
			if (parentBrick) {
				parentBrick.params[paramID] = brick;
				setBrickTree(JSON.parse(JSON.stringify(bt)));
			} else {
				setBrickTree(brick);
			}
		},
		[props.fullscreen, props]
	);

	const removeBrick = useCallback(
		(bt, parentBrick, paramCode) => {
			if (!props.onChange) return;

			if (parentBrick) {
				parentBrick.params[paramCode] = null;
				setBrickTree(JSON.parse(JSON.stringify(bt)));
			} else {
				sleepAndFit();
				setBrickTree(null);
			}
		},
		[props, props.fullscreen, sleepAndFit]
	);

	const onPaste = useCallback(
		(pastedBrickTree, bt, parentBrick, paramCode) => {
			if (!props.onChange) return;
			if (parentBrick) {
				const brickSignature = props.brickLibrary[parentBrick.lib][parentBrick.func];
				const param = brickSignature.params.find((param) => param.code === paramCode);
				if (param.type.brickType === pastedBrickTree.lib) {
					parentBrick.params[paramCode] = pastedBrickTree;
					setBrickTree(JSON.parse(JSON.stringify(bt)));
					notify({ message: 'Pasted successfully', color: '#DDFFDD' });
				} else {
					notify({
						message: 'Unable to paste brick tree: incompatible brick types.',
						color: '#FFDDDD',
					});
				}
			} else {
				if (pastedBrickTree.lib === props.brickType) {
					sleepAndFit();
					setBrickTree(pastedBrickTree);
					notify({ message: 'Pasted successfully', color: '#DDFFDD' });
				} else {
					notify({
						message: 'Unable to paste brick tree: incompatible brick types.',
						color: '#FFDDDD',
					});
				}
			}
		},
		[props, props.fullscreen, sleepAndFit]
	);

	const makeAddButtonElement = useCallback(
		(brickID, brickType, brickTree, parentBrick, paramCode) => {
			if (!brickType) {
				throw new Error('NO BRICK');
			}
			return {
				id: brickID,
				type: 'add',
				position: { x: 0, y: 0 },
				data: {
					brickLibrary: props.brickLibrary,
					brickClass: props.brickClass,
					brickType,
					brickTree,
					parentBrick,
					paramCode,
					onBrickSubtypeSelected: addBrick,
					onPaste: onPaste,
					readonly: !props.onChange,
				},
			};
		},
		[props.brickLibrary, props.brickClass, addBrick, onPaste, props.fullscreen, props.onChange]
	);

	const makeAddButtonWithEdgeElements = useCallback(
		(brickID, brickType, brickTree, parentBrick, parentBrickID, paramCode) => {
			const elements = [makeAddButtonElement(brickID, brickType, brickTree, parentBrick, paramCode)];
			elements.push({
				id: `e${parentBrickID}-${brickID}`,
				source: parentBrickID,
				sourceHandle: `h${parentBrickID}-${paramCode}`,
				target: brickID,
				type: 'smoothstep',
			});
			return elements;
		},
		[makeAddButtonElement]
	);

	const makeBrickElement = useCallback(
		(brickID, brick, bt, parentBrick, paramCode) => {
			return {
				id: brickID,
				type: 'brick',
				position: { x: 0, y: 0 },
				data: {
					brickLibrary: props.brickLibrary,
					brickClass: props.brickClass,
					brick,
					parentBrick,
					brickTree,
					paramCode,
					onRemoveButtonClicked: removeBrick,
					onPaste: onPaste,
					onChange: props.onChange
						? () => {
								setBrickTree(bt);
						  }
						: null,
					readonly: !props.onChange,
					small: !props.fullscreen,
				},
			};
		},
		[props.fullscreen, props.onChange, brickTree, props.brickLibrary, props.brickClass, removeBrick, onPaste]
	);

	const makeBrickWithEdgeElements = useCallback(
		(brickID, brick, brickTree, parentBrick, parentBrickID, paramID) => {
			const elements = [makeBrickElement(brickID, brick, brickTree, parentBrick, paramID)];
			if (parentBrickID) {
				elements.push({
					id: `e${parentBrickID}-${brickID}`,
					source: parentBrickID,
					sourceHandle: `h${parentBrickID}-${paramID}`,
					target: brickID,
					type: 'smoothstep',
				});
			}
			return elements;
		},
		[makeBrickElement]
	);

	const makeBrickTreeElements = useCallback(
		(brickTree) => {
			const elements = [];

			const processBrick = (brick, parentBrickID = null, parentBrick = null, paramCode = '') => {
				const brickID = Number(++brickUniqueID).toString();
				elements.push(...makeBrickWithEdgeElements(brickID, brick, brickTree, parentBrick, parentBrickID, paramCode));
				let brickSignature = props.brickLibrary[brick.lib][brick.func];
				if (!brickSignature) {
					return elements;
				}
				brickSignature.params.forEach((param) => {
					if (!param.type.brickType) return;

					const value = brick.params[param.code];
					if (value) {
						processBrick(value, brickID, brick, param.code);
					} else {
						const addButtonBrickID = Number(++brickUniqueID).toString();
						const addButtonElems = makeAddButtonWithEdgeElements(
							addButtonBrickID,
							param.type.brickType,
							brickTree,
							brick,
							brickID,
							param.code
						);
						elements.push(...addButtonElems);
					}
				});
			};
			processBrick(brickTree);

			return elements;
		},
		[props.brickLibrary, makeAddButtonWithEdgeElements, makeBrickWithEdgeElements]
	);

	const onNodeSizesChange = (nodeSizesByID) => {
		const rootNodePos = { x: width * 0.5, y: height * 0.1 };
		setState({
			elements: makeLayoutedElements(state.elements, nodeSizesByID, rootNodePos, isNode),
			isLayouted: true,
		});
	};

	useEffect(() => {
		let elements = null;
		if (brickTree) {
			elements = makeBrickTreeElements(brickTree);
		} else {
			elements = [makeAddButtonElement(Number(++brickUniqueID).toString(), props.brickType, null, null, 0)];
		}
		setState({ elements: elements, isLayouted: false });
		if (editorRef.current) {
			editorRef.current.style.visibility = 'hidden';
		}
	}, [brickTree, makeBrickTreeElements, makeAddButtonElement, props.brickType]);

	useEffect(() => {
		if (state.isLayouted && editorRef.current) {
			editorRef.current.style.visibility = 'visible';
		}
	}, [state.isLayouted]);

	const editorRef = useRef(null);

	const onLoad = (reactFlowInstance) => {
		sleepAndFit();
	};

	const save = () => {
		if (!props.onChange) return;
		props.onChange(brickTree);
	};

	let style = {
		backgroundColor: props.fullscreen ? 'black' : 'transparent',
		pointerEvents: props.fullscreen ? 'auto' : 'none',
		position: props.fullscreen ? 'fixed' : 'relative',
		left: 0,
		top: 0,
		bottom: 0,
		right: 0,
		display: props.fullscreen ? 'inline' : 'block',
	};

	return (
		
		<>
			<div style={style}>
				{props.fullscreen && props.onChange && <Button onClick={save}>SAVE</Button>}
				<div
					ref={editorRef}
					className="brick-editor"
					style={{
						width: width,
						height: height,
					}}
				>
					<ReactFlow
						nodeTypes={nodeTypes}
						elements={state.elements}
						nodesDraggable={false}
						nodesConnectable={false}
						zoomOnDoubleClick={false}
						paneMoveable={props.fullscreen}
						zoomOnScroll={props.fullscreen}
						zoomOnPinch={props.fullscreen}
						onLoad={onLoad}
						minZoom={props.fullscreen ? 0.4 : 0.001}
						maxZoom={1}
					>
						<LayoutHelper onNodeSizesChange={onNodeSizesChange} />
					</ReactFlow>
				</div>
			</div>
		</>
	);
};

export default BrickEditor;
