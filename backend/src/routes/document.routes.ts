import { Router } from 'express';
import documentController from '../controllers/document.controller';

const router = Router();

// 基本的なCRUD操作
router.get('/', documentController.getAll);
router.get('/:id', documentController.getById);
router.post('/', documentController.create);
router.put('/:id', documentController.update);
router.delete('/:id', documentController.delete);

// 関連付け操作
router.post('/:documentId/assign-to/:personId', documentController.assignToPerson);
router.get('/person/:personId', documentController.getByPersonId);

// フィルタリング
router.get('/filter/expired', documentController.getExpired);
router.get('/filter/type/:type', documentController.getByType);
router.get('/filter/tag/:tag', documentController.getByTag);

export default router;
