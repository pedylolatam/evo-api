import EventEmitter from 'events';

export class WebhookManagerService {
  private emitter = new EventEmitter();

  on(listener: (data: { instanceId: string; body: any }) => void) {
    this.emitter.on('webhook', listener);
  }

  enqueue(instanceId: string, body: any) {
    this.emitter.emit('webhook', { instanceId, body });
  }
}
