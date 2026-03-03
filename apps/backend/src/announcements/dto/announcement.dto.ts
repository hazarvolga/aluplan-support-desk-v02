import { IsString, IsOptional, IsObject, IsEnum, IsArray, IsNotEmpty } from 'class-validator';
import { AnnouncementType } from '@aluplan/database';

export class TargetCriteriaDto {
    @IsOptional()
    @IsArray()
    industries?: string[];

    @IsOptional()
    @IsArray()
    statuses?: string[];

    @IsOptional()
    @IsArray()
    tags?: string[];

    @IsOptional()
    @IsArray()
    companyNames?: string[];

    @IsOptional()
    @IsObject()
    hotinfoFilters?: Record<string, any>;
}

export class CreateAnnouncementDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    subject: string;

    @IsString()
    @IsNotEmpty()
    contentMjml: string;

    @IsObject()
    @IsNotEmpty()
    targetCriteria: TargetCriteriaDto;

    @IsEnum(AnnouncementType)
    @IsOptional()
    type?: AnnouncementType;
}

export class UpdateAnnouncementDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    subject?: string;

    @IsString()
    @IsOptional()
    contentMjml?: string;

    @IsObject()
    @IsOptional()
    targetCriteria?: TargetCriteriaDto;

    @IsEnum(AnnouncementType)
    @IsOptional()
    type?: AnnouncementType;
}
