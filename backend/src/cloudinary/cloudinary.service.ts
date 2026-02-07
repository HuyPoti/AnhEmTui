import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }

    async uploadImage(fileUri: string, folderType?: string): Promise<string> {
        try {
            const rootFolder = process.env.CLOUDINARY_FOLDER || 'anhemtui';
            let subFolder = folderType;

            if (folderType === 'tree') {
                subFolder = process.env.CLOUDINARY_FOLDER_TREE || 'tree';
            } else if (folderType === 'collections') {
                subFolder = process.env.CLOUDINARY_FOLDER_COLLECTIONS || 'collections';
            }

            const finalFolder = subFolder ? `${rootFolder}/${subFolder}` : rootFolder;
            console.log(`[Cloudinary] Uploading to folder: ${finalFolder}`);

            const result = await cloudinary.uploader.upload(fileUri, {
                folder: finalFolder,
            });
            return result.secure_url;
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw new Error('Failed to upload image');
        }
    }
}
