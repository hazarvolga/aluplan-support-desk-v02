import net from 'node:net';
import tls from 'node:tls';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SmtpProvider } from './smtp.provider';
import { EmailInboundService } from './email-inbound.service';

// Transport libraries are deliberately real; only application dependencies are isolated.
jest.mock('mailparser', () => ({ simpleParser: jest.fn() }));
jest.mock('@aluplan/database', () => ({ CommunicationChannel: { EMAIL: 'EMAIL' } }), { virtual: true });
jest.mock('../prisma/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('../settings/settings.service', () => ({ SettingsService: class {} }));
jest.mock('../tickets/tickets.service', () => ({ TicketsService: class {} }));
jest.mock('../common/services/storage.service', () => ({ StorageService: class {} }));
jest.mock('../common/services/pii-masking.service', () => ({ PiiMaskingService: class {} }));

// Opt-in: fixture generation and process-start trust configuration are documented
// in test/mail-tls-fixtures.cjs. No trust/validation options are injected into clients.
const fixtureDir = process.env.MAIL_TLS_FIXTURE_DIR;
const wireDescribe = fixtureDir ? describe : describe.skip;
type Mode = 'starttls' | 'implicit' | 'no-starttls' | 'imap';
type Certificate = 'valid' | 'untrusted' | 'hostname' | 'expired';

async function mailServer(mode: Mode, certificate: Certificate = 'valid') {
    const options = {
        key: readFileSync(join(fixtureDir!, `${certificate}.key`)),
        cert: readFileSync(join(fixtureDir!, `${certificate}.pem`)),
    };
    const commands: { line: string; encrypted: boolean }[] = [];
    const sockets = new Set<net.Socket>();
    let connections = 0;
    const track = (socket: net.Socket) => {
        sockets.add(socket);
        socket.on('error', () => { /* Expected client TLS rejections. */ });
        socket.on('close', () => sockets.delete(socket));
    };
    const speak = (socket: net.Socket, encrypted: boolean, greeting = true) => {
        track(socket);
        if (greeting) socket.write(mode === 'imap' ? '* OK local IMAP ready\r\n' : '220 localhost ESMTP\r\n');
        let pending = '';
        let data = false;
        const receive = (chunk: Buffer) => {
            pending += chunk.toString();
            let newline: number;
            while ((newline = pending.indexOf('\r\n')) !== -1) {
                const line = pending.slice(0, newline);
                pending = pending.slice(newline + 2);
                if (data) {
                    if (line === '.') { data = false; socket.write('250 queued locally\r\n'); }
                    continue;
                }
                commands.push({ line, encrypted });
                if (mode === 'imap') {
                    const [tag, verb] = line.split(' ');
                    if (verb === 'CAPABILITY') socket.write(`* CAPABILITY IMAP4rev1\r\n${tag} OK capability\r\n`);
                    else if (verb === 'LOGIN') socket.write(`${tag} OK authenticated\r\n`);
                    else if (verb === 'LIST') socket.write(`${tag} OK list\r\n`);
                    else if (verb === 'LOGOUT') socket.end(`* BYE\r\n${tag} OK logout\r\n`);
                    else socket.write(`${tag} BAD unsupported command\r\n`);
                } else if (/^EHLO/.test(line)) {
                    socket.write(`250-localhost\r\n${mode === 'starttls' && !encrypted ? '250-STARTTLS\r\n' : ''}250 AUTH PLAIN\r\n`);
                } else if (line === 'STARTTLS') {
                    if (mode === 'no-starttls') socket.write('454 TLS unavailable\r\n');
                    else {
                        socket.removeListener('data', receive);
                        socket.write('220 begin TLS\r\n');
                        const secured = new tls.TLSSocket(socket, { isServer: true, secureContext: tls.createSecureContext(options) });
                        speak(secured, true, false);
                        return;
                    }
                } else if (/^AUTH/.test(line)) socket.write('235 authenticated\r\n');
                else if (/^(MAIL FROM|RCPT TO)/.test(line)) socket.write('250 OK\r\n');
                else if (line === 'DATA') { data = true; socket.write('354 send content\r\n'); }
                else if (line === 'QUIT') socket.end('221 bye\r\n');
                else socket.write('500 unsupported\r\n');
            }
        };
        socket.on('data', receive);
    };
    const server = mode === 'implicit' || mode === 'imap'
        ? tls.createServer(options, socket => speak(socket, true))
        : net.createServer(socket => speak(socket, false));
    server.on('connection', socket => { connections++; track(socket); });
    server.on('tlsClientError', () => { /* Expected rejected certificate. */ });
    await new Promise<void>((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
    });
    return {
        port: (server.address() as net.AddressInfo).port,
        commands,
        get connections() { return connections; },
        close: async () => {
            for (const socket of sockets) socket.destroy();
            await new Promise<void>(resolve => server.close(() => resolve()));
        },
    };
}

function clients(port: number, mode: Mode, imapTls = 'true') {
    const values: Record<string, string> = {
        'email.smtp.host': '127.0.0.1', 'email.smtp.port': String(port),
        'email.smtp.secure': String(mode === 'implicit'),
        'email.smtp.user': 'synthetic-user', 'email.smtp.pass': 'synthetic-password',
        'email.imap.host': '127.0.0.1', 'email.imap.port': String(port),
        'email.imap.tls': imapTls,
        'email.imap.user': 'synthetic-user', 'email.imap.pass': 'synthetic-password',
    };
    const settings = { getValue: jest.fn(async (key: string) => values[key]) };
    return {
        smtp: new SmtpProvider(settings as never),
        imap: new EmailInboundService({} as never, settings as never, {} as never, {} as never, {} as never),
        settings,
    };
}

const certificateErrors = {
    untrusted: /self.signed|unable to verify|certificate chain/i,
    hostname: /altnames|hostname|IP.*cert/i,
    expired: /expired/i,
};

wireDescribe('real mail clients over loopback TLS', () => {
    jest.setTimeout(15000);

    it.each(['starttls', 'implicit'] as const)('SMTP %s verifies and sends with a trusted certificate; AUTH is encrypted', async mode => {
        const server = await mailServer(mode);
        try {
            const { smtp } = clients(server.port, mode);
            await expect(smtp.healthCheck()).resolves.toBe(true);
            await expect(smtp.send({ from: 'sender@example.invalid', to: 'receiver@example.invalid', subject: 'Local test', html: '<p>Synthetic message</p>', text: 'Synthetic message' })).resolves.toHaveProperty('messageId');
            const auth = server.commands.filter(command => /^AUTH/.test(command.line));
            expect(auth).toHaveLength(2);
            expect(auth.every(command => command.encrypted)).toBe(true);
            expect(server.commands.some(command => command.line === 'DATA')).toBe(true);
        } finally { await server.close(); }
    });

    it.each(['starttls', 'implicit'] as const)('SMTP %s rejects all invalid certificate classes before AUTH', async mode => {
        for (const certificate of ['untrusted', 'hostname', 'expired'] as const) {
            const server = await mailServer(mode, certificate);
            try {
                const { smtp } = clients(server.port, mode);
                await expect(smtp.healthCheck()).rejects.toThrow(certificateErrors[certificate]);
                await expect(smtp.send({ from: 'sender@example.invalid', to: 'receiver@example.invalid', subject: 'Local test', html: '<p>Synthetic</p>' })).rejects.toThrow(certificateErrors[certificate]);
                expect(server.commands.filter(command => /^AUTH/.test(command.line))).toEqual([]);
                expect(server.connections).toBe(2);
            } finally { await server.close(); }
        }
    });

    it('SMTP without STARTTLS fails before sending AUTH or mail', async () => {
        const server = await mailServer('no-starttls');
        try {
            await expect(clients(server.port, 'no-starttls').smtp.send({ from: 'sender@example.invalid', to: 'receiver@example.invalid', subject: 'Local test', html: '<p>Synthetic</p>', text: 'Synthetic' })).rejects.toThrow(/TLS/i);
            expect(server.commands.some(command => command.line === 'STARTTLS')).toBe(true);
            expect(server.commands.filter(command => /^(AUTH|MAIL FROM|DATA)/.test(command.line))).toEqual([]);
            expect(server.connections).toBe(1);
        } finally { await server.close(); }
    });

    it('IMAP authenticates over direct TLS with a trusted certificate', async () => {
        const server = await mailServer('imap');
        try {
            await expect(clients(server.port, 'imap').imap.verifyImap()).resolves.toEqual({ available: true, message: 'Connection successful' });
            expect(server.commands.filter(command => / LOGIN /.test(command.line))).toEqual([expect.objectContaining({ encrypted: true })]);
        } finally { await server.close(); }
    });

    it.each(['untrusted', 'hostname', 'expired'] as const)('IMAP rejects %s certificate before LOGIN', async certificate => {
        const server = await mailServer('imap', certificate);
        try {
            await expect(clients(server.port, 'imap').imap.verifyImap()).resolves.toEqual({ available: false, message: expect.stringMatching(certificateErrors[certificate]) });
            expect(server.commands).toEqual([]);
            expect(server.connections).toBe(1);
        } finally { await server.close(); }
    });

    it('IMAP tls=false rejects both entrypoints before connecting or reading credentials', async () => {
        const server = await mailServer('imap');
        try {
            const { imap, settings } = clients(server.port, 'imap', 'false');
            await expect(imap.verifyImap()).resolves.toEqual({ available: false, message: expect.stringMatching(/TLS/) });
            await imap.handleInboundEmails();
            expect(server.connections).toBe(0);
            expect(settings.getValue).not.toHaveBeenCalledWith('email.imap.user');
            expect(settings.getValue).not.toHaveBeenCalledWith('email.imap.pass');
        } finally { await server.close(); }
    });
});
