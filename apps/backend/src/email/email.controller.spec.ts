import { EmailController } from './email.controller';

describe('EmailController Gmail OAuth state', () => {
  const makeController = () => {
    const gmailProvider = {
      buildAuthUrl: jest.fn((state: string) => Promise.resolve(`https://accounts.google.com/o/oauth2/v2/auth?state=${state}`)),
      handleCallback: jest.fn().mockResolvedValue({ email: 'newsletters@aluplan.info' }),
    };
    const redis = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };
    const controller = new EmailController(
      {} as any,
      {} as any,
      gmailProvider as any,
      {} as any,
      {} as any,
      redis as any,
    );

    return { controller, gmailProvider, redis };
  };

  const makeResponse = () => ({
    redirect: jest.fn(),
  });

  it('stores a short-lived state token and includes it in the Gmail auth URL', async () => {
    const { controller, gmailProvider, redis } = makeController();

    const result = await controller.getGmailAuthUrl({ user: { sub: 'admin-1' } });

    expect(redis.set).toHaveBeenCalledWith(
      expect.stringMatching(/^oauth:gmail:state:/),
      expect.stringContaining('"userId":"admin-1"'),
      600,
    );
    expect(gmailProvider.buildAuthUrl).toHaveBeenCalledWith(expect.any(String));
    expect(result.url).toContain('state=');
  });

  it('rejects callback without a valid state before exchanging the code', async () => {
    const { controller, gmailProvider, redis } = makeController();
    const res = makeResponse();
    redis.get.mockResolvedValue(null);

    await controller.gmailOAuthCallback('code-1', '', 'missing-state', res as any);

    expect(gmailProvider.handleCallback).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('gmail_error=invalid_state'));
  });

  it('consumes a valid state once before storing Gmail tokens', async () => {
    const { controller, gmailProvider, redis } = makeController();
    const res = makeResponse();
    redis.get.mockResolvedValue(JSON.stringify({ userId: 'admin-1' }));

    await controller.gmailOAuthCallback('code-1', '', 'state-1', res as any);

    expect(redis.del).toHaveBeenCalledWith('oauth:gmail:state:state-1');
    expect(gmailProvider.handleCallback).toHaveBeenCalledWith('code-1');
    expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('gmail_status=success'));
  });
});
