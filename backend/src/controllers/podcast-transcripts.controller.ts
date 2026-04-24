import { Response } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../middleware/auth.middleware';
import { PodcastTranscript } from '../models';
import { generatePodcastTranscript } from '../services/openrouter.service';

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

    const { count, rows } = await PodcastTranscript.findAndCountAll({
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
    console.error('Error fetching podcast transcripts:', error);
    res.status(500).json({ error: 'Failed to fetch podcast transcripts' });
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await PodcastTranscript.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Podcast transcript not found' });
      return;
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching podcast transcript:', error);
    res.status(500).json({ error: 'Failed to fetch podcast transcript' });
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { podcastTitle, podcastUrl, audioContent, outputFormat, includeTimestamps, includeSpeakerLabels, aiOutput, status, scheduledAt } = req.body;
    const item = await PodcastTranscript.create({
      userId: req.userId!,
      podcastTitle,
      podcastUrl,
      audioContent,
      outputFormat,
      includeTimestamps: includeTimestamps ?? true,
      includeSpeakerLabels: includeSpeakerLabels ?? true,
      aiOutput,
      status: status || 'draft',
      scheduledAt: scheduledAt || null,
    });
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating podcast transcript:', error);
    res.status(500).json({ error: 'Failed to create podcast transcript' });
  }
};

export const generate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { podcastTitle, audioContent, outputFormat, includeTimestamps, includeSpeakerLabels } = req.body;
    const aiOutput = await generatePodcastTranscript(podcastTitle, audioContent, outputFormat, includeTimestamps, includeSpeakerLabels);
    res.json({ aiOutput });
  } catch (error) {
    console.error('Error generating podcast transcript:', error);
    res.status(500).json({ error: 'Failed to generate podcast transcript' });
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await PodcastTranscript.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Podcast transcript not found' });
      return;
    }
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    console.error('Error updating podcast transcript:', error);
    res.status(500).json({ error: 'Failed to update podcast transcript' });
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await PodcastTranscript.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Podcast transcript not found' });
      return;
    }
    await item.destroy();
    res.json({ message: 'Podcast transcript deleted successfully' });
  } catch (error) {
    console.error('Error deleting podcast transcript:', error);
    res.status(500).json({ error: 'Failed to delete podcast transcript' });
  }
};

export const bulkDelete = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: 'ids array is required' });
      return;
    }
    const deleted = await PodcastTranscript.destroy({
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
    const [updated] = await PodcastTranscript.update(updateData, {
      where: { id: { [Op.in]: ids }, userId: req.userId },
    });
    res.json({ message: `${updated} items updated` });
  } catch (error) {
    console.error('Error bulk status update:', error);
    res.status(500).json({ error: 'Failed to bulk update status' });
  }
};
