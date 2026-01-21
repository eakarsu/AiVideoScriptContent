import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Thumbnail } from '../models';
import { generateThumbnailIdeas } from '../services/openrouter.service';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const items = await Thumbnail.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']],
    });
    res.json(items);
  } catch (error) {
    console.error('Error fetching thumbnails:', error);
    res.status(500).json({ error: 'Failed to fetch thumbnails' });
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Thumbnail.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Thumbnail not found' });
      return;
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching thumbnail:', error);
    res.status(500).json({ error: 'Failed to fetch thumbnail' });
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { videoTitle, topic, style, colorScheme, aiOutput } = req.body;
    const item = await Thumbnail.create({
      userId: req.userId!,
      videoTitle,
      topic,
      style,
      colorScheme,
      aiOutput,
    });
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    res.status(500).json({ error: 'Failed to create thumbnail' });
  }
};

export const generate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { videoTitle, topic, style } = req.body;
    const aiOutput = await generateThumbnailIdeas(videoTitle, topic, style);
    res.json({ aiOutput });
  } catch (error) {
    console.error('Error generating thumbnail ideas:', error);
    res.status(500).json({ error: 'Failed to generate thumbnail ideas' });
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Thumbnail.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Thumbnail not found' });
      return;
    }
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    console.error('Error updating thumbnail:', error);
    res.status(500).json({ error: 'Failed to update thumbnail' });
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Thumbnail.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Thumbnail not found' });
      return;
    }
    await item.destroy();
    res.json({ message: 'Thumbnail deleted successfully' });
  } catch (error) {
    console.error('Error deleting thumbnail:', error);
    res.status(500).json({ error: 'Failed to delete thumbnail' });
  }
};
