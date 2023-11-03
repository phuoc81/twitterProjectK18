import databaseService from './database.services'
import User from '../models/schemas/User.schema'
import { RegisterReqBody } from '~/models/requests/User.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'

class UsersService {
  // hàm nhận vào user_id và bỏ vào payload để tạo accessToken
  private signAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      options: { expiresIn: process.env.ACCSESS_TOKEN_EXPIRE_IN },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
    })
  }
  // hàm nhận vào user_id và bỏ vào payload để tạo refreshToken
  private signRefreshToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken },
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
    })
  }

  // email_verify_token
  private signEmailVerifyToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.EmailVerificationToken },
      options: { expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRE_IN },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
    })
  }

  private signforgotPasswordToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.ForgotPasswordToken },
      options: { expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRE_IN },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
    })
  }

  private signAccessTokenAbdRefreshToken(user_id: string) {
    return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
  }
  async checkEmailExist(email: string) {
    const users = await databaseService.users.findOne({ email })
    return Boolean(users)
  }

  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken(user_id.toString())

    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )

    const [access_Token, refresh_Token] = await this.signAccessTokenAbdRefreshToken(user_id.toString())
    // lưu refresh token vào database
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        token: refresh_Token,
        user_id: new ObjectId(user_id)
      })
    )
    // giả lập gửi email
    console.log(email_verify_token)

    return { access_Token, refresh_Token }
  }

  async login(user_id: string) {
    const [access_Token, refresh_Token] = await this.signAccessTokenAbdRefreshToken(user_id)
    // LƯU REFRESH TOKEN VÀO DATABASE
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        token: refresh_Token,
        user_id: new ObjectId(user_id)
      })
    )
    return { access_Token, refresh_Token }
  }

  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return { message: USERS_MESSAGES.LOGOUT_SUCCSESS }
  }

  async verifyEmail(user_id: string) {
    // updatelaij user
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      [
        {
          $set: {
            verify: UserVerifyStatus.Verified,
            email_verify_token: '',
            updated_at: '$$NOW'
          }
        }
      ]
    )
    const [access_Token, refresh_Token] = await this.signAccessTokenAbdRefreshToken(user_id.toString())
    // LƯU REFRESH TOKEN VÀO DATABASE
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        token: refresh_Token,
        user_id: new ObjectId(user_id)
      })
    )
    return { access_Token, refresh_Token }
  }

  async resendEmailVerify(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken(user_id)
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      [
        {
          $set: {
            email_verify_token,
            updated_at: '$$NOW'
          }
        }
      ]
    )
    // giả lập gửi email
    console.log(email_verify_token)
    return { message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS }
  }

  async forgotPassword(user_id: string) {
    // tọa ra forgot password token
    const forgot_password_token = await this.signforgotPasswordToken(user_id)
    // update lại user
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      [
        {
          $set: {
            forgot_password_token,
            updated_at: '$$NOW'
          }
        }
      ]
    )
    // giả lập gửi email
    console.log(forgot_password_token)
    return { message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD }
  }
}

const usersService = new UsersService()
export default usersService
