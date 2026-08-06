import { Injectable, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@aluplan/database';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_ROUNDS } from '../auth/security.constants';

import { ImportCustomerRecordDto } from './dto/import-customers.dto';
import { HotinfoParserService } from './hotinfo-parser.service';

import { EmailService } from '../email/email.service';
import { ErrorLoggerService } from '../common/services/error-logger.service';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';
import { CrmEmailValidatorService } from '../crm/crm-email-validator.service';
import { isInternalPlaceholderEmail } from '../email/email-recipient-guard.util';
import { normalizeEmailAddress } from '../common/utils/email-normalization.util';
import * as crypto from 'crypto';

const EMAIL_VERIFICATION_AUDIENCE = 'aluplan:email-verification';
const AUTH_ACTION_ISSUER = 'aluplan-support';

@Injectable()
export class CustomersService {
    constructor(
        private prisma: PrismaService,
        private hotinfoParser: HotinfoParserService,
        private emailService: EmailService,
        private jwtService: JwtService,
        private config: ConfigService,
        private errorLogger: ErrorLoggerService,
        private readonly crmEmailValidator: CrmEmailValidatorService,
    ) { }

    async importCustomers(data: ImportCustomerRecordDto[]) {
        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        for (const record of data) {
            try {
                const email = normalizeEmailAddress(record.email);
                await this.prisma.$transaction(async (prisma) => {
                    let existingUser = await prisma.user.findFirst({
                        where: { email: { equals: email, mode: 'insensitive' } },
                        include: { customerProfile: true },
                    });

                    if (!existingUser) {
                        const tempPassword = `Aluplan${new Date().getFullYear()}!`;
                        const passwordHash = await bcrypt.hash(tempPassword, BCRYPT_ROUNDS);

                        // Get customer role
                        const customerRole = await prisma.role.findUnique({
                            where: { name: 'CUSTOMER' }
                        });

                        existingUser = await prisma.user.create({
                            data: {
                                email,
                                fullName: record.fullName || `${record.firstName} ${record.lastName}`,
                                passwordHash,
                                roleId: customerRole?.id,
                                status: record.status?.toLowerCase() === 'active' ? 'ACTIVE' : 'INACTIVE'
                            },
                            include: { customerProfile: true },
                        });
                    }

                    if (existingUser.customerProfile) {
                        await prisma.customerProfile.update({
                            where: { userId: existingUser.id },
                            data: {
                                firstName: record.firstName,
                                lastName: record.lastName,
                                middleName: record.middleName,
                                companyName: record.companyName,
                                jobTitle: record.jobTitle,
                                phoneNumber: record.phone,
                                contractStatus: record.contractStatus,
                                subscriptionModel: record.subscriptionModel,
                                externalContactId: record.externalContactId,
                                ...(record.customerNo && { customerNo: record.customerNo }),
                            },
                        });
                    } else {
                        const customerNo = record.customerNo || `IMP-${Math.floor(1000 + Math.random() * 9000)}-${Date.now()}`;
                        await prisma.customerProfile.create({
                            data: {
                                userId: existingUser.id,
                                firstName: record.firstName,
                                lastName: record.lastName,
                                middleName: record.middleName,
                                customerNo: customerNo,
                                companyName: record.companyName,
                                jobTitle: record.jobTitle,
                                phoneNumber: record.phone,
                                contractStatus: record.contractStatus,
                                subscriptionModel: record.subscriptionModel,
                                externalContactId: record.externalContactId,
                                crmVerified: !!record.customerNo,
                            },
                        });
                    }
                });
                successCount++;
            } catch (err) {
                errorCount++;
                errors.push({ email: normalizeEmailAddress(record.email), error: err.message });
            }
        }

        return { successCount, errorCount, errors };
    }

    async registerCustomer(dto: RegisterCustomerDto) {
        const email = normalizeEmailAddress(dto.email);
        // 1. Check if email already exists
        const existingEmail = await this.prisma.user.findFirst({
            where: { email: { equals: email, mode: 'insensitive' } },
        });

        if (existingEmail && !existingEmail.deletedAt && existingEmail.status === 'ACTIVE') {
            throw new ConflictException('Bu e-posta adresi sistemde zaten kayıtlı.');
        }
        if (existingEmail?.status === 'SUSPENDED') {
            throw new ConflictException('Askıya alınmış hesap yeniden kaydedilemez. Lütfen destek ekibiyle iletişime geçin.');
        }

        const verificationJti = crypto.randomUUID();
        const verificationJtiHash = crypto
            .createHash('sha256')
            .update(verificationJti)
            .digest('hex');

        // 2. CRM validation — only for non-admin users
        if (!this.crmEmailValidator.isAdminBypass(email)) {
            const crmResult = await this.crmEmailValidator.validateEmailInCrm(email);
            if (!crmResult.isValid) {
                // CRM_ERROR = sistem hatası → fail-open (kayıt devam eder)
                // NOT_FOUND = email CRM'de yok → reddedilir
                if (crmResult.errorCode === 'NOT_FOUND') {
                    throw new BadRequestException(
                        crmResult.errorMessage || 'Bu e-posta adresi CRM sisteminde kayıtlı değil.'
                    );
                }
                // CRM_ERROR veya NETWORK_ERROR → log et ama devam et
                await this.errorLogger.logError({
                    action: 'crm_validation_fail_open',
                    message: `CRM validation failed with ${crmResult.errorCode}, allowing registration to proceed`,
                    error: new Error(crmResult.errorMessage || crmResult.errorCode || 'CRM_ERROR'),
                    metadata: { email, errorCode: crmResult.errorCode },
                });
            }
        }

        const isAllplan = dto.usedProducts?.some(p => p.toLowerCase().includes('allplan')) || dto.isAllplanUser;
        let finalCustomerNo = dto.customerNo;

        if (isAllplan) {
            if (!finalCustomerNo) {
                throw new BadRequestException('Allplan kullanıcıları için Müşteri No zorunludur.');
            }

            // 3. Check if customerNo already registered
            const existingProfile = await this.prisma.customerProfile.findUnique({
                where: { customerNo: finalCustomerNo },
            });

            if (existingProfile) {
                throw new ConflictException(
                    'Bu Müşteri No daha önce kaydedilmiş. Lütfen destek alınız.',
                );
            }
        } else {
            finalCustomerNo = `WEB-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        }

        // Obtain the default customer role
        const customerRole = await this.prisma.role.findUnique({
            where: { name: 'CUSTOMER' }
        });

        // 4. Create User + CustomerProfile in a single transaction
        const resultUser = await this.prisma.$transaction(async (prisma) => {
            const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
            const fullName = `${dto.firstName} ${dto.lastName}`;

            const hotinfoData = {
                usedProducts: dto.usedProducts || [],
                isAllplanUser: isAllplan,
            };

            // Check if user exists (for reactivation)
            const existingUser = await prisma.user.findFirst({
                where: { email: { equals: email, mode: 'insensitive' } },
                include: { customerProfile: true }
            });

            if (existingUser) {
                const claimed = await prisma.user.updateMany({
                    where: { id: existingUser.id, status: 'INACTIVE', deletedAt: null },
                    data: {
                        fullName,
                        passwordHash,
                        emailVerificationJtiHash: verificationJtiHash,
                        emailVerificationSentAt: new Date(),
                        roleId: customerRole?.id,
                    },
                });
                if (claimed.count !== 1) {
                    throw new ConflictException('Hesap durumu değişti. Lütfen sayfayı yenileyip tekrar deneyin.');
                }

                await prisma.customerProfile.upsert({
                    where: { userId: existingUser.id },
                    update: {
                        firstName: dto.firstName, lastName: dto.lastName,
                        customerNo: finalCustomerNo as string, companyName: dto.company,
                        phoneNumber: dto.phone, crmVerified: !!dto.customerNo,
                        hotinfoData, deletedAt: null,
                    },
                    create: {
                        userId: existingUser.id, firstName: dto.firstName, lastName: dto.lastName,
                        customerNo: finalCustomerNo as string, companyName: dto.company,
                        phoneNumber: dto.phone, crmVerified: !!dto.customerNo, hotinfoData,
                    },
                });
                const refreshedUser = await prisma.user.findUnique({
                    where: { id: existingUser.id },
                    include: { customerProfile: true },
                });
                if (!refreshedUser) {
                    throw new ConflictException('Hesap güncelleme sonrasında bulunamadı.');
                }
                return refreshedUser;
            }

            // Create new User with nested CustomerProfile
            return prisma.user.create({
                data: {
                    email,
                    fullName,
                    passwordHash,
                    status: 'INACTIVE',
                    emailVerificationJtiHash: verificationJtiHash,
                    emailVerificationSentAt: new Date(),
                    roleId: customerRole?.id,
                    customerProfile: {
                        create: {
                            firstName: dto.firstName,
                            lastName: dto.lastName,
                            customerNo: finalCustomerNo as string,
                            companyName: dto.company,
                            phoneNumber: dto.phone,
                            crmVerified: !!dto.customerNo,
                            hotinfoData: hotinfoData,
                        },
                    },
                },
                include: {
                    customerProfile: true,
                },
            });
        });

        // 5. Send welcome email with login details and verification link
        try {
            const verifyToken = this.jwtService.sign(
                {
                    sub: resultUser.id,
                    email: resultUser.email,
                    purpose: 'email_verify',
                    jti: verificationJti,
                },
                {
                    secret: this.config.get('AUTH_ACTION_JWT_SECRET'),
                    audience: EMAIL_VERIFICATION_AUDIENCE,
                    issuer: AUTH_ACTION_ISSUER,
                    algorithm: 'HS256',
                    expiresIn: '30m',
                },
            );

            const frontendUrl = (await this.prisma.setting.findUnique({ where: { key: 'general.frontend_url' } }))?.value
                || this.config.get('FRONTEND_URL')
                || 'http://localhost:3000';

            const verifyUrl = `${frontendUrl}/verify-email#token=${verifyToken}`;

            await this.emailService.enqueueEmail({
                template: 'welcome-customer',
                to: email,
                subject: 'Aluplan Destek Ekosistemine Hoş Geldiniz - E-postanızı Doğrulayın',
                priority: 1,
                data: {
                    customerName: `${dto.firstName} ${dto.lastName}`,
                    email,
                    loginUrl: `${this.config.get('FRONTEND_URL', 'http://localhost:3000')}/login`,
                    verifyUrl: verifyUrl,
                }
            });
        } catch (error) {
            await this.errorLogger.logError({
                action: 'welcome_email_failed',
                message: 'Failed to send welcome email during registration',
                error,
                metadata: { email }
            });
        }

        // Strip password before returning
        const { passwordHash: _, ...result } = resultUser;
        return result;
    }

    async getAllCustomers(page = 1, limit = 100, search?: string) {
        // Ensure CUSTOMER role exists as a safety net
        let customerRole = await this.prisma.role.findFirst({
            where: { name: { equals: 'CUSTOMER', mode: 'insensitive' } }
        });

        if (!customerRole) {
            customerRole = await this.prisma.role.create({
                data: { name: 'CUSTOMER', isSystem: true, description: 'Default customer role' }
            });
        }

        const skip = (page - 1) * limit;

        const where: any = {
            roleId: customerRole.id,
            deletedAt: null,
        };

        // Search filter
        if (search) {
            where.OR = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { customerProfile: { companyName: { contains: search, mode: 'insensitive' } } },
                { customerProfile: { customerNo: { contains: search, mode: 'insensitive' } } },
                { customerProfile: { account: { is: { name: { contains: search, mode: 'insensitive' } } } } },
                { customerProfile: { account: { is: { account_number: { contains: search, mode: 'insensitive' } } } } },
            ];
        }

        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                include: {
                    role: true,
                    customerProfile: {
                        include: {
                            account: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            data: data.map(customer => this.withDisplaySafeEmail(customer)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async updateCustomer(id: string, dto: UpdateCustomerProfileDto) {
        // Find existing custom profile
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                customerProfile: {
                    include: {
                        account: true,
                    },
                },
            },
        });

        if (!user || !user.customerProfile) {
            throw new NotFoundException('Customer profile not found');
        }

        // Update profile fields
        const updatedConfig: any = {};
        if (dto.firstName !== undefined) updatedConfig.firstName = dto.firstName;
        if (dto.lastName !== undefined) updatedConfig.lastName = dto.lastName;
        if (dto.companyName !== undefined) updatedConfig.companyName = dto.companyName;
        if (dto.jobTitle !== undefined) updatedConfig.jobTitle = dto.jobTitle;
        if (dto.phoneNumber !== undefined) updatedConfig.phoneNumber = dto.phoneNumber;
        if (dto.contractStatus !== undefined) updatedConfig.contractStatus = dto.contractStatus;
        if (dto.subscriptionModel !== undefined) updatedConfig.subscriptionModel = dto.subscriptionModel;
        if (dto.customerNo !== undefined) updatedConfig.customerNo = dto.customerNo;
        if (dto.isVip !== undefined) updatedConfig.isVip = dto.isVip;

        const _updatedProfile = await this.prisma.customerProfile.update({
            where: { userId: id },
            data: updatedConfig,
        });

        // Optionally update fullName on User object if names change
        if (dto.firstName || dto.lastName) {
            const newFirst = dto.firstName || user.customerProfile.firstName;
            const newLast = dto.lastName || user.customerProfile.lastName;
            await this.prisma.user.update({
                where: { id },
                data: { fullName: `${newFirst} ${newLast}`.trim() }
            });
        }

        const freshUser = await this.prisma.user.findUnique({
            where: { id },
            include: {
                customerProfile: {
                    include: {
                        account: true,
                    },
                },
            },
        });

        if (!freshUser) {
            throw new NotFoundException('Customer profile not found');
        }

        const { passwordHash: _passwordHash, ...result } = freshUser;
        return this.withDisplaySafeEmail(result);
    }

    async getCustomerById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { customerProfile: { include: { account: true } } },
        });

        if (!user || !user.customerProfile) {
            throw new NotFoundException('Customer profile not found');
        }

        const { passwordHash: _passwordHash, ...result } = user;
        return this.withDisplaySafeEmail(result);
    }

    async bulkDelete(ids: string[]) {
        if (!ids || ids.length === 0) {
            return { deletedCount: 0 };
        }

        // Use updateMany to soft-delete by setting the deletedAt field.
        const result = await this.prisma.user.updateMany({
            where: { id: { in: ids } },
            data: { deletedAt: new Date() }
        });

        return { deletedCount: result.count };
    }

    async resetPassword(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { customerProfile: true }
        });
        if (!user) throw new NotFoundException('Customer not found');
        if (isInternalPlaceholderEmail(user.email)) {
            throw new BadRequestException('Bu CRM kaydında gerçek e-posta adresi yok. Şifre sıfırlama e-postası gönderilemez.');
        }

        // Generate a random temporary password (e.g. 8 chars)
        const generateTempPass = () => Math.random().toString(36).slice(-8);
        const tempPassword = generateTempPass() + 'A1!'; // ensure some complexity

        const passwordHash = await bcrypt.hash(tempPassword, BCRYPT_ROUNDS);
        await this.prisma.user.update({
            where: { id },
            data: { passwordHash }
        });

        // Send email with the new password
        try {
            await this.emailService.sendPasswordReset({
                recipientEmail: user.email,
                customerName: user.fullName || `${user.customerProfile?.firstName} ${user.customerProfile?.lastName}`.trim() || 'Değerli Müşterimiz',
                newPassword: tempPassword, // The template handles either resetUrl or newPassword
            });
        } catch (error) {
            await this.errorLogger.logError({
                action: 'admin_password_reset_email_failed',
                message: 'Failed to send notification email after admin password reset',
                error,
                metadata: { email: user.email }
            });
        }

        // Return the plain text password so the admin can copy and send it.
        return { newPassword: tempPassword, email: user.email };
    }

    async uploadHotinfo(userId: string, fileBuffer: Buffer) {
        const xmlString = fileBuffer.toString('utf-8');
        const parsedData = this.hotinfoParser.parseHotinfo(xmlString);

        if (!parsedData) {
            throw new BadRequestException('Geçersiz Hotinfo dosyası. Lütfen geçerli bir .hxl dosyası yükleyin.');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { customerProfile: true }
        });

        if (!user) {
            throw new NotFoundException('Kullanıcı bulunamadı.');
        }

        let updatedProfile;
        if (!user.customerProfile) {
            updatedProfile = await this.prisma.customerProfile.create({
                data: {
                    userId,
                    firstName: user.fullName ? user.fullName.split(' ')[0] : 'Unknown',
                    lastName: user.fullName ? user.fullName.split(' ').slice(1).join(' ') || 'User' : 'User',
                    companyName: 'Bilinmeyen Şirket',
                    customerNo: `INT-${Date.now()}`,
                    hotinfoData: parsedData as Prisma.InputJsonValue,
                    hotinfoRaw: xmlString,
                    hotinfoUpdatedAt: new Date()
                }
            });
        } else {
            updatedProfile = await this.prisma.customerProfile.update({
                where: { userId },
                data: {
                    hotinfoData: parsedData as Prisma.InputJsonValue,
                    hotinfoRaw: xmlString,
                    hotinfoUpdatedAt: new Date(),
                },
            });
        }

        return {
            success: true,
            hotinfo: updatedProfile.hotinfoData,
            updatedAt: updatedProfile.hotinfoUpdatedAt
        };
    }

    async getHotinfoRaw(userId: string) {
        const profile = await this.prisma.customerProfile.findUnique({
            where: { userId },
            select: { hotinfoRaw: true, user: { select: { fullName: true } } },
        });

        if (!profile || !profile.hotinfoRaw) {
            throw new NotFoundException('Hotinfo dosyası bulunamadı');
        }

        const rawName = profile.user.fullName?.trim() || 'customer';
        const safeName = rawName.replace(/[^a-z0-9_-]+/gi, '_').replace(/^_+|_+$/g, '') || 'customer';

        return {
            content: profile.hotinfoRaw,
            filename: `hotinfo_${safeName}_${new Date().toISOString().split('T')[0]}.hxl`,
        };
    }

    private withDisplaySafeEmail<T extends { email?: string | null }>(customer: T): T & { email: string | null; hasRealEmail: boolean } {
        const hasRealEmail = !isInternalPlaceholderEmail(customer.email);
        return {
            ...customer,
            email: hasRealEmail ? customer.email ?? null : null,
            hasRealEmail,
        };
    }
}
