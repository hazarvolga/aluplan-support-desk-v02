import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { KnowledgeSourceType } from '@aluplan/database';

export class CreateKnowledgeSourceDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsEnum(KnowledgeSourceType)
    type: KnowledgeSourceType;

    @IsOptional()
    @IsUrl()
    url?: string;
}
