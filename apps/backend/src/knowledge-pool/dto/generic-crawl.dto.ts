import { IsBoolean, IsInt, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator';

export class DiscoverGenericWebDto {
    @IsUrl()
    startUrl: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(3)
    maxDepth?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(200)
    maxCandidates?: number;

    @IsOptional()
    @IsBoolean()
    sameDomainOnly?: boolean;

    @IsOptional()
    @IsBoolean()
    dryRun?: boolean;
}
