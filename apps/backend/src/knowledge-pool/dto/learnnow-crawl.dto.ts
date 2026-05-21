import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export type LearnNowCrawlFormat =
    | 'knowledge_article'
    | 'pdf'
    | 'technical_manual'
    | 'explaining_video'
    | 'recorded_online_session';

export class DiscoverLearnNowDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsArray()
    @IsIn(['knowledge_article', 'pdf', 'technical_manual', 'explaining_video', 'recorded_online_session'], { each: true })
    formats?: LearnNowCrawlFormat[];

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(10)
    maxPages?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(200)
    maxCandidates?: number;

    @IsOptional()
    @IsBoolean()
    dryRun?: boolean;
}
