import { User } from './models/schemas/User.schema'
import { Request } from 'express'
// là nơi dùng đẻ định nghĩa lại những cái có sẵn
declare module 'express' {
  interface Request {
    user?: User
  }
}
