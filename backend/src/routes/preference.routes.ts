import { Router } from 'express';
import preferenceController from '../controllers/preference.controller';

const router = Router();

// 基本的なCRUD操作
router.get('/', preferenceController.getAll);
router.get('/:id', preferenceController.getById);
router.post('/', preferenceController.create);
router.put('/:id', preferenceController.update);
router.delete('/:id', preferenceController.delete);

// 関連付け操作
router.post('/:preferenceId/assign-to/:personId', preferenceController.assignToPerson);
router.get('/person/:personId', preferenceController.getByPersonId);

// フィルタリング
router.get('/filter/expired', preferenceController.getExpired);
router.get('/filter/importance', preferenceController.getByImportance);
router.get('/filter/category/:category', preferenceController.getByCategory);

export default router;
