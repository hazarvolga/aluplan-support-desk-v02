import { Injectable, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import * as bcrypt from 'bcryptjs';

import { ImportCustomerRecordDto } from './dto/import-customers.dto';
import { HotinfoParserService } from './hotinfo-parser.service';

import { EmailService } from '../email/email.service';
import { ErrorLoggerService } from '../common/services/error-logger.service';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';

@Injectable()
export class CustomersService {
    constructor(
        private prisma: PrismaService,
        private hotinfoParser: HotinfoParserService,
        private emailService: EmailService,
        private jwtService: JwtService,
        private config: ConfigService,
        private errorLogger: ErrorLoggerService,
    ) { }

    async importCustomers(data: ImportCustomerRecordDto[]) {
        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        for (const record of data) {
            try {
                await this.prisma.$transaction(async (prisma) => {
                    let existingUser = await prisma.user.findUnique({
                        where: { email: record.email },
                        include: { customerProfile: true },
                    });

                    if (!existingUser) {
                        const tempPassword = `Aluplan${new Date().getFullYear()}!`;
                        const passwordHash = await bcrypt.hash(tempPassword, 10);

                        // Get customer role
                        const customerRole = await prisma.role.findUnique({
                            where: { name: 'CUSTOMER' }
                        });

                        existingUser = await prisma.user.create({
                            data: {
                                email: record.email,
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
                errors.push({ email: record.email, error: err.message });
            }
        }

        return { successCount, errorCount, errors };
    }

    async registerCustomer(dto: RegisterCustomerDto) {
        // 1. Check if email already exists
        const existingEmail = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingEmail) {
            throw new ConflictException('Bu e-posta adresi sistemde zaten kayıtlı.');
        }

        const isAllplan = dto.usedProducts?.some(p => p.toLowerCase().includes('allplan')) || dto.isAllplanUser;
        let finalCustomerNo = dto.customerNo;

        if (isAllplan) {
            if (!finalCustomerNo) {
                throw new BadRequestException('Allplan kullanıcıları için Müşteri No zorunludur.');
            }

            // 2. Check if customerNo already registered
            const existingProfile = await this.prisma.customerProfile.findUnique({
                where: { customerNo: finalCustomerNo },
            });

            if (existingProfile) {
                throw new ConflictException(
                    'Bu Müşteri No daha önce kaydedilmiş. Lütfen destek alınız.',
                );
            }

            // 3. CRM Validation Logic (Mock - will be replaced with real CRM API)
            const isCrmValid = this.mockVerifyCrmCustomer(finalCustomerNo);

            if (!isCrmValid) {
                throw new BadRequestException(
                    'Bu Müşteri No geçersizdir veya CRM sisteminde bulunamadı.',
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
            const passwordHash = await bcrypt.hash(dto.password, 10);
            const fullName = `${dto.firstName} ${dto.lastName}`;

            const hotinfoData = {
                usedProducts: dto.usedProducts || [],
                isAllplanUser: isAllplan,
            };

            // Create User with nested CustomerProfile
            const user = await prisma.user.create({
                data: {
                    email: dto.email,
                    fullName,
                    passwordHash,
                    status: 'INACTIVE',
                    roleId: customerRole?.id, // Explicitly assign the customer role ID
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

            return user;
        });

        // 5. Send welcome email with login details and verification link
        try {
            const verifyToken = this.jwtService.sign(
                { sub: resultUser.id, email: resultUser.email, type: 'email-verification' }
            );

            const frontendUrl = (await this.prisma.setting.findUnique({ where: { key: 'general.frontend_url' } }))?.value
                || this.config.get('FRONTEND_URL')
                || 'http://localhost:3000';

            const verifyUrl = `${frontendUrl}/verify-email?token=${verifyToken}`;

            await this.emailService.enqueueEmail({
                template: 'welcome-customer',
                to: dto.email,
                subject: 'Aluplan Destek Ekosistemine Hoş Geldiniz - E-postanızı Doğrulayın',
                priority: 1,
                data: {
                    customerName: `${dto.firstName} ${dto.lastName}`,
                    email: dto.email,
                    password: dto.password,
                    loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`,
                    verifyUrl: verifyUrl,
                }
            });
        } catch (error) {
            await this.errorLogger.logError({
                action: 'welcome_email_failed',
                message: 'Failed to send welcome email during registration',
                error,
                metadata: { email: dto.email }
            });
        }

        // Strip password before returning
        const { passwordHash: _, ...result } = resultUser;
        return result;
    }

    /**
     * Mock CRM verification. Replace with real API call when CRM is integrated.
     * Currently validates format: must start with "C" and be at least 5 chars.
     */
    private mockVerifyCrmCustomer(customerNo: string): boolean {
        return customerNo.length >= 5 && customerNo.startsWith('C');
    }

    async getAllCustomers() {
        // Ensure CUSTOMER role exists as a safety net
        let customerRole = await this.prisma.role.findFirst({
            where: { name: { equals: 'CUSTOMER', mode: 'insensitive' } }
        });

        if (!customerRole) {
            console.warn('[DIAGNOSTIC] CUSTOMER role NOT found during query, creating it.');
            customerRole = await this.prisma.role.create({
                data: { name: 'CUSTOMER', isSystem: true, description: 'Default customer role' }
            });
        }

        const allUsersCount = await this.prisma.user.count();
        const usersWithRole = await this.prisma.user.count({ where: { roleId: customerRole.id } });
        const usersWithProfile = await this.prisma.customerProfile.count();

        console.log(`[DIAGNOSTIC] Total Users: ${allUsersCount}`);
        console.log(`[DIAGNOSTIC] CUSTOMER Role ID: ${customerRole.id}`);
        console.log(`[DIAGNOSTIC] Users with this Role: ${usersWithRole}`);
        console.log(`[DIAGNOSTIC] Total Customer Profiles: ${usersWithProfile}`);

        // Return users who have the CUSTOMER role
        // Fallback: If for some reason the role assignment is lagging, but profiles exist, 
        // we might want to see them. But for now, let's stick to role-based for strictness.
        return this.prisma.user.findMany({
            where: {
                roleId: customerRole.id,
                deletedAt: null
            },
            include: {
                role: true,
                customerProfile: {
                    include: {
                    }
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateCustomer(id: string, dto: UpdateCustomerProfileDto) {
        // Find existing custom profile
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { customerProfile: true },
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
            include: { customerProfile: true }
        });

        const { passwordHash: _, ...result } = freshUser as any;
        return result;
    }

    async getCustomerById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { customerProfile: true },
        });

        if (!user || !user.customerProfile) {
            throw new NotFoundException('Customer profile not found');
        }

        const { passwordHash: _, ...result } = user as any;
        return result;
    }

    async bulkDelete(ids: string[]) {
        if (!ids || ids.length === 0) {
            return { deletedCount: 0 };
        }

        // Use Prisma's transaction to delete cascade properly or just rely on DB cascade
        // We'll update the `deletedAt` field to soft delete if using the standard approach, 
        // or actually delete them as requested:
        const result = await this.prisma.user.deleteMany({
            where: { id: { in: ids } }
        });

        return { deletedCount: result.count };
    }

    async resetPassword(id: string) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException('Customer not found');

        // Generate a random temporary password (e.g. 8 chars)
        const generateTempPass = () => Math.random().toString(36).slice(-8);
        const tempPassword = generateTempPass() + 'A1!'; // ensure some complexity

        const passwordHash = await bcrypt.hash(tempPassword, 10);
        await this.prisma.user.update({
            where: { id },
            data: { passwordHash }
        });

        // Return the plain text password so the admin can copy and send it.
        // In a real email setup, we'd fire an event.
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
                    hotinfoData: parsedData as any,
                    hotinfoRaw: xmlString,
                    hotinfoUpdatedAt: new Date()
                }
            });
        } else {
            updatedProfile = await this.prisma.customerProfile.update({
                where: { userId },
                data: {
                    hotinfoData: parsedData as any,
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

        return {
            content: profile.hotinfoRaw,
            filename: `hotinfo_${profile.user.fullName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.hxl`,
        };
    }
}
