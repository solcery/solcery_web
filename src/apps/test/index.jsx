// import './style.scss';
import { PlayButton, StopButton } from './components/button';
import './style.scss';
import { useAuth } from '../../contexts/auth';
import { Blackout } from '../../components/blackout';
import { MenuButton } from '../../components/menuButton';
import { Navigate } from 'react-router-dom';
import { LoadingWizard } from './components/loadingWizard';
import { GameHeader } from './components/gameHeader';
import { NftBar } from './components/nft';
import { Header } from './components/header';
import { Toolbar } from './components/toolbar';
import { BigLoader } from '../../components/bigLoader';
import { Countdown } from '../../components/countdown';
 

export const Lobby = () => {
  return <div className='game-menu'>
      <Header/>
      <div className='game-body'>
        <div className='game-centered'>
        </div>
      </div>
      <div className='game-footer'>
        <NftBar/>
        <PlayButton/>
      </div>
  </div>;
}

export const Matchmaking = () => {
  return <div className='game-menu'>
      <Header/>
      <div className='game-body'>
        <div className='game-centered'>
          <BigLoader/>
        </div>
      </div>
      <div className='game-footer'>
        <BigLoader caption={'Finding an opponent...'}/>
        {/*<NftBar/>*/}
        <StopButton/>
      </div>
  </div>;
}

export const Menu = () => {
  return <div className='game-menu'>
      <Header/>
      <div className='game-body'>
        <div className='game-centered'>
        </div>
      </div>
      <div className='game-footer'>
        <Blackout header='Match finished' message='You have left this game. Better luck next time! You have left this game. Better luck next time!'>
          <Countdown total={20} caption={'Exiting...'}/>
          <MenuButton>Home</MenuButton>
        </Blackout>
        {/*<NftBar/>*/}
        <StopButton/>
      </div>
  </div>;
}


export const Login = () => {
  const { AuthComponent, publicKey } = useAuth();
  if (publicKey) return <Navigate to={'/lobby'}/>
  return <div className='game-menu'>
      <Header/>
      <div className='game-body'>
        <div className='auth'>
          <div className='auth-header'>Login</div>
          <div className='auth-body'>
            <AuthComponent/>
          </div>
        </div>
      </div>
      <div className='game-footer'>  
      </div>
  </div>;
}

export const Loading = () => {
  return <div className='game-menu'>
      <Header/>
      <div className='game-body'>
        <div className='game-centered'>
          <LoadingWizard/>
        </div>
      </div>
      <div className='game-footer'>  
      </div>
  </div>;
}



