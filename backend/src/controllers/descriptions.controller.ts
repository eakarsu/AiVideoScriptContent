import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Description } from '../models';
import { generateDescription } from '../services/openrouter.service';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const items = await Description.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']],
    });
    res.json(items);
  } catch (error) {
    console.error('Error fetching descriptions:', error);
    res.status(500).json({ error: 'Failed to fetch descriptions' });
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Description.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Description not found' });
      return;
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching description:', error);
    res.status(500).json({ error: 'Failed to fetch description' });
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { videoTitle, topic, platform, includeLinks, includeCta, aiOutput } = req.body;
    const item = await Description.create({
      userId: req.userId!,
      videoTitle,
      topic,
      platform,
      includeLinks,
      includeCta,
      aiOutput,
    });
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating description:', error);
    res.status(500).json({ error: 'Failed to create description' });
  }
};

export const generate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { videoTitle, topic, platform } = req.body;
    const aiOutput = await generateDescription(videoTitle, topic, platform);
    res.json({ aiOutput });
  } catch (error) {
    console.error('Error generating description:', error);
    res.status(500).json({ error: 'Failed to generate description' });
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Description.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Description not found' });
      return;
    }
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    console.error('Error updating description:', error);
    res.status(500).json({ error: 'Failed to update description' });
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Description.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Description not found' });
      return;
    }
    await item.destroy();
    res.json({ message: 'Description deleted successfully' });
  } catch (error) {
    console.error('Error deleting description:', error);
    res.status(500).json({ error: 'Failed to delete description' });
  }
};
