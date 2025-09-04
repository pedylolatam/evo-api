import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';

export function verifyMetaSignature(req: Request, res: Response, next: NextFunction) {
  const sig = (req.headers['x-hub-signature-256'] || '') as string;
  const appSecret = process.env.META_APP_SECRET || '';
  if (!sig || !appSecret) {
    return res.status(401).send('signature missing or app secret not configured');
  }
  const raw = (req as any).rawBody || JSON.stringify(req.body);
  const hmac = crypto.createHmac('sha256', appSecret);
  hmac.update(raw, 'utf8');
  const expected = `sha256=${hmac.digest('hex')}`;
  try {
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(sig, 'utf8');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res.status(401).send('invalid signature');
    }
  } catch {
    return res.status(401).send('invalid signature');
  }
  next();
}
