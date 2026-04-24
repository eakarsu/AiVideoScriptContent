import { Router } from 'express';
import * as controller from '../controllers/activity.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/', controller.getAll);

export default router;
