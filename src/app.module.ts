import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { BasketModule } from '@/modules/basket/basket.module';
import { QuoteModule } from '@/modules/quote/quote.module';

@Module({
  imports: [BasketModule, QuoteModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
