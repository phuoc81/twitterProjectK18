import { NextFunction, Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import usersService from '~/services/Users.services'
import databaseService from '~/services/database.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { LoginReqBody, RegisterReqBody, logoutReqBody } from '~/models/requests/User.requests'
import { threadId } from 'worker_threads'
import { ErrorWithStatus } from '~/models/Errors'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  //  nếu nó vòa được đây, tức là nó đã đăng nhập thành công
  const user = req.user as User // ép kiểu
  const user_id = user._id as ObjectId //objectid
  // server phải tạo ra access token và refresh token để đưa cho  client
  //
  const result = await usersService.login(user_id.toString())
  return res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersService.register(req.body)
  return res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, logoutReqBody>, res: Response) => {
  // lấy refresh token từ trong req.body
  const { refresh_token } = req.body
  // và vào database xóa refresh token này
  const result = await usersService.logout(refresh_token)
  res.json(result)
}
