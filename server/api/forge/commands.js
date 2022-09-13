const commands = {};

commands.getPlayerNfts = {
	params: {
		publicKey: {
			required: true
		}
	}
}

commands.getForgedNftsByMints = {
	params: {
		mints: {
			required: true
		}
	}
}

module.exports = commands;
