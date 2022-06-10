import { execute, SString } from '../../content';

const migrateFields = (object, meta) => {
  if (object.template === 'cardTypes') {
    if (object.fields.action_on_token_added) {
      object.fields.action_on_token_linked = object.fields.action_on_token_added;
      object.fields.action_on_token_added = undefined;
      meta.objects.push(object);
    }
  }
}

export const migrator = (content) => {
  let meta = {
    content,
    objects: []
  }
  execute(migrateFields, meta)
  return meta.objects;
}
