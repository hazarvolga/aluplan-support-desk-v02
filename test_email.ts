import { NestFactory } from '@nestjs/core';
import { AppModule } from './apps/backend/src/app.module';
import { EmailService } from './apps/backend/src/email/email.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const emailService = app.get(EmailService);
  
  console.log('Sending test email...');
  try {
      await emailService.sendTicketCreated({
          customerEmail: "hazarvolga@gmail.com",
          customerName: "Test User",
          ticketNumber: "SUP-00099",
          subject: "Test Ticket Email",
          priority: "HIGH"
      });
      console.log('Sent successfully to queue');
  } catch (e) {
      console.error('Error sending:', e);
  }
  
  await app.close();
}
bootstrap();
