routerAdd(
  'GET',
  '/backend/v1/cloudinary/signature',
  (e) => {
    const apiSecret = $os.getenv('CLOUDINARY_API_SECRET')
    if (!apiSecret) {
      throw new BadRequestError('CLOUDINARY_API_SECRET não configurado no servidor.')
    }
    const apiKey = '176365541131129'
    const cloudName = 'dbuklrpso'

    const timestamp = Math.floor(Date.now() / 1000).toString()
    const strToSign = 'timestamp=' + timestamp + apiSecret
    const signature = $security.sha256(strToSign)

    return e.json(200, {
      signature,
      timestamp,
      api_key: apiKey,
      cloud_name: cloudName,
    })
  },
  $apis.requireAuth(),
)
