import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMacroDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    content: string;
}
