// import './style.scss';
import { useState, useEffect, useRef } from 'react';
import { CaretRightOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const TestPage = () => {
  return(<Menu/>);
}

const AMPLITUDE = 7;
const NEW_AMPLITUDE = 3;
const NFT_PANEL_WIDTH = 1200;
const NFT_WIDTH = 200;
const MARGIN = 20;
const DELAY = 40;

const NftCard = (props) => {  

  let offset = Math.min((NFT_PANEL_WIDTH - NFT_WIDTH) / (props.total - 1), NFT_WIDTH + MARGIN);
  let globalOffset = 0;
  if (offset === NFT_WIDTH + MARGIN) {
    let requiredSpace = props.total * (NFT_WIDTH + MARGIN) - MARGIN;
    let remainingSpace = NFT_PANEL_WIDTH - requiredSpace;
    globalOffset = remainingSpace / 2;
  }
  
  let middleIndex = Math.floor(props.total / 2);
  let rotation = Math.floor((Math.random() * 2 - 1) * AMPLITUDE);
  let newRotation = Math.floor((Math.random() * 2 - 1) * NEW_AMPLITUDE);
  let animLength = DELAY * Math.abs(props.index - middleIndex);
  let style = {
    '--init-offset': (NFT_PANEL_WIDTH - NFT_WIDTH) / 2 + 'px',
    '--rotation': rotation + 'deg',
    '--offset': props.index * offset + globalOffset + 'px',
    '--transition-delay': DELAY * Math.abs(props.index - middleIndex) + 'ms',
    '--z-index': props.index + 10,
    '--new-rotation': newRotation + 'deg',
  }


  return <div className={`card`} style={style}>
    <div className={'card-face'} style = {{'--rotation': -newRotation + 'deg'}}>
      <img src={props.image} className='nft-image' onLoad={props.onLoad}/>
      <div className='nft-name'>
        {props.name}
      </div>
    </div>
  </div>;
}

const NftBar = (props) => {
  const [ open, setOpen ] = useState(false);
  const ref = useRef();
  const loaded = useRef(0);

  const onLoad = () => {
    loaded.current += 1;
    if (loaded.current === props.nfts.length) {
      delay(1000).then(() => setOpen(true));
    }
  }

  useEffect(() => {
    if (!open) return;
    if (!props.nfts) return;
    delay(DELAY * props.nfts.length / 2).then(() => {
      if (ref.current) {
        ref.current.className += ' active';
      }
    });
  }, [ open, props.nfts ])

  let className = 'cards-split';
  if (open) className = className + ' transition';

  return <div ref={ref} className={className}>
      {props.nfts.map((nft, index) => <NftCard 
          total={props.nfts.length}
          index={index}
          key={`nft_${index}`} 
          image={nft.image} 
          name={nft.name}
          onLoad={onLoad}
      />)}  
    </div>;
}

const Menu = (props) => {
  const [ started, setStarted ] = useState(false)

  const forgedNfts = [
    {
      image: 'https://pbs.twimg.com/media/E8-9bOnWYB0s1OW.jpg',
      name: 'Dape $1235',
    },
    {
      image: 'https://pbs.twimg.com/media/E8-9bOnWYB0s1OW.jpg',
      name: 'Dape $1235',
    },
    {
      image: 'https://pbs.twimg.com/media/E8-9bOnWYB0s1OW.jpg',
      name: 'Dape $1235',
    },
    {
      image: 'https://pbs.twimg.com/media/E8-9bOnWYB0s1OW.jpg',
      name: 'Dape $1235',
    },
    {
      image: 'https://pbs.twimg.com/media/E8-9bOnWYB0s1OW.jpg',
      name: 'Dape $1235',
    },
    {
      image: 'https://pbs.twimg.com/media/E8-9bOnWYB0s1OW.jpg',
      name: 'Dape $1235',
    },
    {
      image: 'https://pbs.twimg.com/media/E8-9bOnWYB0s1OW.jpg',
      name: 'Dape $1235',
    },
    {
      image: 'https://pbs.twimg.com/media/E8-9bOnWYB0s1OW.jpg',
      name: 'Dape $1235',
    }
  ]

  const start = () => {
    setStarted(true);
  }

  let buttonClassName = 'button-start';
  if (started) {
    buttonClassName += ' success';
  }
  return <div className='game-menu'>
    <div className='bg'></div>
    <div className='game-header'>
      Eclipse
    </div>
    {forgedNfts && <NftBar nfts={forgedNfts}/>}
    <div onClick={start} className={buttonClassName} href="#" role="button">
      <span className='label'>PLAY</span>
      <div className="icon">
        <CaretRightOutlined size='big' className='play'/>
        <Spin size='big' className='loading'/>
      </div>
    </div>
  </div>;
}