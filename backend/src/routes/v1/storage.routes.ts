import { Router } from 'express';
// Assuming we want to protect this route. 
// However, I need to check where 'authenticate' and 'authorize' (isAdmin) middlewares are located.
// Based on file list, they might be in ../middleware/auth or similar. 
// I'll check common patterns or just look at other routes.
// For now, I'll assume they are accessible or import them after checking.
// Let's check user.routes.ts for reference in the next step, but I'll write a generic one and then fix imports if needed.
// Actually, I should check first to avoid errors. 
// But I'll write it with placeholders/assumptions and fix if it errors or just check now.
// I'll skip middleware for a second to verify path, then add it.
// Actually, looking at previous `index.ts` view, `middleware/errorHandler` was imported.
// `user.routes.ts` file size was 3780, likely has auth middleware usage.
// I will blindly guess `import { authenticate, authorize } from '../middleware/auth';` which is standard.
// If it fails, I'll fix.

import { StorageController } from '../../controllers/storage.controller';
import { requireAdmin } from '../../middleware/auth';

const router = Router();

// Only admins should be able to upload product images
router.post(
  '/upload-url',
  requireAdmin,
  StorageController.getUploadUrl
);

export default router;
