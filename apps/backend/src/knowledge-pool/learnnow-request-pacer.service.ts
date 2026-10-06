import { Inject, Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';

export const LEARNNOW_PACING_CLOCK = Symbol('LEARNNOW_PACING_CLOCK');

export type LearnNowPacingClock = {
    now(): number;
    sleep(milliseconds: number): Promise<void>;
};

const SYSTEM_CLOCK: LearnNowPacingClock = {
    now: () => Date.now(),
    sleep: milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
};

@Injectable()
export class LearnNowRequestPacer {
    private readonly intervalMs: number;
    private turn: Promise<void> = Promise.resolve();

    constructor(
        config: ConfigService,
        private readonly redis: RedisService,
        @Optional() @Inject(LEARNNOW_PACING_CLOCK)
        private readonly clock: LearnNowPacingClock = SYSTEM_CLOCK,
    ) {
        const configured = Number(config.get('LEARNNOW_CRAWL_PACING_MS') ?? 60_000);
        this.intervalMs = Number.isFinite(configured) ? Math.max(60_000, configured) : 60_000;
    }

    async waitForTurn(): Promise<void> {
        const currentTurn = this.turn.then(async () => {
            const waitMs = Number(await this.redis.getClient().eval(
                `local current = redis.call('TIME')
                 local now = (tonumber(current[1]) * 1000) + math.floor(tonumber(current[2]) / 1000)
                 local reserved = tonumber(redis.call('GET', KEYS[1]) or now)
                 local slot = math.max(now, reserved)
                 local nextSlot = slot + tonumber(ARGV[1])
                 redis.call('SET', KEYS[1], nextSlot)
                 redis.call('PEXPIREAT', KEYS[1], nextSlot + tonumber(ARGV[1]))
                 return slot - now`,
                1,
                'learnnow:crawl:next-request-at',
                this.intervalMs,
            ));
            if (waitMs > 0) await this.clock.sleep(waitMs);
        });
        this.turn = currentTurn.catch(() => undefined);
        await currentTurn;
    }
}
