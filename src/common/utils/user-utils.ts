import { SafeUser, UserEntity } from "../types/user.interface";

export function toSafeUser(user: UserEntity): SafeUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    username: user.username,
    isGoogleUser: user.isGoogleUser,
    picture: user.picture || null,
  };
}
