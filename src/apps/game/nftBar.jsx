import { useState, useRef, useEffect } from 'react';
import { useGameApi } from '../../contexts/gameApi';
import { usePlayer } from '../../contexts/player';

import './style.scss';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


const AMPLITUDE = 7;
const NEW_AMPLITUDE = 3;
const NFT_PANEL_WIDTH = 120;
const NFT_WIDTH = 20;
const MARGIN = 2;
const DELAY = 40;

const NFT_PANEL_WIDTH_PORTRAIT = 80;
const NFT_WIDTH_PORTRAIT = 30;


const NftCard = (props) => {	

	let offset = Math.min((NFT_PANEL_WIDTH - NFT_WIDTH) / (props.total - 1), NFT_WIDTH + MARGIN);
	let offset_portrait = Math.min((NFT_PANEL_WIDTH_PORTRAIT - NFT_WIDTH_PORTRAIT) / (props.total - 1), NFT_WIDTH_PORTRAIT + MARGIN);
	let globalOffset = 0;
	let globalOffsetPortrait = 0;
	if (offset === NFT_WIDTH + MARGIN) {
		let requiredSpace = props.total * (NFT_WIDTH + MARGIN) - MARGIN;
		let remainingSpace = NFT_PANEL_WIDTH - requiredSpace;
		globalOffset = remainingSpace / 2;
	}

	if (offset_portrait === NFT_WIDTH_PORTRAIT + MARGIN) {
		let requiredSpacePortrait = props.total * (NFT_WIDTH_PORTRAIT + MARGIN) - MARGIN;
		let remainingSpacePortrait = NFT_PANEL_WIDTH_PORTRAIT - requiredSpacePortrait;
		globalOffsetPortrait = remainingSpacePortrait / 2;
	}
	
	let middleIndex = Math.floor(props.total / 2);
	let rotation = Math.floor((Math.random() * 2 - 1) * AMPLITUDE);
	let newRotation = Math.floor((Math.random() * 2 - 1) * NEW_AMPLITUDE);
	let animLength = DELAY * Math.abs(props.index - middleIndex);
	let style = {
		'--init-offset': (NFT_PANEL_WIDTH - NFT_WIDTH) / 2 + 'vh',
		'--rotation': rotation + 'deg',
		'--offset': props.index * offset + globalOffset + 'vh',
		'--offset-portrait': props.index * offset_portrait + globalOffsetPortrait + 'vw',
		'--transition-delay': DELAY * Math.abs(props.index - middleIndex) + 'ms',
		'--z-index': props.index + 10,
		'--new-rotation': newRotation + 'deg',
		cursor: props.url ? 'pointer' : 'auto',
	}

	return <a href={props.url} target='_blank' className={`card`} style={style} onClick={props.onClick}>
		<div className={'card-face'} style = {{'--rotation': -newRotation + 'deg'}}>
			<img src={props.image} className='nft-image' onLoad={props.onLoad}/>
			<div className='nft-name'>
				{props.name}
			</div>
		</div>
	</a>;
}

export const NftBar = (props) => {
	const [ open, setOpen ] = useState(false);
	const ref = useRef();
	const loaded = useRef(0);
	const { gameInfo } = useGameApi();
	const { nfts } = usePlayer();

	useEffect(() => {
		if (!open) return;
		if (!nfts) return;
		delay(DELAY * nfts.length / 2).then(() => {
			if (ref.current) {
				ref.current.className += ' active';
			}
		});
	}, [ open, nfts ])

	if (!nfts) return <></>;

	let className = 'cards-split';
	if (open) className = className + ' transition';

	let text = `Your NFTs supported by ${gameInfo.gameName}:`;
	// if (nfts.length === 0) {
	// 	text = `No suitable NFTs found. Supported collections:`;
	// 	nfts = gameInfo.supportedCollections;
	// }

	const onLoad = () => {
		loaded.current += 1;
		if (loaded.current >= nfts.length) {
			delay(100).then(() => setOpen(true));
		}
	}
	return <div ref={ref} className={className}>
		<div className={'cards-header'}>
			{text}
		</div>
		{nfts.map((nft, index) => <NftCard 
				total={nfts.length}
				index={index}
				key={`nft_${index}`} 
				image={nft.image} 
				name={nft.name}
				url={nft.magicEdenUrl}
				onLoad={onLoad}
		/>)}	
		{nfts.length === 0 && <div></div>}
	 </div>;
}