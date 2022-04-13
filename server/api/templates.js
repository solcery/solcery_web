const db = require("../db/connection");

const getAll = async function(response, params) {
    let result = db
    	.getDb("project_eclipse")
        .collection("templates")
        .find({})
        .toArray();
    response.json(await result)
}

module.exports = function(api) {
	api.templates = (params) => {
        if (params.command == 'getAll') return getAll;
    }
}
