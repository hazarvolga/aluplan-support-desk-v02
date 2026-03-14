import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ImportCustomerRecordDto {
    @IsString()
    @IsOptional()
    externalContactId?: string;

    @IsString()
    @IsNotEmpty()
    companyName: string;

    @IsString()
    @IsOptional()
    contractStatus?: string; // Müşteri Durumu

    @IsString()
    @IsOptional()
    subscriptionModel?: string; // Abonelik Modeli

    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsOptional()
    middleName?: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsOptional()
    jobTitle?: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    status?: string;
}
