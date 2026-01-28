import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Hashtag } from '../models';
import { generateHashtags } from '../services/openrouter.service';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const where: Record<string, unknown> = { userId: req.userId };
    if (status && ['draft', 'scheduled', 'published'].includes(status as string)) {
      where.status = status;
    }
    const items = await Hashtag.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
    res.json(items);
  } catch (error) {
    console.error('Error fetching hashtags:', error);
    res.status(500).json({ error: 'Failed to fetch hashtags' });
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Hashtag.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Hashtag not found' });
      return;
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching hashtag:', error);
    res.status(500).json({ error: 'Failed to fetch hashtag' });
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { topic, platform, niche, count, aiOutput, status, scheduledAt } = req.body;
    const item = await Hashtag.create({
      userId: req.userId!,
      topic,
      platform,
      niche,
      count,
      aiOutput,
      status: status || 'draft',
      scheduledAt: scheduledAt || null,
    });
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating hashtag:', error);
    res.status(500).json({ error: 'Failed to create hashtag' });
  }
};

export const generate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { topic, platform, niche, count = 10 } = req.body;
    const aiOutput = await generateHashtags(topic, platform, niche, count);
    res.json({ aiOutput });
  } catch (error) {
    console.error('Error generating hashtags:', error);
    res.status(500).json({ error: 'Failed to generate hashtags' });
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Hashtag.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Hashtag not found' });
      return;
    }
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    console.error('Error updating hashtag:', error);
    res.status(500).json({ error: 'Failed to update hashtag' });
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Hashtag.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Hashtag not found' });
      return;
    }
    await item.destroy();
    res.json({ message: 'Hashtag deleted successfully' });
  } catch (error) {
    console.error('Error deleting hashtag:', error);
    res.status(500).json({ error: 'Failed to delete hashtag' });
  }
};
