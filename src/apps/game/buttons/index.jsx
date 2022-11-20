import { usePlayer } from '../../../contexts/player';
import "./style.scss";

export const PlayButton = (props) => {
  const { playerRequest } = usePlayer();

  const joinQueue = () => playerRequest({
    type: 'joinQueue'
  })

  return <div className="cta" onClick={joinQueue}>
    <div className='btn-caption'>PLAY</div>
    <div className="arrows">
      <img src="right.png" className="arrow one"/>
      <img src="right.png" className="arrow two"/>
      <img src="right.png" className="arrow three"/>
    </div> 
  </div>
}

export const StopButton = () => {
  const { playerRequest } = usePlayer();

  const leaveQueue = () => playerRequest({
    type: 'leaveQueue'
  })
  
  return <div className="cta" onClick={leaveQueue}>
    <div className='btn-caption'>STOP</div>
    <div className="arrows">
      <img src="right.png" className="arrow one"/>
      <img src="right.png" className="arrow two"/>
      <img src="right.png" className="arrow three"/>
    </div> 
  </div>
}
