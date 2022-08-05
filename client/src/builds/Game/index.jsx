import { Player } from '../../contexts/player';
import { GameTest } from '../../apps/game';

import './style.less';

export default function Game() {
	return (<Player>
		<GameTest/>
	</Player>);
}
