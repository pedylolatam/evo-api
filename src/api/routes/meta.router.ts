import { RouterBroker } from '@api/abstract/abstract.router';
import * as MetaCtrl from '@api/controllers/meta.controller';
import { verifyMetaSignature } from '@api/middleware/verifyMetaSignature';
import { RequestHandler, Router } from 'express';

export class MetaRouter extends RouterBroker {
  constructor(...guards: RequestHandler[]) {
    super();
    this.router.post('/start-signup', ...guards, MetaCtrl.startSignup);
    this.router.get('/callback/:instanceId', MetaCtrl.callbackHandler);
    this.router.get('/webhook/:instanceId', MetaCtrl.verifyWebhook);
    this.router.post('/webhook/:instanceId', verifyMetaSignature, MetaCtrl.receiveWebhook);
    this.router.post('/token/refresh/:instanceId', ...guards, MetaCtrl.refreshToken);
  }
  public readonly router: Router = Router();
}
