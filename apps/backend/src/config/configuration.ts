import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';

enum Environment {
    Development = 'development',
    Production = 'production',
    Test = 'test',
    Provision = 'provision',
}

class EnvironmentVariables {
    @IsEnum(Environment)
    NODE_ENV: Environment;

    @IsNumber()
    PORT: number;

    @IsString()
    DATABASE_URL: string;

    @IsString()
    @IsOptional()
    REDIS_HOST: string = 'localhost';

    @IsNumber()
    @IsOptional()
    REDIS_PORT: number = 6379;
}

export function validate(config: Record<string, unknown>) {
    const validatedConfig = plainToInstance(
        EnvironmentVariables,
        config,
        { enableImplicitConversion: true },
    );
    const errors = validateSync(validatedConfig, { skipMissingProperties: false });

    if (errors.length > 0) {
        throw new Error(errors.toString());
    }
    return validatedConfig;
}

export default () => {
    const config = {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: parseInt(process.env.PORT || '9002', 10),
        database: {
            url: process.env.DATABASE_URL,
        },
        redis: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
        },
    };

    if (config.nodeEnv === 'production') {
        const maskedDb = config.database.url?.replace(/\/\/.*@/, '//****:****@');
        console.log(`[Bootstrap] ⚙️ Config Loaded:
        - NODE_ENV: ${config.nodeEnv}
        - PORT: ${config.port}
        - DATABASE_URL: ${maskedDb}
        - REDIS_HOST: ${config.redis.host}
        - REDIS_PORT: ${config.redis.port}`);
    }

    return config;
};
