import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@/generated/prisma/client';

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.BAD_REQUEST;
    let message = 'Database Error';
    let errors: string[] = [];

    switch (exception.code) {
      case 'P2002': {
        const target =
          (exception.meta?.target as string[])?.join(', ') || 'field';
        status = HttpStatus.CONFLICT;
        message = 'Conflict';
        errors = [`A record with this ${target} already exists`];
        break;
      }

      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'Not Found';
        errors = ['The requested record was not found'];
        break;
      default:
        errors = [exception.message];
        break;
    }

    response.status(status).json({ message, errors });
  }
}
