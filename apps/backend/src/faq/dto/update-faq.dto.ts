import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsString, Matches, MaxLength, ValidateIf } from 'class-validator';

export class UpdateFaqDto {
    @ApiPropertyOptional({ maxLength: 1000, pattern: '\\S' })
    @ValidateIf((_object, value) => value !== undefined)
    @IsString()
    @Matches(/\S/)
    @MaxLength(1000)
    question?: string;

    @ApiPropertyOptional({ maxLength: 20000, pattern: '\\S' })
    @ValidateIf((_object, value) => value !== undefined)
    @IsString()
    @Matches(/\S/)
    @MaxLength(20000)
    answer?: string;

    @ApiPropertyOptional({
        type: 'array',
        maxItems: 50,
        items: { type: 'string', maxLength: 100 },
    })
    @ValidateIf((_object, value) => value !== undefined)
    @IsArray()
    @ArrayMaxSize(50)
    @IsString({ each: true })
    @MaxLength(100, { each: true })
    tags?: string[];
}
