import toast from 'react-hot-toast';
import { emitAck, getSocket } from './socket';

/**
 * Initiates a call by sending the `call-start` signaling event. The server
 * persists the call and rings the callees; peer-to-peer media negotiation
 * (offer/answer/ICE over `call-signal`) is handled by the WebRTC layer. This
 * helper wires the signaling entrypoint; the full in-call UI is on the roadmap.
 */
export async function startCall(chatId: string, calleeIds: string[], type: 'voice' | 'video'): Promise<void> {
  if (calleeIds.length === 0) {
    toast.error('No one to call in this chat');
    return;
  }
  const socket = getSocket();
  if (!socket.connected) {
    toast.error('You are offline');
    return;
  }
  try {
    const { callId } = await emitAck<{ callId: string }>('call-start', { chatId, calleeIds, type });
    toast.success(`${type === 'video' ? 'Video' : 'Voice'} call started · ringing…`);
    return void callId;
  } catch {
    toast.error('Could not start the call');
  }
}

export function registerIncomingCallHandler(): () => void {
  const socket = getSocket();
  const onCall = (payload: { from: { displayName: string }; type: string; callId: string }) => {
    toast(`📞 Incoming ${payload.type} call from ${payload.from.displayName}`, { duration: 6000 });
  };
  socket.on('call-start', onCall);
  return () => socket.off('call-start', onCall);
}
