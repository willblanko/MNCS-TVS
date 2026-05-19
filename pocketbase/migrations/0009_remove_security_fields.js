migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    if (col.fields.getByName('security_question')) {
      col.fields.removeByName('security_question')
    }
    if (col.fields.getByName('security_answer')) {
      col.fields.removeByName('security_answer')
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('users')
    if (!col.fields.getByName('security_question')) {
      col.fields.add(new TextField({ name: 'security_question', required: false }))
    }
    if (!col.fields.getByName('security_answer')) {
      col.fields.add(new TextField({ name: 'security_answer', required: false }))
    }
    app.save(col)
  },
)
