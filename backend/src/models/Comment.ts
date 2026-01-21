import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CommentAttributes {
  id: number;
  userId: number;
  originalComment: string;
  context: string;
  tone: string;
  platform: string;
  aiOutput: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CommentCreationAttributes extends Optional<CommentAttributes, 'id'> {}

class Comment extends Model<CommentAttributes, CommentCreationAttributes> implements CommentAttributes {
  public id!: number;
  public userId!: number;
  public originalComment!: string;
  public context!: string;
  public tone!: string;
  public platform!: string;
  public aiOutput!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
    },
    originalComment: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'original_comment',
    },
    context: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    tone: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    platform: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    aiOutput: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'ai_output',
    },
  },
  {
    sequelize,
    tableName: 'comments',
  }
);

export default Comment;
