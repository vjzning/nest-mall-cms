import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import passport from 'passport';

@Injectable()
export class BullBoardAuthMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        // 允许静态资源文件直接通过，无需鉴权
        // BullBoard 的资源路径通常包含 /static/ 或以常见静态扩展名结尾
        if (
            req.path.includes('/static/') ||
            /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?|ttf)$/i.test(req.path)
        ) {
            return next();
        }

        passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if (err || !user) {
                return res
                    .status(401)
                    .send(
                        'Unauthorized: BullBoard access requires valid admin JWT token. Please provide token in Authorization header, cookie "admin_token", or query parameter "token".'
                    );
            }
            req.user = user;
            next();
        })(req, res, next);
    }
}
