import { SafeUser, UserEntity } from "../types/user.interface";

export function toSafeUser(user: UserEntity): SafeUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    username: user.username,
    isGoogleUser: user.isGoogleUser,
    picture: user.picture ?? null,
    preferredAuth: user.preferredAuth,
    hasPasskey: user.hasPasskey,
    currentStatus: user.currentStatus ?? null,
  };
}

// user/user.utils.ts

import { UserDTO } from "src/user/user.dto";
import { PrismaSafeUser } from "../types/auth.type";

export function toUserDTO(user: PrismaSafeUser): UserDTO {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    role: user.role,
    picture: user.picture ?? undefined, // ✅ convert null → undefined
    isGoogleUser: user.isGoogleUser ?? false,
  };
}
