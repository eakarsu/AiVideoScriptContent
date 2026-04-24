import { Response } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../middleware/auth.middleware';
import { ViralPrediction } from '../models';
import { predictViralPotential } from '../services/openrouter.service';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, page, limit, sortBy, sortOrder } = req.query;
    const where: Record<string, unknown> = { userId: req.userId };
    if (status && ['draft', 'scheduled', 'published'].includes(status as string)) {
      where.status = status;
    }

    const pageNum = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 50;
    const order: [string, string][] = [[
      (sortBy as string) || 'createdAt',
      (sortOrder as string) || 'DESC',
    ]];

    const { count, rows } = await ViralPrediction.findAndCountAll({
      where,
      order,
      limit: pageSize,
      offset: (pageNum - 1) * pageSize,
    });

    res.json({
      data: rows,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching viral predictions:', error);
    res.status(500).json({ error: 'Failed to fetch viral predictions' });
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await ViralPrediction.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Viral prediction not found' });
      return;
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching viral prediction:', error);
    res.status(500).json({ error: 'Failed to fetch viral prediction' });
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { videoTitle, videoDescription, platform, niche, targetAudience, aiOutput, viralScore, status, scheduledAt } = req.body;
    const item = await ViralPrediction.create({
      userId: req.userId!,
      videoTitle,
      videoDescription,
      platform,
      niche,
      targetAudience,
      aiOutput,
      viralScore: viralScore || 0,
      status: status || 'draft',
      scheduledAt: scheduledAt || null,
    });
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating viral prediction:', error);
    res.status(500).json({ error: 'Failed to create viral prediction' });
  }
};

export const generate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { videoTitle, videoDescription, platform, niche, targetAudience } = req.body;
    const aiOutput = await predictViralPotential(videoTitle, videoDescription, platform, niche, targetAudience);
    res.json({ aiOutput });
  } catch (error) {
    console.error('Error generating viral prediction:', error);
    res.status(500).json({ error: 'Failed to generate viral prediction' });
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await ViralPrediction.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Viral prediction not found' });
      return;
    }
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    console.error('Error updating viral prediction:', error);
    res.status(500).json({ error: 'Failed to update viral prediction' });
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await ViralPrediction.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Viral prediction not found' });
      return;
    }
    await item.destroy();
    res.json({ message: 'Viral prediction deleted successfully' });
  } catch (error) {
    console.error('Error deleting viral prediction:', error);
    res.status(500).json({ error: 'Failed to delete viral prediction' });
  }
};

export const bulkDelete = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: 'ids array is required' });
      return;
    }
    const deleted = await ViralPrediction.destroy({
      where: { id: { [Op.in]: ids }, userId: req.userId },
    });
    res.json({ message: `${deleted} items deleted` });
  } catch (error) {
    console.error('Error bulk deleting:', error);
    res.status(500).json({ error: 'Failed to bulk delete' });
  }
};

export const bulkStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ids, status, scheduledAt } = req.body;
    if (!Array.isArray(ids) || ids.length === 0 || !status) {
      res.status(400).json({ error: 'ids array and status are required' });
      return;
    }
    const updateData: Record<string, unknown> = { status };
    if (status === 'scheduled' && scheduledAt) {
      updateData.scheduledAt = scheduledAt;
    } else if (status !== 'scheduled') {
      updateData.scheduledAt = null;
    }
    const [updated] = await ViralPrediction.update(updateData, {
      where: { id: { [Op.in]: ids }, userId: req.userId },
    });
    res.json({ message: `${updated} items updated` });
  } catch (error) {
    console.error('Error bulk status update:', error);
    res.status(500).json({ error: 'Failed to bulk update status' });
  }
};
