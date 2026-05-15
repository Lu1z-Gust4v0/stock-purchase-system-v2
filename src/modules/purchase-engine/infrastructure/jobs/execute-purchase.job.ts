import { Controller } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ExecutePurchaseUseCase } from '../../application/use-cases/execute-purchase.use-case';

@Controller()
export class ExecutePurchaseJob {
  private readonly ELIGIBLE_DAYS = [5, 15, 25];

  constructor(private readonly executePurchase: ExecutePurchaseUseCase) {}

  private isEligibleDay(date: Date): boolean {
    const day = date.getDate();
    const dayOfWeek = date.getDay();

    if (this.ELIGIBLE_DAYS.includes(day)) return true;

    // Monday: check if Saturday (day - 2) or Sunday (day - 1) was eligible
    if (dayOfWeek === 1) {
      return (
        this.ELIGIBLE_DAYS.includes(day - 2) ||
        this.ELIGIBLE_DAYS.includes(day - 1)
      );
    }

    return false;
  }

  @Cron('0 3 * * 1-5')
  async run(): Promise<void> {
    const today = new Date();
    if (!this.isEligibleDay(today)) return;
    await this.executePurchase.execute(today);
  }
}
