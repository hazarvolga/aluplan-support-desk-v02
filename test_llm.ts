import { AiService } from './src/ai/ai.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';

async function bootstrap() {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [ConfigModule.forRoot()],
    providers: [AiService],
  }).compile();

  const aiService = moduleFixture.get<AiService>(AiService);
  try {
    const res = await aiService.generateText({
      system: 'You are a helpful assistant.',
      prompt: 'Hello, what is 2+2?'
    });
    console.log('Response:', res);
  } catch(e) {
    console.error('LLM Error:', e);
  }
}
bootstrap();
