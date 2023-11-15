import sharp from 'sharp'
import { getNameFromFullname, handleUploadImage, handleUploadVideo } from '~/utils/file'
import { Request } from 'express'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import fs from 'fs'
import { isProduction } from '~/constants/config'
import { type } from 'os'
import { mediaType } from '~/constants/enums'
import { Media } from '~/models/orther'
import { config } from 'dotenv'
config()
class MediasService {
  async UploadImage(req: Request) {
    // lưu ảnh vào trong uploads/temp
    const files = await handleUploadImage(req)
    // xử lý file bằng sharp giúp tối ưu hình ảnh
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newFilename = getNameFromFullname(file.newFilename) + '.jpg'
        const newPath = UPLOAD_IMAGE_DIR + '/' + newFilename
        const info = await sharp(file.filepath).jpeg().toFile(newPath)
        // xóa file trong thư mục temp
        fs.unlinkSync(file.filepath)

        return {
          url: isProduction
            ? `${process.env.HOST}/static/image/${newFilename}`
            : `http://localhost:${process.env.PORT}/static/image/${newFilename}`,
          type: mediaType.Image
        }
      })
    )
    return result
  }
  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)

    const result: Media[] = await Promise.all(
      files.map(async (Video) => {
        const { newFilename } = Video
        return {
          url: isProduction
            ? `${process.env.HOST}/static/video/${newFilename}`
            : `http://localhost:${process.env.PORT}/static/video/${newFilename}`,
          type: mediaType.Video
        }
      })
    )
    return result
  }
}

const mediasService = new MediasService()
export default mediasService
