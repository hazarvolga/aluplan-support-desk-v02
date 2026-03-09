import { IsString, IsOptional, IsArray, MinLength, MaxLength, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
// ArticleStatus is a string union — defined inline to avoid Prisma client resolution order issues

export class CreateArticleDto {
    @ApiProperty({ example: 'Şifre Sıfırlama Nasıl Yapılır?' })
    @IsString()
    @MinLength(5)
    @MaxLength(255)
    title: string;

    @ApiProperty({ example: '# Şifre Sıfırlama\n\nGiriş sayfasında...' })
    @IsString()
    @MinLength(10)
    content: string;

    @ApiPropertyOptional()
    @IsUUID()
    @IsOptional()
    categoryId?: string;

    @ApiPropertyOptional({ example: ['şifre', 'giriş'] })
    @IsArray()
    @IsOptional()
    tags?: string[];

    @ApiPropertyOptional({ enum: ['tr', 'en'], default: 'tr' })
    @IsString()
    @IsOptional()
    language?: string;

    @ApiPropertyOptional({ default: false })
    @IsBoolean()
    @IsOptional()
    isInternal?: boolean;
}

export class UpdateArticleDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    title?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    content?: string;

    @ApiPropertyOptional()
    @IsUUID()
    @IsOptional()
    categoryId?: string;

    @ApiPropertyOptional()
    @IsArray()
    @IsOptional()
    tags?: string[];

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    changeSummary?: string;

    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    isInternal?: boolean;
}

export class ReviewArticleDto {
    @ApiProperty({ description: 'true = approve, false = reject' })
    @IsBoolean()
    approved: boolean;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    note?: string;
}

export class SubmitFeedbackDto {
    @ApiProperty({ description: 'true = helpful, false = unhelpful' })
    isHelpful: boolean;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    comment?: string;
}
