import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Analytics } from '../models';
import { analyzeAnalytics } from '../services/openrouter.service';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const items = await Analytics.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']],
    });
    res.json(items);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Analytics.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Analytics not found' });
      return;
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { platform, metricType, dataInput, timeframe, aiOutput } = req.body;
    const item = await Analytics.create({
      userId: req.userId!,
      platform,
      metricType,
      dataInput,
      timeframe,
      aiOutput,
    });
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating analytics:', error);
    res.status(500).json({ error: 'Failed to create analytics' });
  }
};

export const generate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { platform, metricType, dataInput } = req.body;
    const aiOutput = await analyzeAnalytics(platform, metricType, dataInput);
    res.json({ aiOutput });
  } catch (error) {
    console.error('Error generating analytics insights:', error);
    res.status(500).json({ error: 'Failed to generate analytics insights' });
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Analytics.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Analytics not found' });
      return;
    }
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    console.error('Error updating analytics:', error);
    res.status(500).json({ error: 'Failed to update analytics' });
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Analytics.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Analytics not found' });
      return;
    }
    await item.destroy();
    res.json({ message: 'Analytics deleted successfully' });
  } catch (error) {
    console.error('Error deleting analytics:', error);
    res.status(500).json({ error: 'Failed to delete analytics' });
  }
};
