import { buildApiError, type ErrorCode, type FieldError } from '@matchly/contracts';
import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

/** Traduit un statut HTTP en code d'erreur du catalogue partagé. */
const ERROR_CODE_BY_STATUS: Readonly<Record<number, ErrorCode>> = {
  [HttpStatus.BAD_REQUEST]: 'MALFORMED_REQUEST',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHENTICATED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.CONFLICT]: 'CONFLICT',
  [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMITED',
  [HttpStatus.SERVICE_UNAVAILABLE]: 'SERVICE_UNAVAILABLE',
  [HttpStatus.GATEWAY_TIMEOUT]: 'UPSTREAM_TIMEOUT',
};

/**
 * Erreur métier portant un code du catalogue partagé.
 *
 * À préférer aux exceptions HTTP de Nest partout où le client doit pouvoir
 * distinguer deux causes derrière un même statut — par exemple `FORBIDDEN` et
 * `INSUFFICIENT_ROLE`, tous deux en 403 mais qui n'appellent pas le même
 * message ni la même action côté interface.
 */
export class DomainException extends HttpException {
  constructor(
    readonly code: ErrorCode,
    message: string,
    status: number,
    readonly fields: FieldError[] = [],
  ) {
    super(message, status);
  }
}

/**
 * Filtre d'exception global.
 *
 * Garantit l'invariant central du contrat d'API : *toute* réponse d'erreur, quel
 * que soit son point d'origine, adopte l'enveloppe `{ error: { code, message,
 * … } }` définie dans `@matchly/contracts`. Sans ce filtre, une exception non
 * interceptée renverrait le format par défaut de Nest, et le frontend devrait
 * gérer deux formats — dont un non documenté.
 *
 * Les erreurs 5xx ne divulguent jamais leur message d'origine : une trace de
 * pile ou une requête SQL dans un corps de réponse est une fuite d'information
 * exploitable. Le message réel part dans les logs, avec l'identifiant de
 * corrélation qui permet de le retrouver.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const requestId = request.requestId;

    const { status, code, message, fields } = this.describe(exception);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `[${requestId ?? 'sans-id'}] ${request.method} ${request.url} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `[${requestId ?? 'sans-id'}] ${request.method} ${request.url} → ${status} ${code}`,
      );
    }

    response.status(status).json(
      buildApiError(code, message, {
        fields,
        ...(requestId !== undefined ? { requestId } : {}),
      }),
    );
  }

  /** Extrait statut, code, message et détails de n'importe quelle exception. */
  private describe(exception: unknown): {
    status: number;
    code: ErrorCode;
    message: string;
    fields: FieldError[];
  } {
    if (exception instanceof DomainException) {
      return {
        status: exception.getStatus(),
        code: exception.code,
        message: exception.message,
        fields: exception.fields,
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      return {
        status,
        code: ERROR_CODE_BY_STATUS[status] ?? 'INTERNAL_ERROR',
        message: extractMessage(payload) ?? exception.message,
        fields: [],
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_ERROR',
      // Message générique : le détail reste dans les logs.
      message: 'Une erreur interne est survenue.',
      fields: [],
    };
  }
}

/**
 * Récupère le message lisible d'une réponse d'exception Nest.
 *
 * Nest expose tantôt une chaîne, tantôt un objet `{ message: string | string[] }`
 * selon l'exception et les pipes traversés.
 */
function extractMessage(payload: unknown): string | undefined {
  if (typeof payload === 'string') return payload;

  if (typeof payload === 'object' && payload !== null && 'message' in payload) {
    const { message } = payload as { message: unknown };

    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return message.filter((m) => typeof m === 'string').join(' ');
  }

  return undefined;
}
