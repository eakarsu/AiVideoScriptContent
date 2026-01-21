import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Repurpose } from '../models';
import { repurposeContent } from '../services/openrouter.service';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const items = await Repurpose.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']],
    });
    res.json(items);
  } catch (error) {
    console.error('Error fetching repurpose items:', error);
    res.status(500).json({ error: 'Failed to fetch repurpose items' });
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Repurpose.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Repurpose item not found' });
      return;
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching repurpose item:', error);
    res.status(500).json({ error: 'Failed to fetch repurpose item' });
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { originalContent, sourcePlatform, targetPlatform, contentType, aiOutput } = req.body;
    const item = await Repurpose.create({
      userId: req.userId!,
      originalContent,
      sourcePlatform,
      targetPlatform,
      contentType,
      aiOutput,
    });
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating repurpose item:', error);
    res.status(500).json({ error: 'Failed to create repurpose item' });
  }
};

export const generate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { originalContent, sourcePlatform, targetPlatform } = req.body;
    const aiOutput = await repurposeContent(originalContent, sourcePlatform, targetPlatform);
    res.json({ aiOutput });
  } catch (error) {
    console.error('Error generating repurposed content:', error);
    res.status(500).json({ error: 'Failed to generate repurposed content' });
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Repurpose.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Repurpose item not found' });
      return;
    }
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    console.error('Error updating repurpose item:', error);
    res.status(500).json({ error: 'Failed to update repurpose item' });
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Repurpose.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Repurpose item not found' });
      return;
    }
    await item.destroy();
    res.json({ message: 'Repurpose item deleted successfully' });
  } catch (error) {
    console.error('Error deleting repurpose item:', error);
    res.status(500).json({ error: 'Failed to delete repurpose item' });
  }
};
