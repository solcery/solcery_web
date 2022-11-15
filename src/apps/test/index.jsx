// import './style.scss';

import './style.scss';


const PlayButton = () => {
  return <a className="cta" href="#">
    <span>PLAY</span>
    <span className="arrows">
      <img src="right.png" className="arrow one"/>
      <img src="right.png" className="arrow two"/>
      <img src="right.png" className="arrow three"/>
    </span> 
  </a>
}

export const TestPage = () => {
  return <div className='game-menu'>
      <div className='game-header'>
        Summoner
        <div className='game-subheader'>
           17.3
        </div>
      </div>
      <div className='bg'>

      </div>
      <div className='game-footer'>
        <PlayButton/>
      </div>
  </div>;
}

