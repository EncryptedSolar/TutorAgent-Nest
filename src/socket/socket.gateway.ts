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
import { v4 as uuidv4 } from "uuid";
import { WsJwtGuard } from 'src/common/guards/ws-jwt.guard';

@WebSocketGateway({ cors: true })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor() {
        
    }

    handleConnection(client: Socket) {
        console.log('Client connected:', client.id);
    }

    handleDisconnect(client: Socket) {
        console.log('Client disconnected:', client.id);
    }

    @UseGuards(WsJwtGuard)
    @SubscribeMessage('user-chat')
    handleMessage(@MessageBody() data: { text: string; id: string }, @ConnectedSocket() client: Socket) {
        console.log(client.data)
        console.log(`Received message from ${client.data.user.email}:`, data);

        // Echo back the original message to sender (optional)
        client.emit("user-chat", {
            id: uuidv4(),
            text: "🤖 Placeholder reply: Thanks for your message!",
            from: 'other',
        });
    }
}
