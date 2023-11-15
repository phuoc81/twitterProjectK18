import { Router } from 'express'
import { access } from 'fs'
import { uploadImageController, uploadVideoController } from '~/controllers/meidas.controller'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middliewares'
import { wrapAsync } from '~/utils/handlers'
const mediasRouter = Router()

mediasRouter.post('/upload-image', accessTokenValidator, verifiedUserValidator, wrapAsync(uploadImageController))
mediasRouter.post('/upload-video', accessTokenValidator, verifiedUserValidator, wrapAsync(uploadVideoController)) // uploadVideoController chưa làm
export default mediasRouter
