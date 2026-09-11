import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtGuardUser } from './jwt-auth.guard';

export const SUPPORTED_LANGUAGES = ['vi', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: SupportedLanguage = 'vi';

export type RequestWithLanguage = Request & {
  user?: JwtGuardUser;
  language?: SupportedLanguage;
};

@Injectable()
export class LanguageGuard implements CanActivate {
  private readonly logger = new Logger(LanguageGuard.name);
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithLanguage>();
    request.language = this.resolveLanguage(request.headers['accept-language']);
    return true;
  }

  private resolveLanguage(header?: string): SupportedLanguage {
    if (!header) return DEFAULT_LANGUAGE;

    // Parse "vi-VN,vi;q=0.9,en;q=0.8" → pick the first supported primary tag by weight.
    const ranked = header
      .split(',')
      .map((part) => {
        const [tag, ...params] = part.trim().split(';');
        const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
        const weight = q ? Number.parseFloat(q.slice(2)) : 1;
        const primary = tag.trim().toLowerCase().split('-')[0];
        return { primary, weight: Number.isNaN(weight) ? 0 : weight };
      })
      .sort((a, b) => b.weight - a.weight);

    const match = ranked.find((item) =>
      (SUPPORTED_LANGUAGES as readonly string[]).includes(item.primary),
    );
    return (match?.primary as SupportedLanguage) ?? DEFAULT_LANGUAGE;
  }
}
