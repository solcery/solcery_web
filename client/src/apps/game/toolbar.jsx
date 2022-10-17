const Toolbar = (props) => {
	const [ showRules, setShowRules ] = useState(false);
	const [ showBugReport, setShowBugReport ] = useState(false);
	const { gameInfo } = useGameApi();
	const { publicKey, disconnect } = useAuth();

	if (!gameInfo) return <></>;

	let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
	return <>
		{!isMobile && showRules && <RulesIframe src={gameInfo.rulesUrl} onClose={() => setShowRules(false)}/>}
		<BugReportPopup visible={showBugReport} onClose={() => setShowBugReport(false)}/>
		<div className='game-toolbar'>
			<div className='btn-toolbar' onClick={() => setShowBugReport(true)}>
				<BugIcon className='icon'/>
				<p className='btn-text'>Report a bug</p>
			</div>
			{gameInfo.rulesUrl && 
				isMobile ? 
				<a className='btn-toolbar' href={gameInfo.rulesUrl} target='_blank'>
					<QuestionMarkIcon size='big' className='icon'/>
					<p className='btn-text'>How to play</p>
				</a>
				: <div className='btn-toolbar' onClick={() => setShowRules(true)}>
					<QuestionMarkIcon size='big' className='icon'/>
				<p className='btn-text'>How to play</p>
			</div>}
			{props.gameReady && <div className='btn-toolbar' onClick={props.onLeaveGame}>
				<CloseIcon size='big' className='icon'/>
				<p className='btn-text'>Quit game</p>
			</div>}
			{!props.gameReady && publicKey && <div className='btn-toolbar' onClick={disconnect}>
				<QuitIcon size='big' className='icon'/>
				<p className='btn-text'>Sign out</p>
			</div>}
		</div>
	</>
}


const RulesIframe = (props) => {
	return <>
		<div className='popup-blackout' onClick={props.onClose}>
				<div className='popup-frame'>
					<div className='popup-title'>
						<CloseIcon className='popup-close' size='big' onClick={props.onClose}/>
						How to play
					</div>
					<iframe className='popup-rules-iframe' src={props.src}/>
				</div>

		</div>
	</>;
}

const BugReportPopup = (props) => {
	let [ sent, setSent ] = useState(false);
	let [ message, setMessage ] = useState(false);
	let [ contacts, setContacts ] = useState(false);
	const { gameApi } = useGameApi();
	const { publicKey } = usePlayer();

	const send = () => {
		if (!message) {
			notify({
				message: `No message`,
				description: "Please specify the problem you've encountered",
				type: 'warning',
			});
			return;
		}
		setSent(true);
		let payload = {
			publicKey,
			message,
			contacts,
		}
		gameApi.game.bugreport({ payload }).then(() => {
			notify({
				message: `Bug report sent`,
				description: 'Thank you for your feedback!',
				type: 'success',
			});
			props.onClose();
		})
	}

	return <Modal 
		title='Report a bug' 
		visible={props.visible}
		okText='Send'
		okButtonProps={{
			icon: <SendOutlined/>
		}}
		onOk={send}
		onCancel={props.onClose}
		onClose={props.onClose}
		>
		<Space style={{ width: '100%' }} direction='vertical'>
			Description
			<Input.TextArea 
				onChange={(e) => setMessage(e.target.value)}
				className='message'
				placeholder='Specify the problem for us'
			/>
			<Space/>
			Contact information (optional)
			<Input 
				className='contact'
				onChange={(e) => setContacts(e.target.value)}
				placeholder='Discord tag, email, etc'
			/>
			<Space/>
		</Space>
	</Modal>;
}