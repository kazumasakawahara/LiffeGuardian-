import { Router } from 'express';
import supporterController from '../controllers/supporter.controller';

const router = Router();

// 基本的なCRUD操作
router.get('/', supporterController.getAll);
router.get('/:id', supporterController.getById);
router.post('/', supporterController.create);
router.put('/:id', supporterController.update);
router.delete('/:id', supporterController.delete);

// 関連付け操作
router.post('/:supporterId/assign-to/:personId', supporterController.assignToPerson);
router.delete('/:supporterId/remove-from/:personId', supporterController.removeFromPerson);
router.get('/person/:personId', supporterController.getByPersonId);

// 検証
router.post('/:id/verify', supporterController.verify);

export default router;
