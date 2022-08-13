export const migrator = (content) => {
	let templates = [];
	for (let tpl of content.templates) {
		tpl.revision = tpl.fields.length;
		templates.push(tpl)
	}
	return { templates };
};
