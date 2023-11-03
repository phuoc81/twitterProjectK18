import { NextFunction, Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import usersService from '~/services/Users.services'
import databaseService from '~/services/database.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { LoginReqBody, RegisterReqBody, TokenPayload, logoutReqBody } from '~/models/requests/User.requests'
import { threadId } from 'worker_threads'
import { ErrorWithStatus } from '~/models/Errors'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import { Token } from 'typescript'
import { UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  //  nếu nó vòa được đây, tức là nó đã đăng nhập thành công
  const user = req.user as User // ép kiểu
  const user_id = user._id as ObjectId //objectid
  // server phải tạo ra access token và refresh token để đưa cho  client
  //
  const result = await usersService.login(user_id.toString())
  return res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result // trả về access token và refresh token
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersService.register(req.body)
  return res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result // trả về access token và refresh token
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, logoutReqBody>, res: Response) => {
  // lấy refresh token từ trong req.body
  const { refresh_token } = req.body
  // và vào database xóa refresh token này
  const result = await usersService.logout(refresh_token)
  res.json(result)
}

export const emailVerifyController = async (req: Request, res: Response) => {
  // kiểm tra user này đã verify email chưa
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = req.user as User
  if (user.verify == UserVerifyStatus.Verified) {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  // NẾU MÀ XUỐNG ĐC ĐÂY TỨC LÀ CHƯA VERIFY EMAILchưa bị ban
  // mình tiến hành update : verify:1, xóa email_verify_token, update_at
  const result = await usersService.verifyEmail(user_id)
  return res.json({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result
  })
}

export const resendEmailVerifyController = async (req: Request, res: Response) => {
  // nếu code vào được đây nghĩa là đã qua được tầng middleware
  // trong req đã có decoded_authorization
  const { user_id } = req.decoded_authorization as TokenPayload
  // lấy user từ trong req
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND
    })
  }
  // nếu oó thì kiểm tra xem đã bị ban chưa
  if (user.verify == UserVerifyStatus.Banned) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_IS_BANNED,
      status: HTTP_STATUS.FORBIDEN
    })
  }
  // user đã verify chưa ?
  if (user.verify == UserVerifyStatus.Verified) {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  // nếu chauw verify thì tiến hành gửi lại email
  const result = await usersService.resendEmailVerify(user_id)
  return res.json(result)
}

export const forgotPasswordController = async (req: Request, res: Response) => {
  // lấy user_id từ trong req.user
  const { _id } = req.user as User
  // update lại forgot password token
  const result = await usersService.forgotPassword((_id as ObjectId).toString())
  return res.json(result)
}

export const verifyForgotPasswordTokenController = async (req: Request, res: Response) => {
  return res.json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS
  })
}
