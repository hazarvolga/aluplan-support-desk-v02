import { Injectable, Logger } from '@nestjs/common';
import * as net from 'net';

@Injectable()
export class SmtpValidator {
    private readonly logger = new Logger(SmtpValidator.name);
    private readonly timeout = 15000; // Increased to 15s for better resilience

    async validate(email: string, mxHost: string): Promise<{ isValid: boolean; error?: string; canConnect: boolean; isGreyListed?: boolean }> {
        return new Promise((resolve) => {
            const socket = net.createConnection(25, mxHost);
            let stage = 0;
            const result = { isValid: false, error: '', canConnect: false, isGreyListed: false };

            socket.setTimeout(this.timeout);

            const cleanup = () => {
                if (!socket.destroyed) {
                    socket.write('QUIT\r\n');
                    socket.end();
                }
            };

            socket.on('connect', () => {
                result.canConnect = true;
                this.logger.debug(`Connected to MX: ${mxHost}`);
            });

            socket.on('data', (data: Buffer) => {
                const response = data.toString();
                const code = parseInt(response.substring(0, 3));

                this.logger.debug(`SMTP [${stage}] ${mxHost} <- ${response.trim()}`);

                try {
                    if (stage === 0 && code >= 200 && code < 300) {
                        socket.write(`HELO aluplan.net.tr\r\n`);
                        stage++;
                    } else if (stage === 1 && code === 250) {
                        socket.write(`MAIL FROM:<verify@allplan.net.tr>\r\n`);
                        stage++;
                    } else if (stage === 2 && code === 250) {
                        socket.write(`RCPT TO:<${email}>\r\n`);
                        stage++;
                    } else if (stage === 3) {
                        if (code === 250) {
                            result.isValid = true;
                        } else if (code === 450 || code === 451 || code === 452) {
                            result.isValid = false;
                            result.isGreyListed = true;
                            result.error = `Greylisted: ${response.trim()}`;
                        } else {
                            result.isValid = false;
                            result.error = `SMTP Rejected: ${response.trim()}`;
                        }
                        cleanup();
                        resolve(result);
                    } else if (code >= 400) {
                        result.isValid = false;
                        if (code < 500) result.isGreyListed = true;
                        result.error = `SMTP Error ${code}: ${response.trim()}`;
                        cleanup();
                        resolve(result);
                    }
                } catch (err: any) {
                    result.error = `Smtp loop error: ${err.message}`;
                    cleanup();
                    resolve(result);
                }
            });

            socket.on('error', (err: Error) => {
                result.isValid = false;
                result.error = `Socket Error: ${err.message}`;
                resolve(result);
            });

            socket.on('timeout', () => {
                result.isValid = false;
                result.error = 'Connection Timeout';
                cleanup();
                resolve(result);
            });
        });
    }
}
