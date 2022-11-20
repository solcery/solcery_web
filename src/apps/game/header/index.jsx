// import { Toolbar } from '../toolbar';
import { useGameApi } from '../../../contexts/gameApi';
import "./style.scss";

export const Header = () => {
  const { gameInfo } = useGameApi();
  if (!gameInfo) return;
  return <div className='lobby-header'>
    <div className='lobby-game-name'>
      {gameInfo.gameName}
    </div>
    <div className='lobby-game-version'>
       <span>{gameInfo.gameVersion}</span>
    </div>
  </div>
}