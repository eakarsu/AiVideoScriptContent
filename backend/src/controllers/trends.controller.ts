import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Trend } from '../models';
import { analyzeTrends } from '../services/openrouter.service';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const items = await Trend.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']],
    });
    res.json(items);
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Trend.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Trend not found' });
      return;
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching trend:', error);
    res.status(500).json({ error: 'Failed to fetch trend' });
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { niche, platform, timeframe, region, aiOutput } = req.body;
    const item = await Trend.create({
      userId: req.userId!,
      niche,
      platform,
      timeframe,
      region,
      aiOutput,
    });
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating trend:', error);
    res.status(500).json({ error: 'Failed to create trend' });
  }
};

export const generate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { niche, platform, timeframe } = req.body;
    const aiOutput = await analyzeTrends(niche, platform, timeframe);
    res.json({ aiOutput });
  } catch (error) {
    console.error('Error analyzing trends:', error);
    res.status(500).json({ error: 'Failed to analyze trends' });
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Trend.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Trend not found' });
      return;
    }
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    console.error('Error updating trend:', error);
    res.status(500).json({ error: 'Failed to update trend' });
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Trend.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Trend not found' });
      return;
    }
    await item.destroy();
    res.json({ message: 'Trend deleted successfully' });
  } catch (error) {
    console.error('Error deleting trend:', error);
    res.status(500).json({ error: 'Failed to delete trend' });
  }
};
