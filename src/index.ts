import express, { NextFunction, Request, Response } from 'express'
import usersRouter from './routes/users.route'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middllewares'
const app = express()
app.use(express.json()) // dùng để parse body từ client gửi lên
const PORT = 3000
databaseService.connect()

//localhost:3000/
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/users', usersRouter)
//localhost:3000/api/tweets
// localhost:3000 không chạy qua middleware nào cả
// localhost:3000/api chạy qua middleware 1
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
