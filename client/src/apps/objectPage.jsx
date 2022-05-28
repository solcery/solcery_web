import { useParams, useNavigate } from "react-router-dom";
import ObjectEditor from './objectEditor';

export default function ObjectPage() {
	let { templateCode, objectId } = useParams();
	const navigate = useNavigate();
	return (<ObjectEditor 
		templateCode = { templateCode } 
		objectId = { objectId }
		onSave = { () => { navigate(`/template.${templateCode}`) } }
	/>);
}
