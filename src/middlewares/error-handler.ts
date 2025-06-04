import { Request, Response, NextFunction } from "express";

import httpStatus from "http-status";

type AppError = Error & {
  type: string
}

export default function errorHandlingMiddleware(
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction) {

  console.log(error);

  const { name, message } = error;
  if (name === "NotFound") return res.status(httpStatus.NOT_FOUND).send(message);
  if (name === "Conflict") return res.status(httpStatus.CONFLICT).send(message);
  if (name === "BadRequest") return res.status(httpStatus.BAD_REQUEST).send(message);
  if (name === "UnprocessableEntity") return res.status(httpStatus.UNPROCESSABLE_ENTITY).send(message);
  if (name === "Forbidden") return res.status(httpStatus.FORBIDDEN).send(message);

  return res.status(httpStatus.INTERNAL_SERVER_ERROR);
  

}