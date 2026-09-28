import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, Min, Max, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class SubmitFeedbackDto {
    @ApiProperty({ description: 'Rating score from 1 to 5', minimum: 1, maximum: 5, example: 5 })
    @Transform(({ obj, value }) => (obj && 'score' in obj ? obj.score : value))
    @IsInt({ message: 'Puan 1 ile 5 arasında bir tam sayı olmalıdır' })
    @Min(1, { message: 'Puan en az 1 olmalıdır' })
    @Max(5, { message: 'Puan en fazla 5 olabilir' })
    score: number;

    @ApiPropertyOptional({ description: 'Optional feedback comment', maxLength: 2000 })
    @Transform(({ obj, value }) => (obj && 'comment' in obj ? obj.comment : value))
    @IsOptional()
    @IsString({ message: 'Yorum metin olmalıdır' })
    @MaxLength(2000, { message: 'Yorum en fazla 2000 karakter olabilir' })
    comment?: string;
}
