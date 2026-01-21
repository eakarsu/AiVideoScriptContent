import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Hook } from '../models';
import { generateHooks } from '../services/openrouter.service';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const items = await Hook.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']],
    });
    res.json(items);
  } catch (error) {
    console.error('Error fetching hooks:', error);
    res.status(500).json({ error: 'Failed to fetch hooks' });
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Hook.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Hook not found' });
      return;
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching hook:', error);
    res.status(500).json({ error: 'Failed to fetch hook' });
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { topic, platform, hookType, targetEmotion, aiOutput } = req.body;
    const item = await Hook.create({
      userId: req.userId!,
      topic,
      platform,
      hookType,
      targetEmotion,
      aiOutput,
    });
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating hook:', error);
    res.status(500).json({ error: 'Failed to create hook' });
  }
};

export const generate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { topic, platform, hookType } = req.body;
    const aiOutput = await generateHooks(topic, platform, hookType);
    res.json({ aiOutput });
  } catch (error) {
    console.error('Error generating hooks:', error);
    res.status(500).json({ error: 'Failed to generate hooks' });
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Hook.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Hook not found' });
      return;
    }
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    console.error('Error updating hook:', error);
    res.status(500).json({ error: 'Failed to update hook' });
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Hook.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Hook not found' });
      return;
    }
    await item.destroy();
    res.json({ message: 'Hook deleted successfully' });
  } catch (error) {
    console.error('Error deleting hook:', error);
    res.status(500).json({ error: 'Failed to delete hook' });
  }
};
