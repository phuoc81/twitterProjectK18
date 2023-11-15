import { JwtPayload } from 'jsonwebtoken'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
//thêm import
import { ParamsDictionary } from 'express-serve-static-core'
export interface RegisterReqBody {
  email: string
  password: string
  confirmPassword: string
  name: string
  date_of_birth: string
}
export interface LoginReqBody {
  email: string
  password: string
}

export interface logoutReqBody {
  refresh_token: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
  verify: UserVerifyStatus
  exp: number
  iat: number
}

export interface ResetPasswordReqBody {
  forgot_password_token: string
  password: string
  confirm_password: string
}

export interface UpdateMeReqBody {
  name?: string
  date_of_birth?: string //vì ngta truyền lên string dạng ISO8601, k phải date
  bio?: string
  location?: string
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string
}
//vì đây là route patch nên ngta truyền thiếu 1 trong các prop trên cũng k sao
export interface GetProfileReqParams extends ParamsDictionary {
  username: string
}
export interface FollowReqBody {
  followed_user_id: string
}
export interface UnfollowReqParams extends ParamsDictionary {
  user_id: string
}
export interface ChangePasswordReqBody {
  old_password: string
  password: string
  confirm_password: string
}
export interface RefreshTokenReqBody {
  refresh_token: string
}
