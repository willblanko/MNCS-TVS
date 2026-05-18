migrate(
  (app) => {
    // Legacy assets from Cloudinary account (djr83woxh)
    const legacyAssets = [
      {
        public_id: 'cld-sample',
        format: 'jpg',
        resource_type: 'image',
        url: 'https://res.cloudinary.com/djr83woxh/image/upload/v1/cld-sample.jpg',
      },
      {
        public_id: 'cld-sample-2',
        format: 'jpg',
        resource_type: 'image',
        url: 'https://res.cloudinary.com/djr83woxh/image/upload/v1/cld-sample-2.jpg',
      },
      {
        public_id: 'cld-sample-3',
        format: 'jpg',
        resource_type: 'image',
        url: 'https://res.cloudinary.com/djr83woxh/image/upload/v1/cld-sample-3.jpg',
      },
      {
        public_id: 'cld-sample-4',
        format: 'jpg',
        resource_type: 'image',
        url: 'https://res.cloudinary.com/djr83woxh/image/upload/v1/cld-sample-4.jpg',
      },
      {
        public_id: 'cld-sample-5',
        format: 'jpg',
        resource_type: 'image',
        url: 'https://res.cloudinary.com/djr83woxh/image/upload/v1/cld-sample-5.jpg',
      },
      {
        public_id: 'elephants',
        format: 'mp4',
        resource_type: 'video',
        url: 'https://res.cloudinary.com/djr83woxh/video/upload/v1/samples/elephants.mp4',
      },
      {
        public_id: 'sea-turtle',
        format: 'mp4',
        resource_type: 'video',
        url: 'https://res.cloudinary.com/djr83woxh/video/upload/v1/samples/sea-turtle.mp4',
      },
    ]

    let user
    try {
      user = app.findAuthRecordByEmail('_pb_users_auth_', 'ilopes@lclaw.com.br')
    } catch (_) {
      // Admin user not found, aborting seed
      return
    }

    const filesCol = app.findCollectionByNameOrId('files')

    for (const asset of legacyAssets) {
      // Idempotency: skip if file already exists
      try {
        app.findFirstRecordByData('files', 'url', asset.url)
        continue
      } catch (_) {}

      const record = new Record(filesCol)
      const filename = asset.public_id.split('/').pop() + '.' + asset.format

      record.set('name', filename)
      record.set('url', asset.url)

      // Auto-map Cloudinary transformation for thumbnails
      let thumbnailUrl = asset.url
      if (asset.resource_type === 'video') {
        thumbnailUrl = asset.url
          .replace('/upload/', '/upload/w_300,c_fill,q_auto/')
          .replace(/\.[^/.]+$/, '.jpg')
      } else {
        thumbnailUrl = asset.url.replace('/upload/', '/upload/w_300,c_fill,q_auto/')
      }

      record.set('thumbnail', thumbnailUrl)
      record.set('type', asset.resource_type)
      record.set('user', user.id)
      record.set('size', 1048576) // mock 1MB size for legacy seeded files
      record.set('duration', asset.resource_type === 'video' ? 15 : 0)

      app.save(record)
    }
  },
  (app) => {
    const legacyUrls = [
      'https://res.cloudinary.com/djr83woxh/image/upload/v1/cld-sample.jpg',
      'https://res.cloudinary.com/djr83woxh/image/upload/v1/cld-sample-2.jpg',
      'https://res.cloudinary.com/djr83woxh/image/upload/v1/cld-sample-3.jpg',
      'https://res.cloudinary.com/djr83woxh/image/upload/v1/cld-sample-4.jpg',
      'https://res.cloudinary.com/djr83woxh/image/upload/v1/cld-sample-5.jpg',
      'https://res.cloudinary.com/djr83woxh/video/upload/v1/samples/elephants.mp4',
      'https://res.cloudinary.com/djr83woxh/video/upload/v1/samples/sea-turtle.mp4',
    ]

    for (const url of legacyUrls) {
      try {
        const record = app.findFirstRecordByData('files', 'url', url)
        app.delete(record)
      } catch (_) {}
    }
  },
)
