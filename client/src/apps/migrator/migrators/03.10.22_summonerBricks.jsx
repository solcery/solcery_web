const healOld = 'custom.633a20eb6452720146ece558'; //hp
const dmgOld = 'custom.633a20eb6452720146ece559'; //dmg
const goldOld = 'custom.633a20eb6452720146ece553'; //money
const drawOld = 'custom.633a20eb6452720146ece54f'; //amount

const healNew = 'custom.6339c351e939cd2ea1d0d868'; //Player, Amount
const dmgNew = 'custom.6339c152712fd8c1f351c8ea'; //Player, Amount
const goldNew = 'custom.6339c3a5eaaa5e6105ec3675'; //Player, Amount
const drawNew = 'custom.6339d8b61cb1022a4ada1544'; //Player, Amount

const currentPlayer = 'custom.6339dd5d8ebb3952a77f234b';
const enemyPlayer = 'custom.6339dd34f9e0d2c7e009ac2b';

// {"lib":"action","func":"two","params":{"action1":{"lib":"action","func":"set_var","params":{"var_name":"money","value":{"lib":"value","func":"const","params":{"value":1}}}},"action2":{"lib":"action","func":"custom.633a20eb6452720146ece553","params":{}}}}

const migrateBrick = (bt) => {
	let changed = false;
	if (bt.lib === 'action' && bt.func === 'two') {
		console.log('ACTION TWO')
		let action1 = bt.params.action1;
		let action2 = bt.params.action2;
		console.log(action1, action2)
		if (action2.func === healOld) {
			if (action1.func === 'set_var' && action1.params.var_name === 'hp') {
				bt.func = healNew;
				bt.params = {
					Player: {
						lib: 'value',
						func: currentPlayer,
						params: {}
					},
					Amount: action1.params.value,
				}
				return true;
			}
		}
		if (action2.func === goldOld) {
			console.log('goldOld')
			if (action1.func === 'set_var' && action1.params.var_name === 'money') {
				bt.func = goldNew;
				bt.params = {
					Player: {
						lib: 'value',
						func: currentPlayer,
						params: {}
					},
					Amount: action1.params.value,
				}
				return true;
			}
		}
		if (action2.func === drawOld) {
			if (action1.func === 'set_var' && action1.params.var_name === 'amount') {
				bt.func = drawNew;
				bt.params = {
					Player: {
						lib: 'value',
						func: currentPlayer,
						params: {}
					},
					Amount: action1.params.value,
				}
				return true;
			}
		}
		if (action2.func === dmgOld) {
			if (action1.func === 'set_var' && action1.params.var_name === 'dmg') {
				bt.func = dmgNew;
				bt.params = {
					Player: {
						lib: 'value',
						func: enemyPlayer,
						params: {}
					},
					Amount: action1.params.value,
				}
				return true;
			}
			if (action1.func === 'two') {
				let subaction1 = action1.params.action1;
				let subaction2 = action1.params.action2;
				if (subaction1.func === 'set_var' && subaction1.params.var_name === 'dmg' && subaction2.func === 'set_var' && subaction2.params.var_name === 'self') {
					bt.func = dmgNew;
					bt.params = {
						Player: {
							lib: 'value',
							func: currentPlayer,
							params: {}
						},
						Amount: subaction1.params.value,
					}
					return true;
				}
				if (subaction2.func === 'set_var' && subaction2.params.var_name === 'dmg' && subaction1.func === 'set_var' && subaction1.params.var_name === 'self') {
					bt.func = dmgNew;
					bt.params = {
						Player: {
							lib: 'value',
							func: currentPlayer,
							params: {}
						},
						Amount: subaction2.params.value,
					}
					return true;
				}
			}
			
		}
	}
	if (bt.lib === 'action' && bt.func === 'void') {
		if (!bt.params) {
			bt.params = {};
			return true;
		}
	}
	for (let param of Object.values(bt.params)) {
		if (param && param.lib) {
			if (migrateBrick(param)) {
				changed = true
			}
		}
	}
	return changed;
};

export const migrator = (content) => {
	let objects = [];
	for (let object of content.objects) {
		let changed = false;
		for (let [field, value] of Object.entries(object.fields)) {
			if (value && value.brickTree) {
				if (migrateBrick(value.brickTree)) {
					changed = true;
				}
			}
		}
		if (changed) objects.push(object);
	}
	return { objects };
};
