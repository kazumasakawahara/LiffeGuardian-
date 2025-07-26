import { Router } from 'express';
import lifeEventController from '../controllers/lifeEvent.controller';

const router = Router();

// 基本的なCRUD操作
router.get('/', lifeEventController.getAll);
router.get('/:id', lifeEventController.getById);
router.post('/', lifeEventController.create);
router.put('/:id', lifeEventController.update);
router.delete('/:id', lifeEventController.delete);

// 関連付け操作
router.post('/:eventId/assign-to/:personId', lifeEventController.assignToPerson);
router.get('/person/:personId', lifeEventController.getByPersonId);

// フィルタリング
router.get('/filter/date-range', lifeEventController.getByDateRange);
router.get('/filter/type/:type', lifeEventController.getByType);

// イベント間の関連
router.post('/:fromEventId/relate-to/:toEventId', lifeEventController.createRelation);

export default router;
