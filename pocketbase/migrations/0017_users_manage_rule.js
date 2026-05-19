migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('users')

    // As in PocketBase auth collections, the email is hidden by default for non-owners.
    // We need to set the manageRule so administrators can view other users' emails.
    col.manageRule =
      "id = @request.auth.id || @request.auth.role = 'admin' || @request.auth.email = 'triplemvv@gmail.com'"

    // We also explicitly reinforce the list and view rules to fulfill the acceptance criteria.
    col.listRule =
      "id = @request.auth.id || @request.auth.role = 'admin' || @request.auth.email = 'triplemvv@gmail.com'"
    col.viewRule =
      "id = @request.auth.id || @request.auth.role = 'admin' || @request.auth.email = 'triplemvv@gmail.com'"

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    col.manageRule = null
    app.save(col)
  },
)
