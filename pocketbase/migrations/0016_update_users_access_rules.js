migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('_pb_users_auth_')
    collection.listRule =
      "id = @request.auth.id || @request.auth.role = 'admin' || @request.auth.email = 'triplemvv@gmail.com'"
    collection.viewRule =
      "id = @request.auth.id || @request.auth.role = 'admin' || @request.auth.email = 'triplemvv@gmail.com'"
    collection.updateRule =
      "id = @request.auth.id || @request.auth.role = 'admin' || @request.auth.email = 'triplemvv@gmail.com'"
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('_pb_users_auth_')
    collection.listRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    collection.viewRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    collection.updateRule = "id = @request.auth.id || @request.auth.role = 'admin'"
    app.save(collection)
  },
)
