import axios from 'axios';

const GRAPH_BASE = 'https://graph.facebook.com';
const API_VERSION = process.env.META_GRAPH_VERSION || 'v21.0';

export class MetaCoexistenceService {
  async exchangeCodeForToken(code: string, redirectUri: string) {
    const res = await axios.get(`${GRAPH_BASE}/${API_VERSION}/oauth/access_token`, {
      params: {
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        redirect_uri: redirectUri,
        code,
      },
    });
    return res.data;
  }

  async debugToken(accessToken: string) {
    const appToken = `${process.env.META_APP_ID}|${process.env.META_APP_SECRET}`;
    const res = await axios.get(`${GRAPH_BASE}/${API_VERSION}/debug_token`, {
      params: { input_token: accessToken, access_token: appToken },
    });
    return res.data;
  }

  async fetchBusinessAccounts(userAccessToken: string) {
    const res = await axios.get(`${GRAPH_BASE}/${API_VERSION}/me/owned_businesses`, {
      params: { access_token: userAccessToken },
    });
    return res.data;
  }

  async getPhoneNumbers(wabaId: string, accessToken: string) {
    const res = await axios.get(`${GRAPH_BASE}/${API_VERSION}/${wabaId}/phone_numbers`, {
      params: { access_token: accessToken },
    });
    return res.data;
  }

  async refreshAccessToken(refreshToken: string) {
    const res = await axios.get(`${GRAPH_BASE}/${API_VERSION}/oauth/access_token`, {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        fb_exchange_token: refreshToken,
      },
    });
    return res.data;
  }
}
