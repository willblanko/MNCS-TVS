routerAdd('POST', '/backend/v1/users/security-question', (e) => {
  const body = e.requestInfo().body
  if (!body.email) {
    throw new BadRequestError('E-mail é obrigatório.')
  }

  let question = 'Qual era o nome do seu primeiro animal de estimação?'
  try {
    const record = $app.findAuthRecordByEmail('_pb_users_auth_', body.email)
    const q = record.getString('security_question')
    if (q) question = q
  } catch (err) {
    // User not found, use default question to prevent enumeration
  }

  return e.json(200, { question })
})

routerAdd('POST', '/backend/v1/users/security-reset', (e) => {
  const body = e.requestInfo().body
  if (!body.email || !body.answer || !body.password) {
    throw new BadRequestError('Preencha todos os campos.')
  }

  let record
  try {
    record = $app.findAuthRecordByEmail('_pb_users_auth_', body.email)
  } catch (err) {
    throw new BadRequestError('Resposta incorreta ou usuário não encontrado.')
  }

  const expectedAnswer = record.getString('security_answer') || ''
  if (expectedAnswer.trim().toLowerCase() !== body.answer.trim().toLowerCase()) {
    throw new BadRequestError('Resposta incorreta ou usuário não encontrado.')
  }

  if (body.password !== body.passwordConfirm) {
    throw new BadRequestError('Senhas não coincidem.', {
      passwordConfirm: new ValidationError('validation_mismatch', 'As senhas não coincidem.'),
    })
  }

  if (body.password.length < 8) {
    throw new BadRequestError('Senha inválida', {
      password: new ValidationError(
        'validation_length',
        'A senha deve ter pelo menos 8 caracteres.',
      ),
    })
  }

  record.setPassword(body.password)
  $app.save(record)

  return e.json(200, { success: true })
})
