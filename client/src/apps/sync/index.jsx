import { Button, Select, Input} from 'antd';
import { useState, useEffect } from 'react';
import { useProject } from '../../contexts/project';
import { useBrickLibrary } from '../../contexts/brickLibrary';
import { ObjectId } from "mongodb";

import ruleset from './summoner_ruleset.json';

const { TextArea } = Input;
const { Option } = Select;

// 0 - 15 custom




const handleRuleset = (ruleset, brickLibrary) => {
	const objects = [];
	let index = 0;
	console.log(ruleset.CardTypes)
	for (let i = 0; i < ruleset.CardTypes.length; i++) {
		let metadata = ruleset.CardTypes[i].Metadata;
		let now = Math.floor(Date.now() / 1000);
		if (i < 16) {
			objects.push({
				_id: ObjectId().toString(),
				template: 'customBricks',
				fields: {
					creationTime: now,
					name: 'AUTO ' + metadata.Name,
					enabled: true,
					description: metadata.Description,
					brick: undefined,
				}
			})
		} else {
			objects.push({
				_id: ObjectId().toString(),
				template: 'cardTypes',
				fields: {
					creationTime: now,
					name: metadata.Name,
					enabled: true,
					type: 1,
					displayed_name: metadata.Name,
					displayed_type: 'Creature',
					description: metadata.Description,
					action_on_activation: undefined,
				}
			})
		}

		// TODO: coins
	}

	const brick_handlers = {}

	const handle_brick = (oldBrick) => {
		let Type = oldBrick.Type;
		let Subtype = oldBrick.Subtype;
		let name = `${Type}_${Subtype}`;
		let handler = brick_handlers[name];
		if (handler) {
			return handler(oldBrick);
		}
		return handle_default(oldBrick)
	}

	const handle_default = (oldBrick) => {
		let Type = oldBrick.Type;
		let Subtype = oldBrick.Subtype;
		const config = brickConfigs.find(elem => elem.Type === Type && elem.Subtype === Subtype);
		if (!config) throw new Error('ERR');

	    let params = {}
	    if (config.default) {
	    	Object.assign(params, config.default);
	    }
	    if (config.FieldType === 1) {
	    	params[config.field] = oldBrick.IntField;
	    }
	    if (config.FieldType === 2) {
	    	params[config.field] = oldBrick.StringField;
	    }
	    if (config.Slots) {
	    	for (let i = 0; i < config.Slots.length; i++) {
	    		let fieldName = config.Slots[i];
	    		let brick = oldBrick.Slots[i];
	    		params[fieldName] = handle_brick(brick);
	    	}
	    }
	    return {
	    	lib: config.lib,
	    	func: config.func,
	    	params,
	    }
	}

	// { subtype: 4, type: 0, Type: 0, Subtype: 4, FieldType: 1, Slots: 0, }, //Card => console.log
	brick_handlers['0_4'] = (oldBrick) => {
		const index = oldBrick.IntField;
		if (index > 15) {
			return {
				lib: 'action',
				func: 'void',
				params: {}
			}
		}
		const customBrickId = objects[index]._id;
		return {
			lib: 'action',
			func: `custom.${customBrickId}`,
			params: {},
		}
	}

	// 6339bc6d0de373c92d7b6e5f - player HP
	// 6339c351e939cd2ea1d0d868 - heal
	// 6339c152712fd8c1f351c8ea - damage
	// 6339be37efd146c72f033464 - set hp


	// 6339bd9a57e3bc50b1e4ff8f - player gold
	// 6339c3a5eaaa5e6105ec3675 - add gold
	// 6339c41bb391bc717be3e38e - remove gold
	// 6339beaa2e3eebec15727a3b - set gold

	// 0 - active, 1 - hp, 2 - mana

	const handle_change_attr = (oldBrick, hp, gold, lib) => {
		const attrIndex = oldBrick.IntField;
		if (attrIndex === 0 || attrIndex > 2) {
			return {
				lib: 'action',
				func: 'void'
			}
		}
		const res = {
			lib: 'action',
			params: {
				Player: handle_brick(oldBrick.Slots[0]),
				Value: handle_brick(oldBrick.Slots[1])
			}
		}

		if (attrIndex === 1) { // hp
			res.func = `custom.${hp}`;
		}
		if (attrIndex === 2) { // gold
			res.func = `custom.${gold}`;
		}
		return res;
	}

	brick_handlers['2_100'] = (oldBrick) => {
		const attrIndex = oldBrick.IntField;
		if (attrIndex === 0 || attrIndex > 2) {
			return {
				lib: 'value',
				func: 'const',
				params: {
					value: 0
				}
			}
		}
		const res = {
			lib: 'value',
			params: {
				Player: handle_brick(oldBrick.Slots[0])
			}
		}

		if (attrIndex === 1) { // hp
			res.func = `custom.6339bc6d0de373c92d7b6e5f`;
		}
		if (attrIndex === 2) { // gold
			res.func = `custom.6339bd9a57e3bc50b1e4ff8f`;
		}
		return res;
	}

	brick_handlers['0_101'] = (oldBrick) => {  //SetPlayerAttr
		return handle_change_attr(oldBrick, '6339be37efd146c72f033464', '6339beaa2e3eebec15727a3b')
	}


	brick_handlers['0_102'] = (oldBrick) => {  //AddPlayerAttr
		return handle_change_attr(oldBrick, '6339c351e939cd2ea1d0d868', '6339c3a5eaaa5e6105ec3675')
	}

	brick_handlers['0_104'] = (oldBrick) => {  //SubPlayerAttr
		return handle_change_attr(oldBrick, '6339c152712fd8c1f351c8ea', '6339c41bb391bc717be3e38e')
	}

	brick_handlers['0_103'] = (oldBrick) => {
		const condition = {
			lib: 'condition',
			func: 'custom.6305d16a7a891ee18b6d4b2d',
			params: {
				'Place Id': handle_brick(oldBrick.Slots[0]),
			}
		}
		const action = handle_brick(oldBrick.Slots[1]);
		const limit = handle_brick(oldBrick.Slots[2]);
		return {
			lib: 'action',
			func: 'iter',
			params: {
				condition,
				action,
				limit,
			}
		}
	}
    
	const brickConfigs = [
	    //Actions
	    { lib: 'action', func: 'void', Type: 0, Subtype: 0, FieldType: 0, Slots: 0, }, //Void
	    { lib: 'action', func: 'two', Type: 0, Subtype: 1, FieldType: 0, Slots: [ 'action1', 'action2' ] }, //Set
	    { lib: 'action', func: 'if_then', Type: 0, Subtype: 2, FieldType: 0, Slots: [ 'if', 'then', 'else' ] }, //Conditional
	    { lib: 'action', func: 'loop', Type: 0, Subtype: 3, FieldType: 0, Slots: [ 'iterations', 'action'] }, //Loop skip first - counter var
	    { lib: 'action', func: 'set_var', Type: 0, Subtype: 6, field: 'var_name', FieldType: 2, Slots: ['value'], }, //Set context var
	    { lib: 'action', func: 'custom.63053cbcbca868d6b8e40ab6', Type: 0, Subtype: 100, FieldType: 0, Slots: ['Dest Place'], }, //MoveTo
		{ lib: 'action', func: 'console_log', Type: 0, Subtype: 5, field: 'message', FieldType: 2, Slots: 0, default: { level: 1 }}, //Show message => ???

	    //Conditions
	    { lib: 'condition', func: 'custom.6305d22963590279329c0bd7', Type: 1, Subtype: 0, FieldType: 0, Slots: 0, }, //True
	    { lib: 'condition', func: 'custom.6305d24d1911c1b8d049edb8', Type: 1, Subtype: 1, FieldType: 0, Slots: 0, }, //False
	    { lib: 'condition', func: 'or', Type: 1, Subtype: 2, FieldType: 0, Slots: ['cond1', 'cond2'] }, //Or
	    { lib: 'condition', func: 'and', Type: 1, Subtype: 3, FieldType: 0, Slots: ['cond1', 'cond2'] }, //And
	    { lib: 'condition', func: 'not', Type: 1, Subtype: 4, FieldType: 0, Slots: ['condition'], }, //Not
	    { lib: 'condition', func: 'eq', Type: 1, Subtype: 5, FieldType: 0, Slots: ['value1', 'value2'] }, //Equal
	    { lib: 'condition', func: 'gt', Type: 1, Subtype: 6, FieldType: 0, Slots: ['value1', 'value2'] }, //GreaterThan
	    { lib: 'condition', func: 'lt', Type: 1, Subtype: 7, FieldType: 0, Slots: ['value1', 'value2'] }, //LesserThan
	    { lib: 'condition', func: 'custom.6305d16a7a891ee18b6d4b2d', Type: 1, Subtype: 100, FieldType: 0, Slots: [ 'Place Id' ] }, //IsAtPlace

	    //Values
	    { lib: 'value', func: 'const', field: 'value', Type: 2, Subtype: 0, FieldType: 1, Slots: 0, }, //Const,
	    { lib: 'value', func: 'if_then', Type: 2, Subtype: 1, FieldType: 0, Slots: [ 'if', 'then', 'else' ] }, //Conditional
	    { lib: 'value', func: 'add', Type: 2, Subtype: 2, FieldType: 0, Slots: [ 'value1', 'value2' ] }, //Add
	    { lib: 'value', func: 'sub', Type: 2, Subtype: 3, FieldType: 0, Slots: [ 'value1', 'value2' ] }, //Sub
	    { lib: 'value', func: 'var', Type: 2, Subtype: 4, field: 'var_name', FieldType: 2, Slots: 0 }, //GetCtxVar
	    { lib: 'value', func: 'random', Type: 2, Subtype: 5, FieldType: 0, Slots: [ 'from', 'to' ] }, //Random
	    { lib: 'value', func: 'mul', Type: 2, Subtype: 6, FieldType: 0, Slots: [ 'value1', 'value2' ] }, //Mul
	    { lib: 'value', func: 'div', Type: 2, Subtype: 3, FieldType: 0, Slots: [ 'value1', 'value2' ] }, //Div
	    { lib: 'value', func: 'mod', Type: 2, Subtype: 2, FieldType: 0, Slots: [ 'value1', 'value2' ] }, //Modulo

	    { lib: 'value', func: 'attr', Type: 2, Subtype: 101, FieldType: 0, Slots: 0, default: { attr_name: '6339ff4c8a9ac84b9dd9b943' } }, //GetPlayerIndex
    	{ lib: 'value', func: 'custom.6305d1a233a2f7f3eb4234ad', Type: 2, Subtype: 103, FieldType: 0, Slots: 0, }, //CurrentPlace
    	{ lib: 'value', func: 'custom.6339dd5d8ebb3952a77f234b', Type: 2, Subtype: 105, FieldType: 0, Slots: 0, }, //CasterPlayerIndex


	    { lib: 'value', func: 'custom.6339d60db391bc717be3e3a9', Type: 2, Subtype: 102, FieldType: 0, Slots: ['Target Place'], default: {
	    	Cond: { lib: 'condition', func: 'custom.6305d22963590279329c0bd7', params: {}}
	    } }, //GetCardsAmount

	]

	for (let lib of Object.values(brickLibrary)) {
		for (let brick of Object.values(lib)) {
			if (brick.type !== undefined && brick.subtype !== undefined) {
				let brickConfig = brickConfigs.find(elem => elem.type === brick.type && elem.subtype === brick.subtype);
				if (brickConfig) {
					// console.log(brickConfig)
				}
			}
		}
	}
	
	for (let i = 0; i < ruleset.CardTypes.length; i++) {
		let oldBrick = ruleset.CardTypes[i].BrickTree.Genesis;
		let metadata = ruleset.CardTypes[i].Metadata;
		if (i < 16) {
			objects[i].fields.brick = {
				brickTree: handle_brick(oldBrick),
				brickParams: [],
			}
		} else {
			objects[i].fields.action_on_activation = {
				brickTree: handle_brick(oldBrick),
				brickParams: [],
			}
			objects[i].fields.action_on_create = {
				brickParams: [],
				brickTree: {
					lib: 'action',
					func: 'set_attr',
					params: {
						attr_name: '6339cdeeeaaa5e6105ec367d',
						value: {
							lib: 'value',
							func: 'const',
							params: {
								value: metadata.Coins
							}
						}
					}
				}
			}
		}
	}
	return objects;


}






