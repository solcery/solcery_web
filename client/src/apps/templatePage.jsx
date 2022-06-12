import { useParams } from 'react-router-dom';
import CollectionEditor from './collectionEditor';

export default function TemplatePage() {
	let { templateCode } = useParams();
	return <CollectionEditor templateCode={templateCode} moduleName={`template.${templateCode}`} />;
}
