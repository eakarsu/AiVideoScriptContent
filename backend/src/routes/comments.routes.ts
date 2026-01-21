import { Router } from 'express';
import * as controller from '../controllers/comments.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.post('/generate', controller.generate);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

export default router;
