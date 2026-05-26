import { IsBoolean, IsIn, IsInt, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator';

export type AllplanHelpCrawlMode = 'topic' | 'subtree' | 'fullBook';

export class DiscoverAllplanHelpDto {
    @IsUrl()
    startUrl: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsIn(['topic', 'subtree', 'fullBook'])
    mode?: AllplanHelpCrawlMode;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(500)
    maxCandidates?: number;

    @IsOptional()
    @IsBoolean()
    includeHidden?: boolean;

    @IsOptional()
    @IsBoolean()
    dryRun?: boolean;
}
