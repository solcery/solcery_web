class Game {
	objects = {}
  attrs = {};
	content = undefined;

  constructor(content) {
    this.content = content
    this.init()
  }

  createObject(tplId) {
    let objectId = Object.keys(this.objects).length + 1;
    let obj = {
      id: objectId,
      tplId: tplId,
      attrs: {}
    }
    this.objects[objectId] = obj
    return obj
  }

  createContext = (object, extra) => {
    var ctx = extra ? extra : {}
    ctx.object = object
    return ctx
  }

  initLayout = () => {
	  for (let cardPack of Object.values(this.content.cards)) { 
	    for (let i = 0; i < cardPack.amount; i++) {
	      let obj = createObject(cardPack.cardType);
        if (cardPack.initializer) {
          applyBrick(cardPack.initializer, createContext(obj, { vars : { cardNumber: i } } ));
        }
        if (cardType.action_on_create) {
          applyBrick(cardType.action_on_create, createContext(obj))
        }
	    }
	  }
  }

	useObject = (objectId) => {
		let object = this.objects[objectId]
		if (!object) throw new Error("Attempt to use unexistent object!")
		let ctx = createContext(object)
		let cardType = this.content.cardTypes[object.tplId]
    if (cardType.action) {
      runBrick(cardType.action, ctx)
    }
    // this.exportDiff(ctx)
    // return ctx.log
	}

  dragAndDropCard = (cardId, dragAndDropId, targetPlace) => {
    let object = this.objects[objectId]
    if (!object) throw new Error("Attempt to use unexistent object!")
    let ctx = createContext(object, { vars: { 'target_place': targetPlace } });
    let dragndrop = this.content.drag_n_drops.dragAndDropId
    if (dragndrop.action.on_drop) {
      runBrick(dragndrop.action_on_drop, ctx)
    }
  }

  playerCommand = (command) => {
    if (command.command_data_type == 0) {
      return this.useCard(command.object_id)
    }
    if (command.command_data_type == 2) {
      return this.dropCard(command.object_id, command.drag_drop_id, command.target_place_id)
    }
  }

  toObject() {
    let globalAttrs = []
    for (let [name, value] of Object.entries(this.attrs).values()) {
      globalAttrs.push({
        key: name,
        value: value
      })
    }
    let objects = []
    for (let obj of this.objects.values()) {
      let object = {
        id: obj.id,
        tplId: obj.tplId,
      }
      let attrs = []
      for (let [name, value] of Object.entries(obj.attrs).values()) {
        attrs.push({
          key: name,
          value: value
        })
      }
      object.attrs = attrs
      objects.push(object)
    }
    return {
      attrs: globalAttrs,
      objects: objects,
    }
  }

  toJSON() {
    return this.toObject()
  }


}