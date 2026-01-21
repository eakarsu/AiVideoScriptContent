import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface HookAttributes {
  id: number;
  userId: number;
  topic: string;
  platform: string;
  hookType: string;
  targetEmotion: string;
  aiOutput: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface HookCreationAttributes extends Optional<HookAttributes, 'id'> {}

class Hook extends Model<HookAttributes, HookCreationAttributes> implements HookAttributes {
  public id!: number;
  public userId!: number;
  public topic!: string;
  public platform!: string;
  public hookType!: string;
  public targetEmotion!: string;
  public aiOutput!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Hook.init(
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
    topic: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    platform: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    hookType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'hook_type',
    },
    targetEmotion: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'target_emotion',
    },
    aiOutput: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'ai_output',
    },
  },
  {
    sequelize,
    tableName: 'hooks',
  }
);

export default Hook;
