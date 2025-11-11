export enum AuditComponent {
  SESSION = 'UserSessionService',
  AUTH = 'AuthService',
  USER = 'UserService',
}

export enum AuditAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  UPDATE_ACTIVITY = 'UPDATE_ACTIVITY',
  MARK_IDLE = 'MARK_IDLE',
  MARK_OFFLINE = 'MARK_OFFLINE',
  TERMINATE = 'TERMINATE',
}
