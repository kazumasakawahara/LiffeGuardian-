import { Router } from 'express';
import decisionController from '../controllers/decision.controller';

const router = Router();

// 基本的なCRUD操作
router.get('/', decisionController.getAll);
router.get('/:id', decisionController.getById);
router.post('/', decisionController.create);
router.put('/:id', decisionController.update);
router.delete('/:id', decisionController.delete);

// 関連付け操作
router.post('/:decisionId/assign-to/:personId', decisionController.assignToPerson);
router.get('/person/:personId', decisionController.getByPersonId);

// フィルタリング
router.get('/filter/active', decisionController.getActive);
router.get('/filter/category/:category', decisionController.getByCategory);

// 立会人管理
router.post('/:decisionId/witness/:supporterId', decisionController.addWitness);
router.get('/:decisionId/witnesses', decisionController.getWitnesses);

export default router;
