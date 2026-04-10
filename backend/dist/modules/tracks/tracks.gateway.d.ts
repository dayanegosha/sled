import { OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class TracksGateway implements OnGatewayConnection {
    server: Server;
    handleConnection(client: Socket): void;
    onLocation(client: Socket, payload: {
        lat: number;
        lng: number;
    }): void;
}
