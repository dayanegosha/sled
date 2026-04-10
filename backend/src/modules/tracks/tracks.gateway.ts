import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/tracks', cors: true })
export class TracksGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server;

  handleConnection(client: Socket) {
    client.emit('connected', { ok: true });
  }

  @SubscribeMessage('location')
  onLocation(client: Socket, payload: { lat: number; lng: number }) {
    client.emit('area_updated', {
      newGeojson: { type: 'FeatureCollection', features: [] },
      distanceDelta: 0,
      payload,
    });
  }
}
