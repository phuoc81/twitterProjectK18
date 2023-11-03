import { verify } from 'crypto'
import { Router } from 'express'
import { checkSchema } from 'express-validator'
import {
  emailVerifyController,
  forgotPasswordController,
  loginController,
  logoutController,
  registerController,
  resendEmailVerifyController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middliewares'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { wrapasync } from '~/utils/handlers'
const usersRouter = Router()
// middleware

// controller
usersRouter.get('/login', loginValidator, wrapasync(loginController))

usersRouter.post('/register', registerValidator, wrapasync(registerController))

usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapasync(logoutController))
/*
des: verify email
method: post
path : /users/verify-email
body: {
  email_verify_token: string
}
*/
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapasync(emailVerifyController))

/*
des: resend verify email
method: post
path : /users/resend-verify-email
header: {
  Authorization: "Bearer access_token"
}
 */
//
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapasync(resendEmailVerifyController))

/*
des: forgot password
method: post
path : /users/forgot-password
body: {
  email: string
}
*/
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapasync(forgotPasswordController))

/*

des: verify forgot password
method: post
path : /users/verify-forgot-password
body: {
  forgot_password_token: string
}
*/
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapasync(verifyForgotPasswordTokenController)
)

export default usersRouter

// validation là gì ? // là một bộ quy tắc để kiểm tra dữ liệu đầu vào
//checkSchema dùng dể kiểm tra dữ liệu đầu vào
// khi chạy validation chain và checkschema thi app có báo lồi không ? // không báo lỗi vì nó là một middleware
// muốn lấy lỗi từ validation thì làm sao ? // dùng validationResult hoặc checkSchema
// sanitizing có những gì ? // xóa bỏ các kí tự đặc biệt
// hàm validation nhận vào tham số là gì ? // là một schema và trả về một middleware
// hàm validation trả về những gì ? // một mảng các lỗi
// chức năng của validation ? // kiểm tra dữ liệu đầu vào
// tại sao signToken lại trả về một promise ? // vì nó dùng async await
// tại sao khi dùng signToken và signRefreshToken lại cần token_type ? // vì nó dùng để phân biệt token và refresh token
// runnableValidationChains là gì ? // là một bộ quy tắc để kiểm tra dữ liệu đầu vào

// request handler là gì ? // là một hàm nhận vào req, res, next và trả về một promise
// error handler là gì ? // là một hàm nhận vào err, req, res, next và trả về một promise
// nếu ta throw error là "bla bla" trong hàm schema thì sẽ báo lỗi status là bao nhiêu ? // 400
// nếu mình throw new errorwwtihtatus là 404 thì sẽ báo lỗi status là bao nhiêu ? // 404

//
