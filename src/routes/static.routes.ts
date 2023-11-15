import { Router } from 'express'
import { serveImageController, serveVideoStreamController } from '~/controllers/meidas.controller'

const staticRouter = Router()

staticRouter.get('/image/:namefile', serveImageController)
// staticRouter.get('/video/:namefile', serveVideoController) //chưa code
staticRouter.get('/video-stream/:namefile', serveVideoStreamController)
export default staticRouter
