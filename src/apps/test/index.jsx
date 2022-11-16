// import './style.scss';
import { PlayButton, StopButton } from './components/button';
import { Loader } from './components/loader';
import './style.scss';
import { useAuth } from '../../contexts/auth';
import { Navigate } from 'react-router-dom';
import { LoadingWizard } from './components/loadingWizard';
import { GameHeader } from './components/gameHeader';
import { NftBar } from './components/nft';
import { Header } from './components/header';
import { Toolbar } from './components/toolbar';


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
          <Loader/>
        </div>
      </div>
      <div className='game-footer'>
        <NftBar/>
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



