import { prismaRepository } from '@api/server.module';
import { EmbeddedSignupService } from '@api/services/embedded-signup.service';
import { MetaCoexistenceService } from '@api/services/meta-coexistence.service';
import { WebhookManagerService } from '@api/services/webhook-manager.service';
import { Integration } from '@api/types/wa.types';
import { decrypt, encrypt } from '@utils/crypto';
import { Request, Response } from 'express';

const embed = new EmbeddedSignupService();
const meta = new MetaCoexistenceService();
const webhookManager = new WebhookManagerService();

export async function startSignup(req: Request, res: Response) {
  const instanceId = String(req.body.instanceId || req.params.instanceId || 'default-instance');
  const redirectTemplate = process.env.META_REDIRECT_URI || 'https://your-domain.com/v1/meta/callback/{instanceId}';
  const redirectUri = redirectTemplate.replace('{instanceId}', instanceId);
  const { url, state } = embed.buildSignupUrl(instanceId, redirectUri);
  res.json({ signupUrl: url, state });
}

export async function callbackHandler(req: Request, res: Response) {
  const { code, state } = req.query as any;
  if (!state || !embed.validateState(String(state))) return res.status(400).send('invalid state');
  const instanceId = String(state).split(':')[0];
  try {
    const redirectTemplate = process.env.META_REDIRECT_URI || 'https://your-domain.com/v1/meta/callback/{instanceId}';
    const redirectUri = redirectTemplate.replace('{instanceId}', instanceId);
    const tokenData = await embed.exchangeCode(String(code), redirectUri);
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const debug = await meta.debugToken(accessToken);
    const businesses = await meta.fetchBusinessAccounts(accessToken);
    const business = businesses.data?.[0];
    const businessId = business?.id;
    const wabaId = business?.id;
    const phones = await meta.getPhoneNumbers(wabaId, accessToken);
    const phone = phones.data?.[0];
    const phoneNumberId = phone?.id;
    const phoneNumber = phone?.display_phone_number;
    const encryptedAccess = encrypt(accessToken);
    const encryptedRefresh = refreshToken ? encrypt(refreshToken) : null;
    const expiresAt = tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null;
    const webhookUrl = `/v1/meta/webhook/${instanceId}`;
    await prismaRepository.instance.update({
      where: { id: instanceId },
      data: {
        providerType: 'meta',
        integration: Integration.WHATSAPP_BUSINESS,
        businessId,
        wabaId,
        phoneNumberId,
        phoneNumber,
        accessToken: encryptedAccess,
        refreshToken: encryptedRefresh,
        tokenExpiresAt: expiresAt,
        webhookUrl,
        webhookVerifyToken: process.env.META_VERIFY_TOKEN,
        status: 'connected',
      },
    });
    res.json({ status: 'ok', instanceId, debug });
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
  const body = (req as any).rawBody || req.body;
  webhookManager.enqueue(instanceId, body);
  res.sendStatus(200);
}

export async function refreshToken(req: Request, res: Response) {
  const instanceId = req.params.instanceId;
  try {
    const instance = await prismaRepository.instance.findFirst({ where: { id: instanceId } });
    if (!instance?.refreshToken) return res.status(404).send('instance not found');
    const currentRefresh = decrypt(instance.refreshToken);
    const data = await meta.refreshAccessToken(currentRefresh);
    const encrypted = encrypt(data.access_token);
    const expiresAt = data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null;
    await prismaRepository.instance.update({
      where: { id: instanceId },
      data: { accessToken: encrypted, tokenExpiresAt: expiresAt },
    });
    res.json({ status: 'ok' });
  } catch (err: any) {
    res.status(500).json({ error: err.response?.data || err.message || err });
  }
}
