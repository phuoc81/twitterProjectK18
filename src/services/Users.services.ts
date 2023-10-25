import databaseService from './database.services'
import User from '../models/schemas/User.schema'
import { RegisterReqBody } from '~/models/requests/User.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enums'

class UsersService {
  // hàm nhận vào user_id và bỏ vào payload để tạo accessToken
  private signAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken },
      options: { expiresIn: process.env.ACCSESS_TOKEN_EXPIRE_IN }
    })
  }
  // hàm nhận vào user_id và bỏ vào payload để tạo refreshToken
  private signRefreshToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken },
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE_IN }
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
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    // lấy user_id từ result
    const user_id = result.insertedId.toString()
    const [access_Token, refresh_Token] = await this.signAccessTokenAbdRefreshToken(user_id)

    return [access_Token, refresh_Token]
  }

  async login(user_id: string) {
    const [access_Token, refresh_Token] = await this.signAccessTokenAbdRefreshToken(user_id)

    return [access_Token, refresh_Token]
  }
}

const usersService = new UsersService()
export default usersService
