import { IsString, IsArray, IsOptional, IsBoolean, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SyncNodeDto {
    @IsString()
    id: string;

    @IsString()
    fullName: string;

    @IsOptional()
    @IsString()
    gender?: string;

    @IsOptional()
    @IsString()
    birthDate?: string;

    @IsBoolean()
    isAlive: boolean;

    @IsOptional()
    @IsString()
    photoUrl?: string;

    @IsOptional()
    @IsString()
    job?: string;

    @IsOptional()
    @IsString()
    alias?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNumber()
    positionX: number;

    @IsNumber()
    positionY: number;
}

class SyncEdgeDto {
    @IsString()
    id: string;

    @IsString()
    source: string;

    @IsString()
    target: string;

    @IsString()
    label: string;
}

export class SyncTreeDto {
    @IsOptional()
    @IsString()
    treeId?: string;

    @IsString()
    name: string;

    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SyncNodeDto)
    nodes: SyncNodeDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SyncEdgeDto)
    edges: SyncEdgeDto[];
}
