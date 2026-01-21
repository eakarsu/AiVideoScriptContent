import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Seo } from '../models';
import { optimizeSEO } from '../services/openrouter.service';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const items = await Seo.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']],
    });
    res.json(items);
  } catch (error) {
    console.error('Error fetching SEO items:', error);
    res.status(500).json({ error: 'Failed to fetch SEO items' });
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Seo.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'SEO item not found' });
      return;
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching SEO item:', error);
    res.status(500).json({ error: 'Failed to fetch SEO item' });
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { videoTitle, description, platform, targetKeywords, aiOutput } = req.body;
    const item = await Seo.create({
      userId: req.userId!,
      videoTitle,
      description,
      platform,
      targetKeywords,
      aiOutput,
    });
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating SEO item:', error);
    res.status(500).json({ error: 'Failed to create SEO item' });
  }
};

export const generate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { videoTitle, description = '', platform } = req.body;
    const aiOutput = await optimizeSEO(videoTitle, description, platform);
    res.json({ aiOutput });
  } catch (error) {
    console.error('Error generating SEO optimization:', error);
    res.status(500).json({ error: 'Failed to generate SEO optimization' });
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Seo.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'SEO item not found' });
      return;
    }
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    console.error('Error updating SEO item:', error);
    res.status(500).json({ error: 'Failed to update SEO item' });
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Seo.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'SEO item not found' });
      return;
    }
    await item.destroy();
    res.json({ message: 'SEO item deleted successfully' });
  } catch (error) {
    console.error('Error deleting SEO item:', error);
    res.status(500).json({ error: 'Failed to delete SEO item' });
  }
};
