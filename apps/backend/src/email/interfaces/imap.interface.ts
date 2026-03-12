export interface SimpleImapConfig {
    user: string;
    password?: string;
    host: string;
    port: number;
    tls: boolean;
    authTimeout?: number;
}

export const _SIMPLE_MAP_CONFIG = 'SIMPLE_MAP_CONFIG';
