import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  Logger,
  type NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/** Au-delà de ce seuil, une requête est signalée comme lente. */
const SLOW_REQUEST_MS = 1_000;

/**
 * Journalise chaque requête HTTP avec sa durée.
 *
 * Le seuil de lenteur est loggé en `warn` plutôt qu'en `log` : sur un service
 * qui traite des milliers de requêtes par minute, personne ne lit la ligne
 * nominale. Isoler les requêtes lentes dans un niveau distinct les rend
 * filtrables et alertables, ce qui est le seul usage réel de ces logs.
 *
 * Les erreurs ne sont pas traitées ici : `AllExceptionsFilter` s'en charge
 * déjà, et les journaliser deux fois brouillerait les métriques.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // Les connexions WebSocket ont un cycle de vie propre : rien à mesurer ici.
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startedAt = process.hrtime.bigint();

    return next.handle().pipe(
      tap(() => {
        const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
        const line =
          `[${request.requestId ?? 'sans-id'}] ${request.method} ${request.url} ` +
          `→ ${response.statusCode} en ${durationMs.toFixed(1)} ms`;

        if (durationMs >= SLOW_REQUEST_MS) {
          this.logger.warn(`${line} (lente)`);
        } else {
          this.logger.log(line);
        }
      }),
    );
  }
}
