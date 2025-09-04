import crypto from 'crypto';

import { MetaCoexistenceService } from './meta-coexistence.service';

export class EmbeddedSignupService {
  private readonly stateStore = new Map<string, number>();

  private generateState(instanceId: string) {
    const state = `${instanceId}:${crypto.randomBytes(8).toString('hex')}`;
    this.stateStore.set(state, Date.now());
    return state;
  }

  validateState(state: string) {
    const created = this.stateStore.get(state);
    if (!created) return false;
    const valid = Date.now() - created < 5 * 60 * 1000;
    this.stateStore.delete(state);
    return valid;
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
    const meta = new MetaCoexistenceService();
    return meta.exchangeCodeForToken(code, redirectUri);
  }
}
