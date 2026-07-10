import type { Server, Socket } from 'socket.io';
import { Types } from 'mongoose';
import { SocketEvent, room } from '../events';
import { Call, CallStatus, type CallType } from '../../models/Call';
import type { AuthedSocketData } from '../middleware';
import { logger } from '../../config/logger';

interface StartPayload {
  chatId: string;
  calleeIds: string[];
  type: CallType;
}
interface SignalPayload {
  callId: string;
  to: string;
  data: unknown; // SDP offer/answer or ICE candidate
}

/**
 * WebRTC signaling relay. The server never touches media — it only persists
 * call state (for history) and forwards SDP/ICE payloads between peers' rooms.
 */
export function registerCallHandlers(io: Server, socket: Socket): void {
  const { userId, displayName } = socket.data as AuthedSocketData;

  socket.on(SocketEvent.CallStart, async (payload: StartPayload, ack?: (r: { callId: string }) => void) => {
    try {
      const call = await Call.create({
        chat: payload.chatId ? new Types.ObjectId(payload.chatId) : undefined,
        type: payload.type,
        status: CallStatus.Ringing,
        initiator: new Types.ObjectId(userId),
        participants: [{ user: new Types.ObjectId(userId), joinedAt: new Date() }],
        startedAt: new Date(),
      });
      const callId = call._id.toString();
      for (const callee of payload.calleeIds) {
        io.to(room.user(callee)).emit(SocketEvent.CallStart, {
          callId,
          from: { userId, displayName },
          type: payload.type,
          chatId: payload.chatId,
        });
      }
      ack?.({ callId });
    } catch (err) {
      logger.warn({ err }, 'call-start failed');
    }
  });

  socket.on(SocketEvent.CallAccept, async ({ callId, to }: { callId: string; to: string }) => {
    await Call.updateOne(
      { _id: callId },
      { $set: { status: CallStatus.Ongoing }, $addToSet: { participants: { user: new Types.ObjectId(userId), joinedAt: new Date() } } },
    ).exec();
    io.to(room.user(to)).emit(SocketEvent.CallAccept, { callId, from: userId });
  });

  socket.on(SocketEvent.CallReject, async ({ callId, to }: { callId: string; to: string }) => {
    await Call.updateOne({ _id: callId, status: CallStatus.Ringing }, { $set: { status: CallStatus.Rejected, endedAt: new Date() } }).exec();
    io.to(room.user(to)).emit(SocketEvent.CallReject, { callId, from: userId });
  });

  socket.on(SocketEvent.CallSignal, ({ callId, to, data }: SignalPayload) => {
    io.to(room.user(to)).emit(SocketEvent.CallSignal, { callId, from: userId, data });
  });

  socket.on(SocketEvent.ScreenShare, ({ callId, to, data }: SignalPayload) => {
    io.to(room.user(to)).emit(SocketEvent.ScreenShare, { callId, from: userId, data });
  });

  socket.on(SocketEvent.CallEnd, async ({ callId, to }: { callId: string; to?: string }) => {
    const call = await Call.findById(callId);
    if (call && call.status !== CallStatus.Ended) {
      const endedAt = new Date();
      call.status = call.status === CallStatus.Ringing ? CallStatus.Missed : CallStatus.Ended;
      call.endedAt = endedAt;
      call.durationSec = call.startedAt ? Math.round((endedAt.getTime() - call.startedAt.getTime()) / 1000) : 0;
      await call.save();
    }
    if (to) io.to(room.user(to)).emit(SocketEvent.CallEnd, { callId, from: userId });
  });
}
