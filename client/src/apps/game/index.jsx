import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react/lib/cjs';

export const GameTest = () => {
	const { publicKey } = useWallet();

	useEffect(() => {
		if (!publicKey) return;
		console.log(publicKey.toBase58())
	}, [ publicKey ])

	return <>GameTest</>;
}