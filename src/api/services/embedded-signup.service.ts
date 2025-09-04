import crypto from 'crypto';

import { MetaCoexistenceService } from './meta-coexistence.service';

const meta = new MetaCoexistenceService();

export class EmbeddedSignupService {
  private generateState(instanceId: string) {
    return `${instanceId}:${crypto.randomBytes(8).toString('hex')}`;
  }

  buildSignupUrl(instanceId: string, redirectUri: string) {
    const state = this.generateState(instanceId);
    const appId = process.env.META_APP_ID;
    const scopes = ['whatsapp_business_management', 'whatsapp_business_messaging', 'business_management'].join(',');
    const version = process.env.META_GRAPH_VERSION || 'v21.0';
    const url = `https://www.facebook.com/${version}/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&scope=${encodeURIComponent(scopes)}&state=${encodeURIComponent(state)}`;
    return { url, state };
  }

  async exchangeCode(code: string, redirectUri: string) {
    return meta.exchangeCodeForToken(code, redirectUri);
  }
}
