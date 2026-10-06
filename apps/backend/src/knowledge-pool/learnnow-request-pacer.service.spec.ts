import { LearnNowRequestPacer } from './learnnow-request-pacer.service';

describe('LearnNowRequestPacer', () => {
    it('spaces every request start by the configured interval with an injected clock', async () => {
        const sleep = jest.fn(async (milliseconds: number) => {
            void milliseconds;
        });
        const clock = { now: () => 1_000, sleep };
        const config = { get: jest.fn().mockReturnValue(60_000) };
        const evalMock = jest.fn()
            .mockResolvedValueOnce(0)
            .mockResolvedValueOnce(50_000)
            .mockResolvedValueOnce(60_000);
        const redis = { getClient: () => ({ eval: evalMock }) };
        const pacer = new LearnNowRequestPacer(config as any, redis as any, clock);

        await pacer.waitForTurn();
        await pacer.waitForTurn();
        await pacer.waitForTurn();

        expect(sleep).toHaveBeenNthCalledWith(1, 50_000);
        expect(sleep).toHaveBeenNthCalledWith(2, 60_000);
        expect(evalMock).toHaveBeenCalledTimes(3);
    });
});
