import { IsDefined, IsEnum, IsNotEmpty, IsString, IsUrl, MaxLength, ValidateIf } from 'class-validator';
import { KnowledgeSourceType } from '@aluplan/database';

export class CreateKnowledgeSourceDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    name: string;

    @IsNotEmpty()
    @IsEnum(KnowledgeSourceType)
    type: KnowledgeSourceType;

    @ValidateIf((dto: CreateKnowledgeSourceDto) => dto.type === KnowledgeSourceType.URL || dto.url !== undefined)
    @IsDefined()
    @IsUrl()
    @MaxLength(2048)
    url?: string;
}
