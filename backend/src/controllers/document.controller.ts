import { Request, Response } from 'express';
import documentService from '../services/document.service';
import { ApiResponse, Document } from '../types';

export class DocumentController {
  // 全文書取得
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const documents = await documentService.findAll();
      const response: ApiResponse<Document[]> = {
        success: true,
        data: documents
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
      const document = await documentService.findById(id);
      
      if (!document) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Document not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<Document> = {
        success: true,
        data: document
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
      const documentData = req.body;
      
      // 必須フィールドのバリデーション
      if (!documentData.title || !documentData.documentType || !documentData.fileUrl || 
          !documentData.uploadedBy) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Missing required fields: title, documentType, fileUrl, and uploadedBy are required'
        };
        res.status(400).json(response);
        return;
      }

      // documentTypeのバリデーション
      const validTypes = ['遺言書', '委任状', '診断書', '契約書', 'その他'];
      if (!validTypes.includes(documentData.documentType)) {
        const response: ApiResponse<null> = {
          success: false,
          error: `documentType must be one of: ${validTypes.join(', ')}`
        };
        res.status(400).json(response);
        return;
      }
      
      const newDocument = await documentService.create(documentData);
      const response: ApiResponse<Document> = {
        success: true,
        data: newDocument,
        message: 'Document created successfully'
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
      
      // documentTypeのバリデーション（更新時）
      const validTypes = ['遺言書', '委任状', '診断書', '契約書', 'その他'];
      if (updateData.documentType && !validTypes.includes(updateData.documentType)) {
        const response: ApiResponse<null> = {
          success: false,
          error: `documentType must be one of: ${validTypes.join(', ')}`
        };
        res.status(400).json(response);
        return;
      }
      
      const updatedDocument = await documentService.update(id, updateData);
      
      if (!updatedDocument) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Document not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<Document> = {
        success: true,
        data: updatedDocument,
        message: 'Document updated successfully'
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
      const deleted = await documentService.delete(id);
      
      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Document not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'Document deleted successfully'
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

  // 文書を本人に関連付け
  async assignToPerson(req: Request, res: Response): Promise<void> {
    try {
      const { documentId, personId } = req.params;
      const { accessPermission } = req.body;
      
      // accessPermissionのバリデーション
      if (accessPermission !== undefined && 
          (accessPermission < 1 || accessPermission > 5)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'accessPermission must be between 1 and 5'
        };
        res.status(400).json(response);
        return;
      }
      
      const assigned = await documentService.assignToPerson(documentId, personId, accessPermission);
      
      if (!assigned) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Failed to assign document to person'
        };
        res.status(400).json(response);
        return;
      }
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'Document assigned to person successfully'
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

  // 特定の本人の文書を取得
  async getByPersonId(req: Request, res: Response): Promise<void> {
    try {
      const { personId } = req.params;
      const documents = await documentService.findByPersonId(personId);
      
      const response: ApiResponse<any[]> = {
        success: true,
        data: documents
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

  // タイプ別で文書を取得
  async getByType(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.params;
      const documents = await documentService.findByType(type);
      
      const response: ApiResponse<Document[]> = {
        success: true,
        data: documents
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

  // タグで文書を検索
  async getByTag(req: Request, res: Response): Promise<void> {
    try {
      const { tag } = req.params;
      const documents = await documentService.findByTag(tag);
      
      const response: ApiResponse<Document[]> = {
        success: true,
        data: documents
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

  // 期限切れの文書を取得
  async getExpired(req: Request, res: Response): Promise<void> {
    try {
      const documents = await documentService.findExpired();
      
      const response: ApiResponse<Document[]> = {
        success: true,
        data: documents
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

export default new DocumentController();
