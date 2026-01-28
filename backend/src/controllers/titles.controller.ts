import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Title } from '../models';
import { generateTitle } from '../services/openrouter.service';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const where: Record<string, unknown> = { userId: req.userId };
    if (status && ['draft', 'scheduled', 'published'].includes(status as string)) {
      where.status = status;
    }
    const items = await Title.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
    res.json(items);
  } catch (error) {
    console.error('Error fetching titles:', error);
    res.status(500).json({ error: 'Failed to fetch titles' });
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Title.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Title not found' });
      return;
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching title:', error);
    res.status(500).json({ error: 'Failed to fetch title' });
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { topic, platform, style, keywords, aiOutput, status, scheduledAt } = req.body;
    const item = await Title.create({
      userId: req.userId!,
      topic,
      platform,
      style,
      keywords,
      aiOutput,
      status: status || 'draft',
      scheduledAt: scheduledAt || null,
    });
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating title:', error);
    res.status(500).json({ error: 'Failed to create title' });
  }
};

export const generate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { topic, platform, style } = req.body;
    const aiOutput = await generateTitle(topic, platform, style);
    res.json({ aiOutput });
  } catch (error) {
    console.error('Error generating title:', error);
    res.status(500).json({ error: 'Failed to generate title' });
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Title.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Title not found' });
      return;
    }
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    console.error('Error updating title:', error);
    res.status(500).json({ error: 'Failed to update title' });
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Title.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Title not found' });
      return;
    }
    await item.destroy();
    res.json({ message: 'Title deleted successfully' });
  } catch (error) {
    console.error('Error deleting title:', error);
    res.status(500).json({ error: 'Failed to delete title' });
  }
};
