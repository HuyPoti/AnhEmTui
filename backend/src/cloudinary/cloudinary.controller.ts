import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { UploadImageDto } from './dto/upload-image.dto';

@Controller('images')
@UseGuards(JwtAuthGuard)
export class CloudinaryController {
    constructor(private readonly cloudinaryService: CloudinaryService) { }

    @Post('upload')
    async uploadImage(@Body() uploadImageDto: UploadImageDto) {
        const { image, folder } = uploadImageDto;
        const url = await this.cloudinaryService.uploadImage(image, folder);
        return { url };
    }
}
