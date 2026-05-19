migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('tvs')
    collection.listRule = "@request.auth.id != ''"
    collection.viewRule = "@request.auth.id != ''"
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('tvs')
    collection.listRule = 'user = @request.auth.id'
    collection.viewRule = 'user = @request.auth.id || code = @request.query.code'
    app.save(collection)
  },
)
