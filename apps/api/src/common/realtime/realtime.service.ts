import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

/**
 * Broadcasts realtime events to Supabase Realtime channels over HTTP.
 *
 * Uses the stateless HTTP broadcast endpoint (POST /realtime/v1/api/broadcast)
 * rather than a persistent WebSocket connection — the right fit for serverless,
 * where holding a socket open per invocation is wasteful. Replaces the old
 * Socket.io gateway's server->client `emit`.
 */
@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);
  private readonly url: string;
  private readonly key: string;
  readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.url = this.configService.get<string>('SUPABASE_URL') || '';
    this.key =
      this.configService.get<string>('SUPABASE_SERVICE_KEY') ||
      this.configService.get<string>('SUPABASE_SECRET_KEY') ||
      '';
    this.enabled = Boolean(this.url && this.key);
  }

  async broadcast(topic: string, event: string, payload: unknown): Promise<void> {
    if (!this.enabled) return;
    try {
      await axios.post(
        `${this.url}/realtime/v1/api/broadcast`,
        { messages: [{ topic, event, payload }] },
        {
          headers: {
            apikey: this.key,
            Authorization: `Bearer ${this.key}`,
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        }
      );
    } catch (error) {
      // Realtime is a best-effort live nudge; clients also poll via REST, so a
      // failed broadcast must never break the request that triggered it.
      this.logger.warn(
        `Realtime broadcast to ${topic} failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
