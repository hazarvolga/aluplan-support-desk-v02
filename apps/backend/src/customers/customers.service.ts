import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomersService {
    constructor(private prisma: PrismaService) { }

    async registerCustomer(dto: RegisterCustomerDto) {
        // 1. Check if email already exists
        const existingEmail = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingEmail) {
            throw new ConflictException('Bu e-posta adresi sistemde zaten kayıtlı.');
        }

        // 2. Check if customerNo already registered
        const existingProfile = await this.prisma.customerProfile.findUnique({
            where: { customerNo: dto.customerNo },
        });

        if (existingProfile) {
            throw new ConflictException(
                'Bu Müşteri No daha önce kaydedilmiş. Lütfen destek alınız.',
            );
        }

        // 3. CRM Validation Logic (Mock - will be replaced with real CRM API)
        const isCrmValid = this.mockVerifyCrmCustomer(dto.customerNo);

        if (!isCrmValid) {
            throw new BadRequestException(
                'Bu Müşteri No geçersizdir veya CRM sisteminde bulunamadı.',
            );
        }

        // 4. Create User + CustomerProfile in a single transaction
        return this.prisma.$transaction(async (prisma) => {
            // Ensure 'customer' role exists
            let customerRole = await prisma.role.findUnique({
                where: { name: 'customer' },
            });
            if (!customerRole) {
                customerRole = await prisma.role.create({
                    data: { name: 'customer', description: 'Destek Müşterisi' },
                });
            }

            const passwordHash = await bcrypt.hash(dto.password, 10);
            const fullName = `${dto.firstName} ${dto.lastName}`;

            // Create User with nested CustomerProfile
            const user = await prisma.user.create({
                data: {
                    email: dto.email,
                    fullName,
                    passwordHash,
                    status: 'ACTIVE',
                    userRoles: {
                        create: {
                            roleId: customerRole.id,
                        },
                    },
                    customerProfile: {
                        create: {
                            firstName: dto.firstName,
                            lastName: dto.lastName,
                            customerNo: dto.customerNo,
                            companyName: dto.company,
                            phoneNumber: dto.phone,
                            crmVerified: true,
                        },
                    },
                },
                include: {
                    customerProfile: true,
                    userRoles: { include: { role: true } },
                },
            });

            // Strip password before returning
            const { passwordHash: _, ...result } = user;
            return result;
        });
    }

    /**
     * Mock CRM verification. Replace with real API call when CRM is integrated.
     * Currently validates format: must start with "C" and be at least 5 chars.
     */
    private mockVerifyCrmCustomer(customerNo: string): boolean {
        return customerNo.length >= 5 && customerNo.startsWith('C');
    }

    async getAllCustomers() {
        return this.prisma.user.findMany({
            where: {
                userRoles: {
                    some: {
                        role: { name: 'customer' },
                    },
                },
                deletedAt: null,
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                status: true,
                createdAt: true,
                customerProfile: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}
