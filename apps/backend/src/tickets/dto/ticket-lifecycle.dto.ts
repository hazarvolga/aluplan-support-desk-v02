import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
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
    @ApiProperty({ maxLength: 2000 })
    @Transform(({ obj, value }) => obj && 'reason' in obj ? obj.reason : value)
    @IsString()
    @Matches(/\S/, { message: 'A closure reason is required' })
    @MaxLength(2000)
    reason: string;
}

export class ReopenRequestDto {
    @ApiProperty({ maxLength: 2000 })
    @Transform(({ obj, value }) => obj && 'comment' in obj ? obj.comment : value)
    @IsString()
    @Matches(/\S/, { message: 'Describe why support is needed again' })
    @MaxLength(2000)
    comment: string;
}
