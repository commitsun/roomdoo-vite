type Listener = (payload: any) => void;

class Emitter {
  private events = new Map<string, Set<Listener>>();
  on(event: string, fn: Listener) {
    if (!this.events.has(event)) this.events.set(event, new Set());
    this.events.get(event)!.add(fn);
  }
  off(event: string, fn: Listener) {
    this.events.get(event)?.delete(fn);
  }
  emit(event: string, data?: any) {
    this.events.get(event)?.forEach((fn) => fn(data));
  }
}

export const socketSim = new Emitter();
let interval: number | undefined;

export function startSocketSimulation() {
  stopSocketSimulation();
  interval = window.setInterval(() => {
    const chatIds = ['b1', 'b2', 'b3'];
    const chatId = chatIds[Math.floor(Math.random() * chatIds.length)];
    const messages = [
      '¿Precio final?',
      '¿Hay novedades?',
      'Ok, gracias.',
      '¡Genial!',
      '¿Podemos hablar?',
    ];
    const text = messages[Math.floor(Math.random() * messages.length)];
    socketSim.emit('message', { chatId, text, author: 'client', createdAt: Date.now() });
  }, 5000);
}

export function stopSocketSimulation() {
  if (interval) clearInterval(interval);
  interval = undefined;
}
