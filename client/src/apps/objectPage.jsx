import { useParams, useNavigate } from "react-router-dom";
import ObjectEditor from "./objectEditor";
import { notify } from "../components/notification";


export default function ObjectPage() {
  const navigate = useNavigate();
  let { templateCode, objectId } = useParams();
  const onSave = () => {
    notify({
      message: "Object updated",
      description: `${objectId}`,
      color: "#DDFFDD",
    });
    navigate(`../template.${templateCode}`);
  };
  return (
    <ObjectEditor
      templateCode={templateCode}
      objectId={objectId}
      onSave={onSave}
    />
  );
}
