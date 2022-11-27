import { Header } from '../header';
import { useGameApi } from '../../../contexts/gameApi';
import { usePlayer } from '../../../contexts/player';
import { PlayButton, StopButton } from '../buttons';
import { BigLoader } from '../../../components/bigLoader';

import './style.scss';
import '../../../components/style.scss';

export const Lobby = () => {
  const { gameInfo } = useGameApi();
  const { status } = usePlayer();
  if (!gameInfo) return;
  const bgStyle = {
    backgroundImage: `url(${gameInfo.lobbyBackground})`,
  }

  let isOnline = status && status.code === 'online';
  let isQueued = status && status.code === 'queued';
  return <div className='lobby'>
      <Header/>
      <div className='lobby-body' style={bgStyle}>
        <div className='lobby-container'>
        </div>
      </div>
      <div className='lobby-footer'>
        {isOnline && <PlayButton/>}
        {isQueued && <StopButton/>}
        {isQueued && <div style={{ left: '0px' }}>
          <BigLoader className={'fade-in'} caption='Looking for an opponent...'/>
        </div>}
      </div>
  </div>;
}