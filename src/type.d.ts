// file này dùng để định nghĩa lại những cái có sẵn
import { Token } from 'typescript'
import { User } from './models/schemas/User.schema'
import { Request } from 'express'
import { TokenPayload } from './models/requests/User.requests'
// là nơi dùng đẻ định nghĩa lại những cái có sẵn
declare module 'express' {
  interface Request {
    user?: User
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
    decoded_email_verify_token?: TokenPayload
    decoded_forgot_password_token?: TokenPayload
  }
}
