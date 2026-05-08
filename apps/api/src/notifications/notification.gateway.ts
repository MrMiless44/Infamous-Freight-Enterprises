/**
 * RECOMMENDATION: Real-time Notifications
 * WebSocket gateway for live load updates, alerts, and messages
 */
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

function getAllowedNotificationOrigins(): string[] | true {
  // Restrict WebSocket origins in production. In development, allow all so
  // that `localhost` and Vite dev-server origins can connect freely.
  const raw = process.env.CORS_ORIGINS ?? process.env.CORS_ORIGIN ?? '';
  const list = raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (list.length > 0) {
    return list;
  }

  return process.env.NODE_ENV === 'production' ? [] : true;
}

@WebSocketGateway({
  cors: { origin: getAllowedNotificationOrigins(), credentials: true },
  namespace: '/notifications',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Track connected users
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.userSockets.set(userId, client.id);
      client.join(`user:${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.userSockets.delete(userId);
    }
  }

  // Send notification to specific user
  sendToUser(userId: string, notification: NotificationPayload) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  // Send notification to all users in a company
  sendToCompany(companyId: string, notification: NotificationPayload) {
    this.server.to(`company:${companyId}`).emit('notification', notification);
  }

  // Send load status update
  sendLoadUpdate(loadId: string, update: LoadUpdatePayload) {
    this.server.to(`load:${loadId}`).emit('load:update', update);
  }

  // Send exception alert
  sendExceptionAlert(companyId: string, alert: ExceptionAlertPayload) {
    this.server.to(`company:${companyId}`).emit('exception:alert', alert);
  }

  // Join company room
  @SubscribeMessage('join:company')
  handleJoinCompany(client: Socket, companyId: string) {
    client.join(`company:${companyId}`);
  }

  // Join load room
  @SubscribeMessage('join:load')
  handleJoinLoad(client: Socket, loadId: string) {
    client.join(`load:${loadId}`);
  }

  // Mark notification as read
  @SubscribeMessage('notification:read')
  handleMarkRead(client: Socket, notificationId: string) {
    // Update in database
    client.emit('notification:read:confirmed', notificationId);
  }
}

interface NotificationPayload {
  id: string;
  type: 'load_update' | 'exception' | 'message' | 'system';
  title: string;
  message: string;
  data?: any;
  timestamp: string;
  read: boolean;
}

interface LoadUpdatePayload {
  loadId: string;
  status: string;
  location?: { lat: number; lng: number };
  timestamp: string;
  updatedBy: string;
}

interface ExceptionAlertPayload {
  loadId: string;
  type: 'delay' | 'deviation' | 'breakdown' | 'hos_warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestedAction: string;
  timestamp: string;
}
