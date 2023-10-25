import { NextFunction, Request, Response } from 'express'
import { body, validationResult, ValidationChain } from 'express-validator'
// can be reused by many routes
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import { EntityError, ErrorWithStatus } from '~/models/Errors'
// sequential processing, stops running validations chain if the previous one fails.

export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validation.run(req) // lấy lỗi từng cái ra lưu vào trong req
    // hàm validate nhận vào một schema và trả về một middleware
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }

    const errObject = errors.mapped()
    const entityError = new EntityError({ errors: {} })
    for (const key in errObject) {
      // lấy msg của từng lỗi ra
      const { msg } = errObject[key]
      if (msg instanceof ErrorWithStatus && msg.status !== 422) {
        return next(msg)
      }
      entityError.errors[key] = msg
    }
    // xử lý lỗi
    next(entityError)
  }
}
