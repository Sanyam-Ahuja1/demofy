import { Request, Response, NextFunction } from 'express';
import { StorageService } from '../services/storage.service';
import { ValidationError } from '../utils/errors';

export class StorageController {
  static async getUploadUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { filename, contentType } = req.body;

      if (!filename || !contentType) {
        throw new ValidationError('Filename and contentType are required');
      }

      // Prepend 'products/' folder and timestamp to ensure uniqueness and organization
      const uniqueFilename = `products/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

      const { uploadUrl, publicUrl } = await StorageService.getSignedUrl(uniqueFilename, contentType);

      res.status(200).json({
        status: 'success',
        data: {
          uploadUrl,
          publicUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
