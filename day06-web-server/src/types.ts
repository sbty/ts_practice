/**
 * 基本的なAPIレスポンスの構造
 */
export interface HelloResponse {
    message: string;
    timestamp: string;
}

/**
 * サーバーの状態を表す構造
 */
export interface StatusResponse {
    status: 'ok' | 'error';
    version: string;
    uptime: number;
}
