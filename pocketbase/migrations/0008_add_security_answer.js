migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!collection.fields.getByName('security_answer')) {
      collection.fields.add(
        new TextField({
          name: 'security_answer',
          required: false,
        }),
      )
      app.save(collection)
    }
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('_pb_users_auth_')

    if (collection.fields.getByName('security_answer')) {
      collection.fields.removeByName('security_answer')
      app.save(collection)
    }
  },
)
