import { Request, Response } from "express";
const success = function (res: Response, message = "", body = {}) {
  return res.status(200).json({
    success: true,
    code: 200,
    message: message,
    body: body,
  });
};
const error = function (res: Response, err: any) {
  let code =
    typeof err === "object"
      ? isNaN(Number(err.code))
        ? 403
        : err.code
        ? err.code
        : 403
      : 403;
  let message =
    typeof err === "object" ? (err.message ? err.message : "") : err;

  return res.status(code).json({
    success: false,
    message: message,
    code: code,
    body: {},
  });
};

export const responseHandler = {
  success,
  error,
};
