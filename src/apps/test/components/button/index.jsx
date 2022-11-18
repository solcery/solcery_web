import "./style.scss";

export const PlayButton = () => {
  return <a className="cta" href="matchmaking">
    <div className='btn-caption'>PLAY</div>
    <div className="arrows">
      <img src="right.png" className="arrow one"/>
      <img src="right.png" className="arrow two"/>
      <img src="right.png" className="arrow three"/>
    </div> 
  </a>
}

export const StopButton = () => {
  return <a className="cta" href="lobby">
    <div className='btn-caption'>STOP</div>
    <div className="arrows">
      <img src="right.png" className="arrow one"/>
      <img src="right.png" className="arrow two"/>
      <img src="right.png" className="arrow three"/>
    </div> 
  </a>
}
