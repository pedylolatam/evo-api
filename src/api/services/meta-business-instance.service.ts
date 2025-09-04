import axios from 'axios';

const GRAPH_BASE = 'https://graph.facebook.com';
const API_VERSION = process.env.META_GRAPH_VERSION || 'v21.0';

export class MetaBusinessInstanceService {
  async sendMessage(phoneNumberId: string, accessToken: string, payload: any) {
    const url = `${GRAPH_BASE}/${API_VERSION}/${phoneNumberId}/messages`;
    await axios.post(url, payload, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }
}
