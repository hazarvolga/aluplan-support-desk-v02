import { ArrayMaxSize, ArrayUnique, IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export type LearnNowCrawlFormat =
    | 'knowledge_article'
    | 'pdf'
    | 'technical_manual'
    | 'explaining_video'
    | 'recorded_online_session';

export class DiscoverLearnNowDto {
    @IsOptional()
    @IsString()
    @MaxLength(255)
    search?: string;

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(1)
    @ArrayUnique()
    @IsIn(['knowledge_article', 'pdf', 'technical_manual', 'explaining_video', 'recorded_online_session'], { each: true })
    formats?: LearnNowCrawlFormat[];

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(1)
    maxPages?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    maxCandidates?: number;

    @IsOptional()
    @IsBoolean()
    dryRun?: boolean;
}
