import { NextFunction, Request, Response } from 'express'
import { omit } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  //   console.log('error handler') đây là nơi mà tát cả lỗi trên hệ thống sẽ dồn về đây
  if (err instanceof ErrorWithStatus) {
    return res.status(err.status).json(omit(err, ['status']))
  }
  // nếu không lọt vào if ở trên thì tức là err này là lỗi mặc định
  // name, message, stack mà ba thằng này có enumberable là false
  // nên nó sẽ không được hiển thị ra
  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, { enumerable: true })
  })
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: err.message,
    errorInfor: omit(err, ['stack'])
  })
}
