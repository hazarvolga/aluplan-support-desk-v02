import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { TicketPriority } from '@aluplan/database';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSlaPolicyDto {
    @ApiProperty({ example: 'Standard Support' })
    @IsString()
    name: string;

    @ApiProperty({ enum: TicketPriority })
    @IsEnum(TicketPriority)
    priority: TicketPriority;

    @ApiProperty({ description: 'ID of the department this policy applies to' })
    @IsUUID()
    departmentId: string;

    @ApiProperty({ example: 480, description: 'Target first response time in minutes' })
    @IsNumber()
    firstResponseMinutes: number;

    @ApiProperty({ example: 1440, description: 'Target resolution time in minutes' })
    @IsNumber()
    resolutionMinutes: number;

    @ApiProperty({ default: true })
    @IsBoolean()
    @IsOptional()
    businessHoursOnly?: boolean = true;
}