export function ContentImporter() {
	const [contentDump, setContentDump] = useState();
	const { sageApi } = useProject();
	const { brickLibrary } = useBrickLibrary();

	const importContent = () => {
		// if (!brickLibrary) throw new Error('NO LIBRARY');
		let src = JSON.parse(contentDump);
		// let objects = handleRuleset(ruleset, brickLibrary)
		// for (let obj of objects) {
		// 	src.objects.push(obj);
		// }
		sageApi.project.restore({ src });
	};

	return (
		<>
			<h1>Import content</h1>
			<TextArea placeholder="Paste content dump here" rows={10} onChange={(e) => setContentDump(e.target.value)} />
			<Button onClick={importContent}> Import </Button>
		</>
	);
}

export function ContentExporter() {
	const [exportType, setExportType] = useState('full');
	const { sageApi } = useProject();

	const exportContent = async () => {
		let params = {
			objects: exportType === 'full' || exportType === 'objects',
			templates: exportType === 'full' || exportType === 'templates',
		};
		let content = await sageApi.project.getContent(params);
		let projectId = sageApi.projectId;

		let date = Date.now();
		let data = JSON.stringify(content, undefined, 2);
		const element = document.createElement('a');
		const file = new Blob([data], { type: 'text/plain' });
		element.href = URL.createObjectURL(file);
		element.download = `content_dump_${projectId}_${date}.json`; // TODO: add_date and project
		document.body.appendChild(element); // Required for this to work in FireFox
		element.click();
	};

	return (
		<>
			<h1>Export content</h1>
			<Select onChange={setExportType} defaultValue="full">
				<Option value="full">Full</Option>
				<Option value="templates">Templates</Option>
				<Option value="objects">Objects</Option>
			</Select>
			<p> EXPORT CONTENT: </p>
			<Button onClick={exportContent}> Export </Button>
		</>
	);
}

