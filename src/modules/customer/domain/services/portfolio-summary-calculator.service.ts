import { AccountCustodyResponseDto } from '@/modules/custody/api/account-custody-response.dto';
import type { CustodyApiInterface } from '@/modules/custody/api/custody-api.interface';
import type { QuotesApiInterface } from '@/modules/quote/api/quotes-api.interface';
import { Money } from '@/shared/domain/money.vo';
import { DomainError } from '@/shared/errors/domain.exception';
import { Injectable } from '@nestjs/common';

type StockSummary = {
  ticker: string;
  quantity: number;
  averagePrice: Money;
  currentPrice: Money;
  currentAmount: Money;
  earnings: Money;
  earningsPercentage: number;
  allocation: number;
};

export interface PortfolioSummary {
  amountInvested: Money;
  currentAmount: Money;
  earnings: Money;
  earningsPercentage: number;
  balance: Money;
  stocks: StockSummary[];
}

export interface PortfolioSummaryCalculatorInput {
  accountCustody: AccountCustodyResponseDto;
}

@Injectable()
export class PortfolioSummaryCalculator {
  constructor(
    private readonly quotesApi: QuotesApiInterface,
    private readonly custodyApi: CustodyApiInterface,
  ) {}

  async calculate(
    input: PortfolioSummaryCalculatorInput,
  ): Promise<PortfolioSummary> {
    const { accountCustody } = input;

    const prices = await this.fetchPrices(accountCustody);

    const distributionVolume =
      await this.custodyApi.getTotalDistributionVolumeByAccountId(
        accountCustody.graphicalAccountId,
      );

    const portfolioAmount = this.calculatePortfolioCurrentAmount(
      accountCustody,
      prices,
    );

    const totalEarnings = portfolioAmount.subtract(distributionVolume);
    const earningsPercentage =
      (totalEarnings.amount / distributionVolume.amount) * 100;

    const stockSummaries = this.calculateStockSummaries(
      accountCustody,
      portfolioAmount,
      prices,
    );

    return {
      amountInvested: distributionVolume,
      currentAmount: portfolioAmount,
      earnings: totalEarnings,
      earningsPercentage: earningsPercentage,
      stocks: stockSummaries,
      balance: accountCustody.currency.amount,
    };
  }

  private calculatePortfolioCurrentAmount(
    accountCustody: AccountCustodyResponseDto,
    prices: Map<string, Money>,
  ): Money {
    return Money.fromNumber(
      Object.values(accountCustody.positions).reduce(
        (prev, curr) =>
          prev +
          this.getPriceOrThrow(curr.ticker, prices).amount * curr.quantity,
        0,
      ),
    );
  }

  private calculateStockSummaries(
    accountCustody: AccountCustodyResponseDto,
    portfolioAmount: Money,
    prices: Map<string, Money>,
  ): StockSummary[] {
    return Object.values(accountCustody.positions).map((position) => {
      const { ticker, quantity, averagePrice } = position;

      const currentPrice = this.getPriceOrThrow(ticker, prices);
      const earnings = currentPrice.subtract(averagePrice).multiply(quantity);
      const currentAmount = currentPrice.multiply(quantity);
      const earningsPercentage =
        (earnings.amount / (averagePrice.amount * quantity)) * 100;
      const allocation = (currentAmount.amount / portfolioAmount.amount) * 100;

      return {
        ticker,
        quantity,
        averagePrice,
        currentPrice,
        currentAmount,
        earnings,
        earningsPercentage,
        allocation,
      };
    });
  }

  async fetchPrices(
    accountCustody: AccountCustodyResponseDto,
  ): Promise<Map<string, Money>> {
    const tickers = new Set<string>();

    for (const ticker of Object.keys(accountCustody.positions)) {
      tickers.add(ticker);
    }

    const quotes = await this.quotesApi.getQuotes(
      Array.from(tickers),
      new Date('2026-02-02'),
    );

    return new Map(quotes.map((quote) => [quote.ticker, quote.closingPrice]));
  }

  private getPriceOrThrow(ticker: string, prices: Map<string, Money>): Money {
    const price = prices.get(ticker);

    if (price === undefined || price.amount <= 0) {
      throw new DomainError(`No valid price found for ticker ${ticker}`);
    }

    return price;
  }
}
