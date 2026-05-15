import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { BaseRpcExceptionFilter } from '@nestjs/microservices';
import { RmqContext } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

@Catch()
export class RmqExceptionFilter extends BaseRpcExceptionFilter {
  private readonly logger = new Logger(RmqExceptionFilter.name);

  catch(error: unknown, host: ArgumentsHost): Observable<never> {
    const ctx = host.switchToRpc().getContext<RmqContext>();
    const channel = ctx.getChannelRef() as {
      nack: (msg: unknown, allUpTo: boolean, requeue: boolean) => void;
    };
    const originalMsg = ctx.getMessage();

    this.logger.error(
      `Message processing failed, sending to DLQ: ${(error as Error).message}`,
    );

    channel.nack(originalMsg, false, false);

    return throwError(() => error);
  }
}
