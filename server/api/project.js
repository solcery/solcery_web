const db = require("../db/connection");

const getAllTemplates = async function(response, params) {
    let result = db
    	.getDb("project_eclipse")
        .collection("templates")
        .find({})
        .toArray();
    response.json(await result)
}

module.exports = function(api) {
	api.project = (params) => {
        if (params.command == 'getAllTemplates') return getAllTemplates;
    }
}
