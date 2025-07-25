import { Request, Response } from 'express';
import personService from '../services/person.service';
import { ApiResponse, Person } from '../types';

export class PersonController {
  // 全員取得
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const persons = await personService.findAll();
      const response: ApiResponse<Person[]> = {
        success: true,
        data: persons
      };
      res.json(response);
    } catch (error) {
      console.error('Error fetching persons:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch persons'
      };
      res.status(500).json(response);
    }
  }

  // ID指定で取得
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const person = await personService.findById(id);
      
      if (!person) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Person not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<Person> = {
        success: true,
        data: person
      };
      res.json(response);
    } catch (error) {
      console.error('Error fetching person:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch person'
      };
      res.status(500).json(response);
    }
  }

  // 新規作成
  async create(req: Request, res: Response): Promise<void> {
    try {
      const personData = req.body;
      
      // 必須フィールドのバリデーション
      if (!personData.name || !personData.birthDate) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Name and birthDate are required'
        };
        res.status(400).json(response);
        return;
      }
      
      const person = await personService.create(personData);
      const response: ApiResponse<Person> = {
        success: true,
        data: person,
        message: 'Person created successfully'
      };
      res.status(201).json(response);
    } catch (error) {
      console.error('Error creating person:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to create person'
      };
      res.status(500).json(response);
    }
  }

  // 更新
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const person = await personService.update(id, updateData);
      
      if (!person) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Person not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<Person> = {
        success: true,
        data: person,
        message: 'Person updated successfully'
      };
      res.json(response);
    } catch (error) {
      console.error('Error updating person:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to update person'
      };
      res.status(500).json(response);
    }
  }

  // 削除
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await personService.delete(id);
      
      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Person not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'Person deleted successfully'
      };
      res.json(response);
    } catch (error) {
      console.error('Error deleting person:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to delete person'
      };
      res.status(500).json(response);
    }
  }

  // 支援者取得
  async getSupporters(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const supporters = await personService.getSupporters(id);
      
      const response: ApiResponse<any[]> = {
        success: true,
        data: supporters
      };
      res.json(response);
    } catch (error) {
      console.error('Error fetching supporters:', error);
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch supporters'
      };
      res.status(500).json(response);
    }
  }
}

export default new PersonController();
