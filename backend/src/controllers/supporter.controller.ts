import { Request, Response } from 'express';
import supporterService from '../services/supporter.service';
import { ApiResponse, Supporter } from '../types';

export class SupporterController {
  // 全支援者取得
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const supporters = await supporterService.findAll();
      const response: ApiResponse<Supporter[]> = {
        success: true,
        data: supporters
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  // ID指定で取得
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const supporter = await supporterService.findById(id);
      
      if (!supporter) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Supporter not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<Supporter> = {
        success: true,
        data: supporter
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  // 新規作成
  async create(req: Request, res: Response): Promise<void> {
    try {
      const supporterData = req.body;
      
      // 必須フィールドのバリデーション
      if (!supporterData.name || !supporterData.role || !supporterData.email || !supporterData.accessLevel) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Missing required fields: name, role, email, and accessLevel are required'
        };
        res.status(400).json(response);
        return;
      }

      // アクセスレベルのバリデーション
      if (supporterData.accessLevel < 1 || supporterData.accessLevel > 5) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'accessLevel must be between 1 and 5'
        };
        res.status(400).json(response);
        return;
      }
      
      const newSupporter = await supporterService.create(supporterData);
      const response: ApiResponse<Supporter> = {
        success: true,
        data: newSupporter,
        message: 'Supporter created successfully'
      };
      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  // 更新
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // アクセスレベルのバリデーション（更新時）
      if (updateData.accessLevel !== undefined && (updateData.accessLevel < 1 || updateData.accessLevel > 5)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'accessLevel must be between 1 and 5'
        };
        res.status(400).json(response);
        return;
      }
      
      const updatedSupporter = await supporterService.update(id, updateData);
      
      if (!updatedSupporter) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Supporter not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<Supporter> = {
        success: true,
        data: updatedSupporter,
        message: 'Supporter updated successfully'
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  // 削除
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await supporterService.delete(id);
      
      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Supporter not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'Supporter deleted successfully'
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  // 支援者を本人に関連付け
  async assignToPerson(req: Request, res: Response): Promise<void> {
    try {
      const { supporterId, personId } = req.params;
      const { isPrimary } = req.body;
      
      const assigned = await supporterService.assignToPerson(supporterId, personId, isPrimary);
      
      if (!assigned) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Failed to assign supporter to person'
        };
        res.status(400).json(response);
        return;
      }
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'Supporter assigned to person successfully'
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  // 本人から支援者の関連を削除
  async removeFromPerson(req: Request, res: Response): Promise<void> {
    try {
      const { supporterId, personId } = req.params;
      
      const removed = await supporterService.removeFromPerson(supporterId, personId);
      
      if (!removed) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Failed to remove supporter from person'
        };
        res.status(400).json(response);
        return;
      }
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'Supporter removed from person successfully'
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  // 特定の本人の支援者を取得
  async getByPersonId(req: Request, res: Response): Promise<void> {
    try {
      const { personId } = req.params;
      const supporters = await supporterService.findByPersonId(personId);
      
      const response: ApiResponse<any[]> = {
        success: true,
        data: supporters
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  // 支援者を検証
  async verify(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const verifiedSupporter = await supporterService.verify(id);
      
      if (!verifiedSupporter) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Supporter not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<Supporter> = {
        success: true,
        data: verifiedSupporter,
        message: 'Supporter verified successfully'
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }
}

export default new SupporterController();
