import express, { NextFunction, Request, Response } from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middllewares'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import { config } from 'dotenv'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from './constants/dir' //import không xài xóa đi cũng đcimport staticRouter from './routes/static.routes'
import staticRouter from './routes/static.routes'

config()

const app = express()
app.use(express.json()) // dùng để parse body từ client gửi lên
const PORT = process.env.PORT || 4000
//thêm
// tạo folder uploads
initFolder()
databaseService.connect().then(() => {
  databaseService.indexUsers()
})

//localhost:3000/
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
// app.use('/static', express.static(UPLOAD_DIR))
app.use('/static', staticRouter)
// app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))
//localhost:3000/api/tweets
// localhost:3000 không chạy qua middleware nào cả
// localhost:3000/api chạy qua middleware 1

//Demo chơi

//Demo chơi

app.use(defaultErrorHandler)

//trở thành error handler cho cả app
//các route trên bị lỗi sẽ next(err) và xuống đây
// app.use((err, req, res, next) => {
//   console.log('lỗi nè ' + err.message)
//   res.status(400).json({ message: err.message })
// })
app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`)
})
