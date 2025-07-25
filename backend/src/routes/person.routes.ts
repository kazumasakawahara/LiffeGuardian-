import { Router } from 'express';
import personController from '../controllers/person.controller';

const router = Router();

// Person関連のルート
router.get('/', personController.getAll);
router.get('/:id', personController.getById);
router.post('/', personController.create);
router.put('/:id', personController.update);
router.delete('/:id', personController.delete);

// 関連リソースのルート
router.get('/:id/supporters', personController.getSupporters);

export default router;
