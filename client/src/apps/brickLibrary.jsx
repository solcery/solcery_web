import { useParams, useNavigate } from "react-router-dom";
import ObjectEditor from "./objectEditor";
import CollectionEditor from "./collectionEditor";
import { notify } from "../components/notification";
import { useBrickLibrary } from "../contexts/brickLibrary";

export function BrickLibraryCollectionEditor() {
  return (
    <CollectionEditor
      moduleName={"brickLibrary"}
      templateCode={"customBricks"}
    />
  );
}

export function BrickLibraryObjectEditor() {
  let { objectId } = useParams();
  const { load } = useBrickLibrary();

  const navigate = useNavigate();
  const onSave = () => {
    load();
    notify({
      message: "Brick updated",
      description: `${objectId}`,
      color: "#DDFFDD",
    });
    navigate(`/brickLibrary`);
  };
  return (
    <ObjectEditor
      templateCode={"customBricks"}
      objectId={objectId}
      onSave={onSave}
    />
  );
}
