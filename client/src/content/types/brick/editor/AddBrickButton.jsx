import { useState, useEffect } from "react";
import { Handle, Position } from "react-flow-renderer";
import Select from "react-select";

export default function AddBrickButton(props) {
  const brickType = props.data.brickType; // TODO: type
  console.log(brickType);
  console.log(props.data);
  console.log(props.data.brickLibrary);
  const brickSignaturesOfType = props.data.brickLibrary[brickType];
  const [isNodeTypeSelectorVisible, setNodeTypeSelectorVisible] =
    useState(false);

  // stopPropagation() is used extensively below to correctly handle config selector hiding on any click outside of it

  const onAddButtonPointerUp = (event) => {
    setNodeTypeSelectorVisible(true);
    event.stopPropagation();
  };

  const onSelectorPointerUp = (event) => {
    event.stopPropagation();
  };

  const onBrickSubtypeSelected = (option) => {
    const func = option.value;
    const brickSignature = brickSignaturesOfType[func];
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
    window.addEventListener("pointerup", onMouseUp);
    return () => {
      window.removeEventListener("pointerup", onMouseUp);
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

          props.data.onPaste(
            pastedBrickTree,
            props.data.brickTree,
            props.data.parentBrick,
            props.data.paramCode
          );
        });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  });

  console.log(brickSignaturesOfType);

  const selectorOptions = Object.entries(brickSignaturesOfType)
    .filter(([name, sig]) => !sig.hidden)
    .map(([name, sig]) => {
      return { value: name, label: sig.name };
    });
  return (
    <>
      <div
        className={`add-brick-button ${
          !props.data.readonly && !props.data.small ? "active" : ""
        }`}
        onPointerUp={onAddButtonPointerUp}
        onPointerEnter={() => (isHovered = true)}
        onPointerLeave={() => (isHovered = false)}
      >
        +
      </div>
      {props.data.parentBrick && (
        <Handle type="target" position={Position.Top} />
      )}
      {isNodeTypeSelectorVisible && (
        <div
          className="brick-subtype-selector nowheel"
          onPointerUp={onSelectorPointerUp}
        >
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
