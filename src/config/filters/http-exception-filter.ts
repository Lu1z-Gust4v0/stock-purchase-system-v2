/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { DomainError } from '@/shared/errors/domain.exception';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: string[] = [];

    // 1. Handle NestJS HttpExceptions (BadRequest, Unauthorized, etc.)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resContent = exception.getResponse();

      if (typeof resContent === 'object' && resContent !== null) {
        message = (resContent as any).error || exception.name;
        const rawMessage = (resContent as any).message;
        errors = Array.isArray(rawMessage) ? rawMessage : [rawMessage];
      } else {
        message = exception.message;
        errors = [exception.message];
      }
    }
    // 2. Handle Custom Domain Errors
    else if (exception instanceof DomainError) {
      status = exception.statusCode;
      message = exception.name;
      errors = [exception.message];
    }
    // 3. Handle Generic System Errors
    else if (exception instanceof Error) {
      message = exception.name;
      errors = [exception.message];
    }

    response.status(status).json({
      message,
      errors,
    });
  }
}
