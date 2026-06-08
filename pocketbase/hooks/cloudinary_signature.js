routerAdd(
  'GET',
  '/backend/v1/cloudinary/signature',
  (e) => {
    const apiSecret = $secrets.get('CLOUDINARY_API_SECRET') || 'vUDKKAoVCkZFklDrShrLWD16eqk'
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
