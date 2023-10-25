import { Router } from 'express'
import { checkSchema } from 'express-validator'
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

//

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
