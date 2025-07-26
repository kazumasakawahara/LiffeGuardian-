import { Router } from 'express';
import aiInteractionController from '../controllers/aiInteraction.controller';

const router = Router();

// 基本的なCRUD操作
router.get('/', aiInteractionController.getAll);
router.get('/:id', aiInteractionController.getById);
router.post('/', aiInteractionController.create);
router.put('/:id', aiInteractionController.update);
router.delete('/:id', aiInteractionController.delete);

// 関連付け操作
router.post('/:interactionId/link-evidence', aiInteractionController.linkToEvidence);
router.get('/:interactionId/evidence', aiInteractionController.getEvidence);

// フィルタリング
router.get('/session/:sessionId', aiInteractionController.getBySessionId);
router.get('/session/:sessionId/stats', aiInteractionController.getSessionStats);
router.get('/requester/:requestedBy', aiInteractionController.getByRequestedBy);
router.get('/filter/date-range', aiInteractionController.getByDateRange);
router.get('/filter/high-confidence', aiInteractionController.getHighConfidence);

export default router;
