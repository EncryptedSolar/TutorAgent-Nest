import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Socket } from 'socket.io';
import { WsJwtGuard } from '../common/guards/ws.jwt.guard';
import { v4 as uuidv4 } from "uuid";

@WebSocketGateway({ cors: true })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {

    handleConnection(client: Socket) {
        console.log('Client connected:', client.id);
    }

    handleDisconnect(client: Socket) {
        console.log('Client disconnected:', client.id);
    }

    @UseGuards(WsJwtGuard)
    @SubscribeMessage('message')
    handleMessage(@MessageBody() data: { text: string; id: string }, @ConnectedSocket() client: Socket) {
        console.log(`Received message from ${client.data.user.email}:`, data);

        // Echo back the original message to sender (optional)
        client.emit("message", {
            id: uuidv4(),
            text: "🤖 Placeholder reply: Thanks for your message!",
            from: 'other',
        });
    }
}
