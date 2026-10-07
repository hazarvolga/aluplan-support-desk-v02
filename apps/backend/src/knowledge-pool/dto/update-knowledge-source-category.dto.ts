import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty } from 'class-validator';
import {
    DATASET_CATEGORY_BY_SLUG,
    DatasetCategorySlug,
} from '../dataset-classifier';

export const KNOWLEDGE_SOURCE_CATEGORY_SLUGS = Object.keys(
    DATASET_CATEGORY_BY_SLUG,
) as DatasetCategorySlug[];

export class UpdateKnowledgeSourceCategoryDto {
    @ApiProperty({ enum: KNOWLEDGE_SOURCE_CATEGORY_SLUGS })
    @IsNotEmpty()
    @IsIn(KNOWLEDGE_SOURCE_CATEGORY_SLUGS)
    categorySlug: DatasetCategorySlug;
}
