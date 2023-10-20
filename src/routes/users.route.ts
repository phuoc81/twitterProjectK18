import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator, registerValidator } from '~/middlewares/users.middliewares'
const usersRouter = Router()
// middleware

// controller
usersRouter.get('/login', loginValidator, loginController)

// Description: register new user
// Path: /users/register
// method: POST
/*
body: {
    name: string
    email: string
    password: string
    comfirmPassword: string
    date_of_birth: string theo chuẩn ISO 8601
}
*/
usersRouter.post('/register', registerValidator, registerController)

export default usersRouter
