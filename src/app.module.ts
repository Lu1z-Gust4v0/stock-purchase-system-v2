import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { BasketModule } from '@/modules/basket/basket.module';
import { QuoteModule } from '@/modules/quote/quote.module';
import { PurchaseEngineModule } from '@/modules/purchase-engine/purchase-engine.module';
import { RebalancingModule } from '@/modules/rebalancing/rebalancing.module';

@Module({
  imports: [BasketModule, QuoteModule, PurchaseEngineModule, RebalancingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
