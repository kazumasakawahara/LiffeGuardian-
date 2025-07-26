import { Router } from 'express';
import emergencyInfoController from '../controllers/emergencyInfo.controller';

const router = Router();

// 基本的なCRUD操作
router.get('/', emergencyInfoController.getAll);
router.get('/:id', emergencyInfoController.getById);
router.post('/', emergencyInfoController.create);
router.put('/:id', emergencyInfoController.update);
router.delete('/:id', emergencyInfoController.delete);

// 関連付け操作
router.post('/:infoId/assign-to/:personId', emergencyInfoController.assignToPerson);
router.get('/person/:personId', emergencyInfoController.getByPersonId);
router.get('/person/:personId/contacts', emergencyInfoController.getEmergencyContacts);

// フィルタリング
router.get('/filter/high-priority', emergencyInfoController.getHighPriority);
router.get('/filter/type/:type', emergencyInfoController.getByType);
router.get('/filter/priority/:priority', emergencyInfoController.getByPriority);

export default router;
