import { IsString, IsOptional } from 'class-validator';

export class UploadImageDto {
    @IsString()
    image: string;

    @IsString()
    @IsOptional()
    folder?: string;
}
