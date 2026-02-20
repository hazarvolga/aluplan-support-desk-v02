export interface SimpleImapConfig {
    user: string;
    password?: string;
    host: string;
    port: number;
    tls: boolean;
    authTimeout?: number;
}

export const SIMPLE_MAP_CONFIG = 'SIMPLE_MAP_CONFIG';
