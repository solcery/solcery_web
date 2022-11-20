import './style.scss';

export const MenuButton = (props) => {
	return <div onClick={props.onClick} className="menu-button">
		{props.children}
	</div>
}