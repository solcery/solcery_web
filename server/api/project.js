const db = require("../db/connection");
var ObjectId = require('mongodb').ObjectId

const TEMPLATE_COLLECTION = 'templates';
const OBJECT_COLLECTION = 'objects';

const getAllTemplates = async function(response, params) {
    let result = db
    	.getDb(params.project)
        .collection(TEMPLATE_COLLECTION)
        .find({})
        .toArray();
    response.json(await result)
}

const dump = async function(respone, params) {
    let objects = await db
        .getDb(params.project)
        .collection(OBJECT_COLLECTION)
        .remove({});
   let templates = await db
        .getDb(params.project)
        .collection(OBJECT_COLLECTION)
        .remove({});
    response.json({ objects, templates })
}

const restore = async function(respone, params) {
    let { objects, templates } = params.src;

    await db // Removing all templates
        .getDb(params.project)
        .collection(TEMPLATE_COLLECTION)
        .remove({});

    await db // Removing all objects
        .getDb(params.project)
        .collection(OBJECT_COLLECTION)
        .remove({});

    let result = {};
    await db // Creating templates
        .getDb(params.project)
        .collection(TEMPLATE_COLLECTION)
        .insertMany(objects, function(err, res) {
          if (err) throw err;
          result.templates = res;
        });
    await db // Creating all objects
        .getDb(params.project)
        .collection(OBJECT_COLLECTION)
        .insertMany(objects, function(err, res) {
          if (err) throw err;
          result.objects = res;
        });
    response.json(result);
}

module.exports = function(api) {
	api.project = (params) => {
        if (params.command == 'getAllTemplates') return getAllTemplates;
        if (params.command == 'restore') return restore;
        if (params.command == 'dump') return dump;
    }
}
