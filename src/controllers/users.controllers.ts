import { NextFunction, Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import usersService from '~/services/Users.services'
import databaseService from '~/services/database.services'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  ChangePasswordReqBody,
  FollowReqBody,
  GetProfileReqParams,
  LoginReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayload,
  UnfollowReqParams,
  UpdateMeReqBody,
  logoutReqBody
} from '~/models/requests/User.requests'
import { threadId } from 'worker_threads'
import { ErrorWithStatus } from '~/models/Errors'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import { Token } from 'typescript'
import { UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { get } from 'lodash'
import { config } from 'dotenv'
import { verify } from 'crypto'
config() //để xài đc biến môi trường
export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  //  nếu nó vòa được đây, tức là nó đã đăng nhập thành công
  const user = req.user as User // ép kiểu
  const user_id = user._id as ObjectId //objectid
  // server phải tạo ra access token và refresh token để đưa cho  client
  //
  const result = await usersService.login({
    user_id: user_id.toString(),
    verify: user.verify
  })
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
  const { _id, verify } = req.user as User
  // update lại forgot password token
  const result = await usersService.forgotPassword({
    user_id: (_id as ObjectId).toString(),
    verify
  })
  return res.json(result)
}

export const verifyForgotPasswordTokenController = async (req: Request, res: Response) => {
  return res.json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response
) => {
  // muốn cập nhật mật khẩu mới thì cần có user_id và password mới
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { password } = req.body
  // cập nhật password mới cho user có user_id này
  const result = await usersService.resetPassword({ user_id, password })
  return res.json(result)
}

export const getMeController = async (req: Request, res: Response) => {
  // muốn lấy tt từ user thì cần có user_id
  const { user_id } = req.decoded_authorization as TokenPayload
  // lấy user từ trong database
  const user = await usersService.getMe(user_id)
  return res.json({
    message: USERS_MESSAGES.GET_ME_SUCCESS,
    result: user
  })
}

export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateMeReqBody>, res: Response) => {
  // muốn update thì cần có user_id và các thông tin cần update
  const { user_id } = req.decoded_authorization as TokenPayload
  const { body } = req
  // giờ mình sẽ update user thông qua user_id với boddy đc cho
  const result = await usersService.updateMe(user_id, body)
  return res.json({
    message: USERS_MESSAGES.UPDATE_ME_SUCCESS,
    result
  })
}

export const getProfileController = async (req: Request<GetProfileReqParams>, res: Response, next: NextFunction) => {
  const { username } = req.params //lấy username từ query params
  const result = await usersService.getProfile(username)
  return res.json({
    message: USERS_MESSAGES.GET_PROFILE_SUCCESS, //message.ts thêm  GET_PROFILE_SUCCESS: 'Get profile success',
    result
  })
}
//usersService.getProfile(username) nhận vào username tìm và return ra ngoài, hàm này chưa viết
//giờ ta sẽ viết
export const followController = async (
  req: Request<ParamsDictionary, any, FollowReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload //lấy user_id từ decoded_authorization của access_token
  const { followed_user_id } = req.body //lấy followed_user_id từ req.body
  const result = await usersService.follow(user_id, followed_user_id) //chưa có method này
  return res.json(result)
}
export const unfollowController = async (req: Request<UnfollowReqParams>, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload //lấy user_id từ decoded_authorization của access_token
  const { user_id: followed_user_id } = req.params //lấy user_id từ req.params là user_id của người mà ngta muốn unfollow
  const result = await usersService.unfollow(user_id, followed_user_id) //unfollow chưa làm
  return res.json(result)
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload //lấy user_id từ decoded_authorization của access_token
  const { password } = req.body //lấy old_password và password từ req.body
  const result = await usersService.changePassword(user_id, password) //chưa code changePassword
  return res.json(result)
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response,
  next: NextFunction
) => {
  // khi qua middleware refreshTokenValidator thì ta đã có decoded_refresh_token
  //chứa user_id và token_type
  //ta sẽ lấy user_id để tạo ra access_token và refresh_token mới
  const { refresh_token } = req.body
  const { user_id, verify, exp } = req.decoded_refresh_token as TokenPayload //lấy refresh_token từ req.body

  const result = await usersService.refreshToken(user_id, verify, refresh_token, exp) //refreshToken chưa code
  return res.json({
    message: USERS_MESSAGES.refresh_token_SUCCESS, //message.ts thêm  refresh_token_SUCCESS: 'Refresh token success',
    result
  })
}

export const oAuthController = async (req: Request, res: Response, next: NextFunction) => {
  const { code } = req.query
  //tạo đường dẫn truyền thông tin result để sau khi họ chọn tại khoản, ta check (tạo | login) xong thì điều hướng về lại client kèm thông tin at và rf
  const { access_token, refresh_token, new_user } = await usersService.oAuth(code as string)
  const urlRedirect = `${process.env.CLIENT_REDIRECT_CALLBACK}?access_token=${access_token}&refresh_token=${refresh_token}&new_user=${new_user}&verify=${verify}`
  return res.redirect(urlRedirect)
}
