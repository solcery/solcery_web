module.exports = (session, requestData) => {
	console.log('game/auth')
	console.log(session, requestData)
	requestData.pubkey = session;
}