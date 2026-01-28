import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Comment } from '../models';
import { generateCommentReply } from '../services/openrouter.service';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const where: Record<string, unknown> = { userId: req.userId };
    if (status && ['draft', 'scheduled', 'published'].includes(status as string)) {
      where.status = status;
    }
    const items = await Comment.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
    res.json(items);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Comment.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching comment:', error);
    res.status(500).json({ error: 'Failed to fetch comment' });
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { originalComment, context, tone, platform, aiOutput, status, scheduledAt } = req.body;
    const item = await Comment.create({
      userId: req.userId!,
      originalComment,
      context,
      tone,
      platform,
      aiOutput,
      status: status || 'draft',
      scheduledAt: scheduledAt || null,
    });
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
};

export const generate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { originalComment, context = '', tone } = req.body;
    const aiOutput = await generateCommentReply(originalComment, context, tone);
    res.json({ aiOutput });
  } catch (error) {
    console.error('Error generating comment reply:', error);
    res.status(500).json({ error: 'Failed to generate comment reply' });
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Comment.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Comment.findOne({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!item) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }
    await item.destroy();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};
