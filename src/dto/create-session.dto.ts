export interface CreateSessionDto {
  userId: string;
  role: string;
  jwtId: string | null;
  ipAddress?: string;
  deviceInfo?: string;
}
