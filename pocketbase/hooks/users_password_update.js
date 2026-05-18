routerAdd(
  'POST',
  '/backend/v1/users/{id}/password',
  (e) => {
    const id = e.request.pathValue('id')

    if (!e.auth) {
      throw new ForbiddenError('Autenticação necessária.')
    }

    const body = e.requestInfo().body
    if (!body.password || body.password.length < 8) {
      throw new BadRequestError('Senha inválida', {
        password: new ValidationError(
          'validation_length',
          'A senha deve ter pelo menos 8 caracteres.',
        ),
      })
    }

    if (body.password !== body.passwordConfirm) {
      throw new BadRequestError('Senhas não coincidem', {
        passwordConfirm: new ValidationError('validation_mismatch', 'As senhas não coincidem.'),
      })
    }

    const record = $app.findRecordById('users', id)
    record.setPassword(body.password)
    $app.save(record)

    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)
