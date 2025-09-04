import { EmbeddedSignupService } from '@api/services/embedded-signup.service';
import { MetaCoexistenceService } from '@api/services/meta-coexistence.service';
import { encrypt } from '@utils/crypto';
import { Request, Response } from 'express';

const embed = new EmbeddedSignupService();
const meta = new MetaCoexistenceService();

export async function startSignup(req: Request, res: Response) {
  const instanceId = String(req.body.instanceId || req.params.instanceId || 'default-instance');
  const redirectTemplate = process.env.META_REDIRECT_URI || 'https://your-domain.com/v1/meta/callback/{instanceId}';
  const redirectUri = redirectTemplate.replace('{instanceId}', instanceId);
  const { url, state } = embed.buildSignupUrl(instanceId, redirectUri);
  res.json({ signupUrl: url, state });
}

export async function callbackHandler(req: Request, res: Response) {
  const { code, state } = req.query as any;
  const instanceId = (state || '').split(':')[0];
  if (!instanceId) return res.status(400).send('invalid state');
  try {
    const redirectTemplate = process.env.META_REDIRECT_URI || 'https://your-domain.com/v1/meta/callback/{instanceId}';
    const redirectUri = redirectTemplate.replace('{instanceId}', instanceId);
    const tokenData = await embed.exchangeCode(String(code), redirectUri);
    const accessToken = tokenData.access_token;
    const debug = await meta.debugToken(accessToken);
    const encrypted = encrypt(accessToken);
    res.json({ status: 'ok', instanceId, encrypted, debug });
  } catch (err: any) {
    res.status(500).json({ error: err.response?.data || err.message || err });
  }
}

export function verifyWebhook(req: Request, res: Response) {
  if (req.query['hub.verify_token'] === process.env.META_VERIFY_TOKEN) {
    return res.send(req.query['hub.challenge']);
  }
  return res.status(403).send('forbidden');
}

export async function receiveWebhook(req: Request, res: Response) {
  const instanceId = req.params.instanceId || 'default-instance';
  console.log('Webhook for instance', instanceId, req.body);
  res.sendStatus(200);
}
