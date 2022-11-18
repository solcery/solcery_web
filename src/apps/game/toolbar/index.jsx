import { CloseIcon, BugIcon, QuestionMarkIcon, PlayIcon, HomeIcon, QuitIcon } from '../../../../components/icons';
import { useState} from 'react';
import "./style.scss";

export const Toolbar = () => {
	const [ active, setActive ] = useState(false);
	let className = active ? 'game-toolbar' : 'game-toolbar active';
	return <div className='game-toolbar'>
		<div className='btn-toolbar'>
			<BugIcon className='icon'/>
			<p className='btn-text'>Report a bug</p>
		</div>
		<div className='btn-toolbar'>
			<BugIcon className='icon'/>
			<p className='btn-text'>Report a bug</p>
		</div>
		<div className='btn-toolbar'>
			<BugIcon className='icon'/>
			<p className='btn-text'>Report a bug</p>
		</div>
	</div>
}

