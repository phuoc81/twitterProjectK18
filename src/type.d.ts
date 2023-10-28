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
  }
}
