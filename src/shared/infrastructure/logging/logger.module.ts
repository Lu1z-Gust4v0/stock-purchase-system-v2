import { IncomingMessage, ServerResponse } from 'node:http';
import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

const isDev = process.env.NODE_ENV !== 'production';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: isDev ? 'debug' : 'info',
        transport: isDev
          ? {
              target: 'pino-pretty',
              options: { singleLine: true, colorize: true },
            }
          : undefined,
        redact: {
          paths: ['req.headers.authorization', 'req.headers.cookie'],
          censor: '[REDACTED]',
        },
        serializers: {
          req: (req: IncomingMessage) => ({ method: req.method, url: req.url }),
          res: (res: ServerResponse) => ({ statusCode: res.statusCode }),
        },
      },
    }),
  ],
  exports: [LoggerModule],
})
export class AppLoggerModule {}
