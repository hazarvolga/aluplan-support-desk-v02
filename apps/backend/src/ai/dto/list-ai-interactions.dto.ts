import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

export const AI_INTERACTION_TICKET_STATES = ['ALL', 'TICKETED', 'TICKETLESS'] as const;
export const AI_INTERACTION_CONFIDENCE_FILTERS = ['ALL', 'HIGH', 'MEDIUM', 'LOW', 'NO_MATCH'] as const;

export type AiInteractionTicketState = typeof AI_INTERACTION_TICKET_STATES[number];
export type AiInteractionConfidenceFilter = typeof AI_INTERACTION_CONFIDENCE_FILTERS[number];

export class ListAiInteractionsDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit = 20;

    @IsOptional()
    @IsIn(AI_INTERACTION_TICKET_STATES)
    ticketState: AiInteractionTicketState = 'ALL';

    @IsOptional()
    @IsIn(AI_INTERACTION_CONFIDENCE_FILTERS)
    confidence: AiInteractionConfidenceFilter = 'ALL';

    @IsOptional()
    @IsString()
    @MaxLength(120)
    search?: string;

    @IsOptional()
    @IsUUID()
    interactionId?: string;
}
