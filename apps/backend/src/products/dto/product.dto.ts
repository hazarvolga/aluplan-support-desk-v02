import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    ArrayMaxSize,
    IsArray,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

const trimString = ({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value;

export class CreateProductDto {
    @ApiProperty({ example: 'Allplan Architecture', maxLength: 120 })
    @Transform(trimString)
    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    name: string;

    @ApiPropertyOptional({ example: 'Architecture product family', maxLength: 2000 })
    @Transform(trimString)
    @IsString()
    @IsOptional()
    @MaxLength(2000)
    description?: string;
}

export class UpdateProductDto {
    @ApiPropertyOptional({ example: 'Allplan Engineering', maxLength: 120 })
    @Transform(trimString)
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @MaxLength(120)
    name?: string;

    @ApiPropertyOptional({ example: 'Updated product description', maxLength: 2000 })
    @Transform(trimString)
    @IsString()
    @IsOptional()
    @MaxLength(2000)
    description?: string;
}

export class CreateProductCategoryDto {
    @ApiProperty({ example: 'Licensing', maxLength: 160 })
    @Transform(trimString)
    @IsString()
    @IsNotEmpty()
    @MaxLength(160)
    name: string;

    @ApiPropertyOptional({
        example: ['license', 'activation'],
        type: [String],
        maxItems: 100,
    })
    @IsArray()
    @IsString({ each: true })
    @MaxLength(120, { each: true })
    @ArrayMaxSize(100)
    @IsOptional()
    keywords?: string[];
}

export class UpdateProductCategoryDto {
    @ApiPropertyOptional({ example: 'Installation', maxLength: 160 })
    @Transform(trimString)
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @MaxLength(160)
    name?: string;

    @ApiPropertyOptional({
        example: ['setup', 'install'],
        type: [String],
        maxItems: 100,
    })
    @IsArray()
    @IsString({ each: true })
    @MaxLength(120, { each: true })
    @ArrayMaxSize(100)
    @IsOptional()
    keywords?: string[];
}
