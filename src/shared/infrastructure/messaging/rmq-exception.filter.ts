import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';

@Catch() // Leaving this empty means "Catch absolutely everything"
export class RmqExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(RmqExceptionFilter.name);

  catch(error: unknown, host: ArgumentsHost) {
    // 1. Strictly ignore anything that isn't a microservice/RPC context
    if (host.getType() !== 'rpc') {
      return;
    }

    const ctx = host.switchToRpc().getContext<RmqContext>();

    // 2. Extra safety check to make sure the RMQ methods exist
    const channel = ctx.getChannelRef() as {
      nack: (msg: unknown, allUpTo: boolean, requeue: boolean) => void;
    };
    const originalMsg = ctx.getMessage();

    // Safely parse the message regardless of error instance type
    const errorMessage = error instanceof Error ? error.message : String(error);

    this.logger.error(
      `Message processing failed, sending to DLQ: ${errorMessage}`,
    );

    // Negative acknowledgement sends the message straight to your Dead Letter Queue
    channel.nack(originalMsg, false, false);
  }
}
