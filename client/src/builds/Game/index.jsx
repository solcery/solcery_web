import { Player } from '../../contexts/player';
import { GameTest } from '../../apps/game';

export default function Game() {
	return (<Player>
		<GameTest/>
	</Player>);
}
