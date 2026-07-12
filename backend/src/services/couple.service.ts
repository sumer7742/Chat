import { Types } from 'mongoose';
import { Couple, type CoupleDocument } from '../models/Couple';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { chatService } from './chat.service';
import { realtime } from '../socket/emitter';

// Unambiguous alphabet (no 0/O/1/I) for a clean, readable "LOVE-XXXX" code.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomCode(): string {
  let s = '';
  for (let i = 0; i < 4; i += 1) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return `LOVE-${s}`;
}

export interface CoupleView {
  id: string;
  inviteCode: string;
  linked: boolean;
  chatId: string | null;
  /** What the requesting user calls their partner ('' if not chosen yet). */
  partnerNickname: string;
  partner: { _id: string; displayName: string; username: string; avatarUrl?: string } | null;
}

class CoupleService {
  /** Generates a code guaranteed unique against existing couples. */
  private async uniqueCode(): Promise<string> {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const code = randomCode();
      if (!(await Couple.exists({ inviteCode: code }))) return code;
    }
    throw ApiError.internal('Could not generate an invite code, please retry');
  }

  /** Creates a fresh couple for a newly-registered user. Idempotent per user. */
  async createForUser(userId: string): Promise<CoupleDocument> {
    const oid = new Types.ObjectId(userId);
    const existing = await Couple.findOne({ members: oid });
    if (existing) return existing;

    const couple = await Couple.create({
      inviteCode: await this.uniqueCode(),
      members: [oid],
      createdBy: oid,
    });
    await User.updateOne({ _id: oid }, { couple: couple._id });
    return couple;
  }

  private async view(couple: CoupleDocument, userId: string): Promise<CoupleView> {
    const me = await User.findById(userId).select('partnerNickname');
    const partnerId = couple.members.find((m) => m.toString() !== userId);
    let partner: CoupleView['partner'] = null;
    if (partnerId) {
      const p = await User.findById(partnerId).select('displayName username avatarUrl');
      if (p) {
        partner = {
          _id: p._id.toString(),
          displayName: p.displayName,
          username: p.username,
          avatarUrl: p.avatarUrl,
        };
      }
    }
    return {
      id: couple._id.toString(),
      inviteCode: couple.inviteCode,
      linked: couple.members.length >= 2,
      chatId: couple.chat ? couple.chat.toString() : null,
      partnerNickname: me?.partnerNickname ?? '',
      partner,
    };
  }

  /** Sets what the current user calls their partner; syncs to their other devices. */
  async setNickname(userId: string, nicknameRaw: string): Promise<CoupleView> {
    const nickname = nicknameRaw.trim().slice(0, 30);
    await User.updateOne({ _id: new Types.ObjectId(userId) }, { partnerNickname: nickname });
    const couple = await Couple.findOne({ members: new Types.ObjectId(userId) });
    if (!couple) throw ApiError.notFound('Couple not found');
    const view = await this.view(couple, userId);
    realtime.coupleUpdated(userId, { partnerNickname: view.partnerNickname });
    return view;
  }

  /** Current user's couple, creating one on the fly if somehow missing. */
  async getForUser(userId: string): Promise<CoupleView> {
    let couple = await Couple.findOne({ members: new Types.ObjectId(userId) });
    if (!couple) couple = await this.createForUser(userId);
    return this.view(couple, userId);
  }

  /**
   * Links the current user to a partner's couple via invite code. Enforces the
   * two-person cap and creates the private chat between them.
   */
  async join(userId: string, inviteCodeRaw: string): Promise<CoupleView> {
    const inviteCode = inviteCodeRaw.trim().toUpperCase();
    const target = await Couple.findOne({ inviteCode });
    if (!target) throw ApiError.notFound('Invalid invite code');

    const oid = new Types.ObjectId(userId);

    if (target.members.some((m) => m.toString() === userId)) {
      throw ApiError.badRequest('This is your own code — share it with your partner 💕');
    }
    if (target.members.length >= 2) {
      throw ApiError.forbidden('This couple is already complete — only two hearts allowed 💗');
    }

    // Tear down the joining user's own (solo) couple so there is exactly one.
    const mine = await Couple.findOne({ members: oid });
    if (mine) {
      if (mine.members.length >= 2) {
        throw ApiError.badRequest('You are already linked with a partner');
      }
      if (mine._id.toString() !== target._id.toString()) {
        await Couple.deleteOne({ _id: mine._id });
      }
    }

    const partnerId = target.members[0]!.toString();
    const chat = await chatService.getOrCreatePrivate(userId, partnerId);

    target.members.push(oid);
    target.chat = chat._id;
    target.linkedAt = new Date();
    await target.save();

    await User.updateMany({ _id: { $in: target.members } }, { couple: target._id });

    return this.view(target, userId);
  }

  /** Verifies a couple code against the requesting user's own couple (lock screen). */
  async verifyCode(userId: string, codeRaw: string): Promise<boolean> {
    const code = codeRaw.trim().toUpperCase();
    const couple = await Couple.findOne({ members: new Types.ObjectId(userId) }).select('inviteCode');
    return !!couple && couple.inviteCode.toUpperCase() === code;
  }

  /** Whether two users are linked in the same couple (for feature gating). */
  async arePartners(a: string, b: string): Promise<boolean> {
    const couple = await Couple.findOne({ members: { $all: [new Types.ObjectId(a), new Types.ObjectId(b)] } });
    return !!couple && couple.members.length === 2;
  }
}

export const coupleService = new CoupleService();
