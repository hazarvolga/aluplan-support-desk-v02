import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Matches, MaxLength, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export class ResolutionDecisionDto {
    @ApiProperty({ enum: ['CONFIRM', 'CONTINUE'] })
    @IsIn(['CONFIRM', 'CONTINUE'])
    decision: 'CONFIRM' | 'CONTINUE';

    @ApiPropertyOptional({ maxLength: 2000 })
    @Transform(({ obj, value }) => obj && 'comment' in obj ? obj.comment : value)
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    comment?: string;
}

export class CloseTicketDto {
    @ApiPropertyOptional({ maxLength: 2000 })
    @Transform(({ obj, value }) => obj && 'reason' in obj ? obj.reason : value)
    @ValidateIf((_object, value) => value !== undefined)
    @IsString()
    @MaxLength(2000)
    reason?: string;
}

export class ReopenRequestDto {
    @ApiProperty({ maxLength: 2000 })
    @Transform(({ obj, value }) => obj && 'comment' in obj ? obj.comment : value)
    @IsString()
    @Matches(/\S/, { message: 'Describe why support is needed again' })
    @MaxLength(2000)
    comment: string;
}
