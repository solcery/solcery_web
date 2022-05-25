const db = require("../db/connection");
var ObjectId = require('mongodb').ObjectId

const getAllTemplates = async function(response, params) {
    let result = db
    	.getDb("project_eclipse")
        .collection("templates")
        .find({})
        .toArray();
    response.json(await result)
}

const removeAllTemplates = async function(response, params) {
    let result = db
        .getDb("project_eclipse")
        .collection("templates")
        .remove({});
    response.json(await result)
}

const removeAllObjects = async function(response, params) {
    let result = db
        .getDb("project_eclipse")
        .collection("objects")
        .remove({});
    response.json(await result)
}

const createManyTemplates = async function(response, params) { // TODO: validate
    let objects = params.templates.map(template => {
        return Object.assign({ _id: new ObjectId() }, template)
    })
    db
        .getDb("project_eclipse")
        .collection('templates')
        .insertMany(objects, function(err, res) {
          if (err) throw err;
          response.json(res);
        });
}

const importContent = async function(response, params) { // TODO: validate
    let ids = params.objects.map(object => {
        return {
            old: object.id,
            new: new ObjectId(),
        }
    })
    let stringContent = JSON.stringify(params.objects);
    ids.forEach(idPair => {
        let regex = RegExp(`\\[\\-${idPair.old}\\-\\]`, "g");
        stringContent = stringContent.replace(regex, idPair.new); 
    })
    let objects = JSON.parse(stringContent);
    for (let object of objects) {
        object._id = ids.find(idPair => object.id === idPair.old).new;
        object.id = undefined;
    }
    db
        .getDb("project_eclipse")
        .collection('objects')
        .insertMany(objects, function(err, res) {
          if (err) throw err;
          response.json(res);
        });
}

module.exports = function(api) {
	api.project = (params) => {
        if (params.command == 'getAllTemplates') return getAllTemplates;
        if (params.command == 'removeAllTemplates') return removeAllTemplates;
        if (params.command == 'removeAllObjects') return removeAllObjects;
        if (params.command == 'createManyTemplates') return createManyTemplates;
        if (params.command == 'importContent') return importContent;
    }
}
