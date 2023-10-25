import { NextFunction, Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import usersService from '~/services/Users.services'
import databaseService from '~/services/database.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/User.requests'
export const loginController = async (req: Request, res: Response) => {
  //  nếu nó vòa được đây, tức là nó đã đăng nhập thành công
  const { user }: any = req
  const user_id = user._id //objectid
  // server phải tạo ra access token và refresh token để đưa cho  client
  //
  const result = await usersService.login(user_id.toString())
  return res.json({
    message: 'login successfully',
    result
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersService.register(req.body)
  return res.json({
    message: 'register successfully',
    result
  })
}
