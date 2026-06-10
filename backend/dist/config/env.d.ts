type NodeEnv = "development" | "production" | "test" | string;
export interface EnvConfig {
    port: number;
    mongoUri: string;
    jwtSecret: string;
    jwtRefreshSecret: string;
    env: NodeEnv;
    emailUser?: string;
    emailPassword?: string;
    googleClientId?: string;
    googleClientSecret?: string;
}
export declare const config: EnvConfig;
export {};
