import type { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { created } from '../utils/http';
import { ApiError } from '../utils/ApiError';
import { storageService } from '../services/storage.service';

export const uploadFile = catchAsync(async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) throw ApiError.badRequest('No file provided');

  const stored = await storageService.upload({
    buffer: file.buffer,
    mimeType: file.mimetype,
    originalName: file.originalname,
    size: file.size,
  });

  return created(res, {
    file: {
      url: stored.url,
      key: stored.key,
      mimeType: stored.mimeType,
      fileName: stored.fileName,
      size: stored.size,
    },
  });
});
