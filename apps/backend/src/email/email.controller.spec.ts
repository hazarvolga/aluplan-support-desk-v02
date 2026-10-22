import { BadRequestException, HttpStatus } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { EmailController } from './email.controller';
import { TemplateService } from './email.templates';

const makeController = () => new EmailController(
  {} as any,
  {} as any,
  {} as any,
  {} as any,
  {} as any,
  {} as any,
);

describe('EmailController admin template security', () => {
  let rootDir: string;
  let screensDir: string;

  beforeEach(() => {
    rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aluplan-email-controller-'));
    screensDir = path.join(rootDir, 'screens');
    fs.mkdirSync(screensDir, { recursive: true });
    fs.mkdirSync(path.join(rootDir, 'partials'), { recursive: true });
    fs.writeFileSync(path.join(rootDir, 'partials', 'header.mjml'), '<mj-section />');
    jest.spyOn(TemplateService, 'getScreensDir').mockReturnValue(screensDir);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    fs.rmSync(rootDir, { recursive: true, force: true });
  });

  it('does not read a template outside the screens directory', async () => {
    fs.writeFileSync(path.join(rootDir, 'outside.mjml'), 'private data');

    await expect(makeController().getTemplateSource('../outside')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('does not write a template outside the screens directory', async () => {
    await expect(makeController().saveTemplate('../outside', { content: '<mj-section />' }))
      .rejects.toBeInstanceOf(BadRequestException);
    expect(fs.existsSync(path.join(rootDir, 'outside.mjml'))).toBe(false);
  });

  it('rejects a template containing an include outside the trusted template root', async () => {
    await expect(makeController().saveTemplate('ticket-created', {
      content: '<mjml><mj-body><mj-include path="../../outside.mjml" /></mj-body></mjml>',
    })).rejects.toBeInstanceOf(BadRequestException);
    expect(fs.existsSync(path.join(screensDir, 'ticket-created.mjml'))).toBe(false);
  });

  it('preserves a template containing an existing include inside the trusted template root', async () => {
    const content = '<mjml><mj-body><mj-include path="../partials/header.mjml" /></mj-body></mjml>';

    await expect(makeController().saveTemplate('ticket-created', { content }))
      .resolves.toEqual({ success: true });
    expect(fs.readFileSync(path.join(screensDir, 'ticket-created.mjml'), 'utf8')).toBe(content);
  });

  it('does not expose filesystem paths or compiler diagnostics in preview errors', async () => {
    const controller = new EmailController(
      { setting: { findUnique: jest.fn().mockResolvedValue(null) } } as any,
      {} as any,
      {} as any,
      { get: jest.fn() } as any,
      {} as any,
      {} as any,
    );
    jest.spyOn(TemplateService, 'compile').mockImplementation(() => {
      throw new Error(`sensitive compiler detail at ${screensDir}`);
    });

    await expect(controller.previewTemplate('ticket-created', { body: {} })).rejects.toMatchObject({
      response: { message: 'Email template preview could not be compiled' },
    });
  });
});

describe('EmailController Gmail OAuth state', () => {
  const makeOAuthController = () => {
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
    const { controller, gmailProvider, redis } = makeOAuthController();

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
    const { controller, gmailProvider, redis } = makeOAuthController();
    const res = makeResponse();
    redis.get.mockResolvedValue(null);

    await controller.gmailOAuthCallback('code-1', '', 'missing-state', res as any);

    expect(gmailProvider.handleCallback).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('gmail_error=invalid_state'));
  });

  it('consumes a valid state once before storing Gmail tokens', async () => {
    const { controller, gmailProvider, redis } = makeOAuthController();
    const res = makeResponse();
    redis.get.mockResolvedValue(JSON.stringify({ userId: 'admin-1' }));

    await controller.gmailOAuthCallback('code-1', '', 'state-1', res as any);

    expect(redis.del).toHaveBeenCalledWith('oauth:gmail:state:state-1');
    expect(gmailProvider.handleCallback).toHaveBeenCalledWith('code-1');
    expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('gmail_status=success'));
  });

  it('redirects with a stable code and never exposes provider exception details', async () => {
    const { controller, gmailProvider, redis } = makeOAuthController();
    const res = makeResponse();
    const loggerError = jest.spyOn((controller as any).logger, 'error').mockImplementation();
    redis.get.mockResolvedValue(JSON.stringify({ userId: 'admin-1' }));
    gmailProvider.handleCallback.mockRejectedValue(
      new Error('invalid_client secret=super-sensitive-provider-detail'),
    );

    await controller.gmailOAuthCallback('code-1', '', 'state-1', res as any);

    const redirectUrl = res.redirect.mock.calls[0][0] as string;
    expect(redirectUrl).toContain('gmail_error=oauth_exchange_failed');
    expect(redirectUrl).not.toContain('invalid_client');
    expect(redirectUrl).not.toContain('super-sensitive-provider-detail');
    expect(JSON.stringify(loggerError.mock.calls)).not.toContain('super-sensitive-provider-detail');
    expect(loggerError).toHaveBeenCalledWith('Gmail OAuth callback failed', 'oauth_exchange_failed');
  });

  it('normalizes provider callback errors instead of reflecting the query value', async () => {
    const { controller } = makeOAuthController();
    const res = makeResponse();

    await controller.gmailOAuthCallback('', 'attacker-controlled-error', 'state-1', res as any);

    const redirectUrl = res.redirect.mock.calls[0][0] as string;
    expect(redirectUrl).toContain('gmail_error=oauth_exchange_failed');
    expect(redirectUrl).not.toContain('attacker-controlled-error');
  });
});

