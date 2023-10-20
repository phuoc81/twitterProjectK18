import express from 'express'
import usersRouter from './routes/users.route'
import databaseService from './services/database.services'
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

app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`)
})
