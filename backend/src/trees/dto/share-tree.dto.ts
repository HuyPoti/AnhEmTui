import { IsEmail, IsEnum } from 'class-validator';

export enum TreePermission {
    VIEW = 'view',
    EDIT = 'edit',
}

export class ShareTreeDto {
    @IsEmail()
    email: string;

    @IsEnum(TreePermission)
    permission: TreePermission;
}
