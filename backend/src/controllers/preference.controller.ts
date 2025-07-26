import { Request, Response } from 'express';
import preferenceService from '../services/preference.service';
import { ApiResponse, Preference } from '../types';

export class PreferenceController {
  // 全好み取得
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const preferences = await preferenceService.findAll();
      const response: ApiResponse<Preference[]> = {
        success: true,
        data: preferences
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
      const preference = await preferenceService.findById(id);
      
      if (!preference) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Preference not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<Preference> = {
        success: true,
        data: preference
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
      const preferenceData = req.body;
      
      // 必須フィールドのバリデーション
      if (!preferenceData.category || !preferenceData.item || !preferenceData.preference || 
          !preferenceData.importance || !preferenceData.validFrom) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Missing required fields: category, item, preference, importance, and validFrom are required'
        };
        res.status(400).json(response);
        return;
      }

      // categoryのバリデーション
      const validCategories = ['食事', '趣味', '生活様式', '医療', 'その他'];
      if (!validCategories.includes(preferenceData.category)) {
        const response: ApiResponse<null> = {
          success: false,
          error: `category must be one of: ${validCategories.join(', ')}`
        };
        res.status(400).json(response);
        return;
      }

      // importanceのバリデーション
      if (preferenceData.importance < 1 || preferenceData.importance > 5) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'importance must be between 1 and 5'
        };
        res.status(400).json(response);
        return;
      }
      
      const newPreference = await preferenceService.create(preferenceData);
      const response: ApiResponse<Preference> = {
        success: true,
        data: newPreference,
        message: 'Preference created successfully'
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
      
      // categoryのバリデーション（更新時）
      const validCategories = ['食事', '趣味', '生活様式', '医療', 'その他'];
      if (updateData.category && !validCategories.includes(updateData.category)) {
        const response: ApiResponse<null> = {
          success: false,
          error: `category must be one of: ${validCategories.join(', ')}`
        };
        res.status(400).json(response);
        return;
      }

      // importanceのバリデーション（更新時）
      if (updateData.importance !== undefined && 
          (updateData.importance < 1 || updateData.importance > 5)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'importance must be between 1 and 5'
        };
        res.status(400).json(response);
        return;
      }
      
      const updatedPreference = await preferenceService.update(id, updateData);
      
      if (!updatedPreference) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Preference not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<Preference> = {
        success: true,
        data: updatedPreference,
        message: 'Preference updated successfully'
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
      const deleted = await preferenceService.delete(id);
      
      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Preference not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'Preference deleted successfully'
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

  // 好みを本人に関連付け
  async assignToPerson(req: Request, res: Response): Promise<void> {
    try {
      const { preferenceId, personId } = req.params;
      const { confirmedBy } = req.body;
      
      if (!confirmedBy) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'confirmedBy is required'
        };
        res.status(400).json(response);
        return;
      }
      
      const assigned = await preferenceService.assignToPerson(preferenceId, personId, confirmedBy);
      
      if (!assigned) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Failed to assign preference to person'
        };
        res.status(400).json(response);
        return;
      }
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'Preference assigned to person successfully'
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

  // 特定の本人の好みを取得
  async getByPersonId(req: Request, res: Response): Promise<void> {
    try {
      const { personId } = req.params;
      const preferences = await preferenceService.findByPersonId(personId);
      
      const response: ApiResponse<any[]> = {
        success: true,
        data: preferences
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

  // カテゴリー別で好みを取得
  async getByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params;
      const preferences = await preferenceService.findByCategory(category);
      
      const response: ApiResponse<Preference[]> = {
        success: true,
        data: preferences
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

  // 重要度別で好みを取得
  async getByImportance(req: Request, res: Response): Promise<void> {
    try {
      const { minImportance } = req.query;
      
      if (!minImportance) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'minImportance query parameter is required'
        };
        res.status(400).json(response);
        return;
      }
      
      const importance = parseInt(minImportance as string);
      if (isNaN(importance) || importance < 1 || importance > 5) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'minImportance must be a number between 1 and 5'
        };
        res.status(400).json(response);
        return;
      }
      
      const preferences = await preferenceService.findByImportance(importance);
      
      const response: ApiResponse<Preference[]> = {
        success: true,
        data: preferences
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

  // 有効期限切れの好みを取得
  async getExpired(req: Request, res: Response): Promise<void> {
    try {
      const preferences = await preferenceService.findExpired();
      
      const response: ApiResponse<Preference[]> = {
        success: true,
        data: preferences
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

export default new PreferenceController();
