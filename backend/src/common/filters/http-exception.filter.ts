import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  code?: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Une erreur interne est survenue.';
    let code: string | undefined;
    let details: Array<{ field: string; message: string }> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const obj = res as Record<string, unknown>;
        message =
          typeof obj.message === 'string'
            ? obj.message
            : JSON.stringify(obj.message);

        if (typeof obj.code === 'string') code = obj.code;

        if (Array.isArray(obj.message)) {
          message = 'Erreur de validation.';
          details = (obj.message as string[]).map((msg) => {
            const parts = msg.split(' ');
            return { field: parts[0], message: msg };
          });
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Erreur non gérée sur ${request.url}`, exception.stack);
    }

    // Masquer les détails techniques en production
    if (
      process.env.NODE_ENV === 'production' &&
      status === HttpStatus.INTERNAL_SERVER_ERROR
    ) {
      message = 'Une erreur interne est survenue.';
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      ...(code && { code }),
      ...(details && { details }),
    };

    response.status(status).json(errorResponse);
  }
}
