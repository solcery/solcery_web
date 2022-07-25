import { Wallet } from '../../contexts/wallet';
import { GameTest } from '../../apps/game';

export default function Game() {
	return (<Wallet>
		<GameTest/>
	</Wallet>);
}
