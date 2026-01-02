import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const request = req as Request;
    // Prefer X-Forwarded-For because typically usually behind Nginx/LoadBalancer
    // The first IP in the list is the real client IP
    const xForwardedFor = request.headers['x-forwarded-for'];
    if (Array.isArray(xForwardedFor)) {
      return xForwardedFor[0];
    }
    if (typeof xForwardedFor === 'string') {
      return xForwardedFor.split(',')[0].trim();
    }
    const tracker = req.ips.length > 0 ? req.ips[0] : req.ip;
    return tracker || '127.0.0.1';
  }
}
