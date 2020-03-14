import { Response } from 'express';

export const sendRefreshToken = (res: Response, token: string) => {
  res.cookie(process.env.JWT_COOKIE_NAME!, token, {
      httpOnly: true
  });
}