import { Request, Response } from 'express';
import emergencyInfoService from '../services/emergencyInfo.service';
import { ApiResponse, EmergencyInfo } from '../types';

export class EmergencyInfoController {
  // 全緊急情報取得
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const infos = await emergencyInfoService.findAll();
      const response: ApiResponse<EmergencyInfo[]> = {
        success: true,
        data: infos
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
      const info = await emergencyInfoService.findById(id);
      
      if (!info) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Emergency info not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<EmergencyInfo> = {
        success: true,
        data: info
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
      const infoData = req.body;
      
      // 必須フィールドのバリデーション
      if (!infoData.infoType || !infoData.title || !infoData.content || 
          infoData.priority === undefined) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Missing required fields: infoType, title, content, and priority are required'
        };
        res.status(400).json(response);
        return;
      }

      // infoTypeのバリデーション
      const validTypes = ['医療', '連絡先', 'その他'];
      if (!validTypes.includes(infoData.infoType)) {
        const response: ApiResponse<null> = {
          success: false,
          error: `infoType must be one of: ${validTypes.join(', ')}`
        };
        res.status(400).json(response);
        return;
      }

      // priorityのバリデーション
      if (infoData.priority < 1 || infoData.priority > 3) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'priority must be between 1 and 3'
        };
        res.status(400).json(response);
        return;
      }
      
      const newInfo = await emergencyInfoService.create(infoData);
      const response: ApiResponse<EmergencyInfo> = {
        success: true,
        data: newInfo,
        message: 'Emergency info created successfully'
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
      
      // infoTypeのバリデーション（更新時）
      const validTypes = ['医療', '連絡先', 'その他'];
      if (updateData.infoType && !validTypes.includes(updateData.infoType)) {
        const response: ApiResponse<null> = {
          success: false,
          error: `infoType must be one of: ${validTypes.join(', ')}`
        };
        res.status(400).json(response);
        return;
      }

      // priorityのバリデーション（更新時）
      if (updateData.priority !== undefined && 
          (updateData.priority < 1 || updateData.priority > 3)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'priority must be between 1 and 3'
        };
        res.status(400).json(response);
        return;
      }
      
      const updatedInfo = await emergencyInfoService.update(id, updateData);
      
      if (!updatedInfo) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Emergency info not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<EmergencyInfo> = {
        success: true,
        data: updatedInfo,
        message: 'Emergency info updated successfully'
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
      const deleted = await emergencyInfoService.delete(id);
      
      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Emergency info not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'Emergency info deleted successfully'
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

  // 緊急情報を本人に関連付け
  async assignToPerson(req: Request, res: Response): Promise<void> {
    try {
      const { infoId, personId } = req.params;
      
      const assigned = await emergencyInfoService.assignToPerson(infoId, personId);
      
      if (!assigned) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Failed to assign emergency info to person'
        };
        res.status(400).json(response);
        return;
      }
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'Emergency info assigned to person successfully'
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

  // 特定の本人の緊急情報を取得
  async getByPersonId(req: Request, res: Response): Promise<void> {
    try {
      const { personId } = req.params;
      const infos = await emergencyInfoService.findByPersonId(personId);
      
      const response: ApiResponse<EmergencyInfo[]> = {
        success: true,
        data: infos
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

  // タイプ別で緊急情報を取得
  async getByType(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.params;
      const infos = await emergencyInfoService.findByType(type);
      
      const response: ApiResponse<EmergencyInfo[]> = {
        success: true,
        data: infos
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

  // 優先度別で緊急情報を取得
  async getByPriority(req: Request, res: Response): Promise<void> {
    try {
      const { priority } = req.params;
      const priorityNum = parseInt(priority);
      
      if (isNaN(priorityNum) || priorityNum < 1 || priorityNum > 3) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'priority must be a number between 1 and 3'
        };
        res.status(400).json(response);
        return;
      }
      
      const infos = await emergencyInfoService.findByPriority(priorityNum);
      
      const response: ApiResponse<EmergencyInfo[]> = {
        success: true,
        data: infos
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

  // 高優先度の緊急情報を取得
  async getHighPriority(req: Request, res: Response): Promise<void> {
    try {
      const infos = await emergencyInfoService.findHighPriority();
      
      const response: ApiResponse<EmergencyInfo[]> = {
        success: true,
        data: infos
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

  // 特定の本人の緊急連絡先を取得
  async getEmergencyContacts(req: Request, res: Response): Promise<void> {
    try {
      const { personId } = req.params;
      const contacts = await emergencyInfoService.getEmergencyContacts(personId);
      
      const response: ApiResponse<EmergencyInfo[]> = {
        success: true,
        data: contacts
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

export default new EmergencyInfoController();
