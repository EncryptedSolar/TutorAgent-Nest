export enum AuditComponent {
  USER_SESSION = 'UserSessionService',
  AUTH = 'AuthService',
  USER = 'UserService',
  SYSTEM = 'System',
}

export enum AuditAction {
  LOGIN = 'LOGIN',
  UPDATE_ACTIVITY = 'UPDATE_ACTIVITY',
  MARK_IDLE = 'MARK_IDLE',
  MARK_OFFLINE = 'MARK_OFFLINE',
  TERMINATE = 'TERMINATE',
  ATTACH_SOCKET = 'ATTACH_SOCKET',
}
