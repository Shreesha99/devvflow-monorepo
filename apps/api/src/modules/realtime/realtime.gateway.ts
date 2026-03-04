import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class RealtimeGateway {
  static io: Server;

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    RealtimeGateway.io = server;
  }

  handleConnection(client: any) {
    console.log('Client connected:', client.id);
  }

  emitTaskUpdate(taskId: number, status: string) {
    RealtimeGateway.io.emit('task.updated', { taskId, status });
  }

  emitActivity(taskId: number, activity: any) {
    RealtimeGateway.io.emit('activity.created', { taskId, activity });
  }
}