describe('EmailController Resend webhook security', () => {
  const webhookSecret = 'whsec_' + Buffer.from('resend-test-secret').toString('base64');
  const payload = {
    type: 'email.delivered',
    created_at: '2026-10-14T10:00:00.000Z',
    data: { email_id: 'resend-message-1' },
  };

  const makeResponse = () => {
    const response = {
      status: jest.fn(),
      send: jest.fn(),
    };
    response.status.mockReturnValue(response);
    response.send.mockReturnValue(response);
    return response;
  };

  const makeSignedRequest = (timestampSeconds: number, svixId = 'msg_1') => {
    const rawBody = JSON.stringify(payload);
    const signedContent = `${svixId}.${timestampSeconds}.${rawBody}`;
    const secretBytes = Buffer.from(webhookSecret.split('_')[1], 'base64');
    const signature = crypto.createHmac('sha256', secretBytes).update(signedContent).digest('base64');
    return {
      rawBody: Buffer.from(rawBody),
      headers: {
        'svix-id': svixId,
        'svix-timestamp': String(timestampSeconds),
        'svix-signature': `v1,${signature}`,
      },
    };
  };

  const makeWebhookController = (setIfAbsent = jest.fn().mockResolvedValue(true)) => {
    const prisma = {
      emailLog: {
        findUnique: jest.fn().mockResolvedValue({ id: 'log-1' }),
        update: jest.fn().mockResolvedValue({}),
      },
      emailEvent: { create: jest.fn().mockResolvedValue({}) },
      $transaction: jest.fn(),
    };
    prisma.$transaction.mockImplementation(async (callback: (tx: typeof prisma) => Promise<unknown>) => callback(prisma));
    const redis = {
      setIfAbsent,
      del: jest.fn().mockResolvedValue(undefined),
    };
    const controller = new EmailController(
      prisma as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      redis as any,
    );
    return { controller, prisma, redis, setIfAbsent };
  };

  beforeEach(() => {
    process.env.RESEND_WEBHOOK_SECRET = webhookSecret;
    jest.useFakeTimers().setSystemTime(new Date('2026-10-14T10:02:00.000Z'));
  });

  afterEach(() => {
    delete process.env.RESEND_WEBHOOK_SECRET;
    jest.useRealTimers();
  });

  it('rejects a correctly signed webhook outside the timestamp tolerance', async () => {
    const { controller, prisma, setIfAbsent } = makeWebhookController();
    const response = makeResponse();
    const staleTimestamp = Math.floor(new Date('2026-10-14T09:50:00.000Z').getTime() / 1000);

    await controller.resendWebhook(makeSignedRequest(staleTimestamp) as any, payload, response as any);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(setIfAbsent).not.toHaveBeenCalled();
    expect(prisma.emailEvent.create).not.toHaveBeenCalled();
  });

  it('processes a fresh signed event once and atomically rejects its replay', async () => {
    const setIfAbsent = jest.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    const { controller, prisma } = makeWebhookController(setIfAbsent);
    const request = makeSignedRequest(Math.floor(Date.now() / 1000));

    await controller.resendWebhook(request as any, payload, makeResponse() as any);
    await controller.resendWebhook(request as any, payload, makeResponse() as any);

    expect(setIfAbsent).toHaveBeenCalledTimes(2);
    expect(setIfAbsent).toHaveBeenCalledWith('webhook:resend:msg_1', '1', expect.any(Number));
    expect(prisma.emailEvent.create).toHaveBeenCalledTimes(1);
    expect(prisma.emailLog.update).toHaveBeenCalledTimes(1);
  });

  it('releases a failed replay claim so the same delivery can be retried successfully', async () => {
    const { controller, prisma, redis } = makeWebhookController();
    prisma.emailEvent.create.mockRejectedValueOnce(new Error('temporary database failure'));
    const failedResponse = makeResponse();
    const retryResponse = makeResponse();
    const request = makeSignedRequest(Math.floor(Date.now() / 1000));

    await controller.resendWebhook(
      request as any,
      payload,
      failedResponse as any,
    );
    await controller.resendWebhook(request as any, payload, retryResponse as any);

    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
    expect(redis.del).toHaveBeenCalledWith('webhook:resend:msg_1');
    expect(failedResponse.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
    expect(retryResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(prisma.emailLog.update).toHaveBeenCalledTimes(1);
  });
});
