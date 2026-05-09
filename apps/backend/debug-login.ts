
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AuthService } from './src/auth/auth.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const authService = app.get(AuthService);

    try {
        console.log('Testing login for admin@example.com...');
        const result = await authService.login({
            email: 'admin@example.com',
            password: 'Vol?*187'
        });
        console.log('Login successful:', !!result.access_token);
    } catch (err) {
        console.error('Login failed:', err.message);
        if (err.stack) console.error(err.stack);
    } finally {
        await app.close();
    }
}

bootstrap();
