import { Controller, Get, Header, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReviewCenterService, ReviewCenterSummary, ReviewCenterUser } from './review-center.service';

type AuthenticatedRequest = {
    user: ReviewCenterUser & {
        sub?: string;
        email?: string;
    };
};

@ApiTags('Review Center')
@ApiBearerAuth()
@Controller('review-center')
export class ReviewCenterController {
    constructor(private readonly reviewCenterService: ReviewCenterService) { }

    @Get('summary')
    @Header('Cache-Control', 'no-store, max-age=0')
    @Header('Pragma', 'no-cache')
    @ApiOperation({ summary: 'Get authorization-scoped review center tasks' })
    getSummary(@Request() request: AuthenticatedRequest): Promise<ReviewCenterSummary> {
        return this.reviewCenterService.getSummary({
            role: request.user.role,
            permissions: request.user.permissions,
        });
    }
}
