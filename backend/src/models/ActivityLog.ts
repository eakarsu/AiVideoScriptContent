import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ActivityLogAttributes {
  id: number;
  userId: number;
  action: string;
  resource: string;
  resourceId: number | null;
  details: string | null;
  ipAddress: string | null;
  createdAt?: Date;
}

interface ActivityLogCreationAttributes extends Optional<ActivityLogAttributes, 'id' | 'resourceId' | 'details' | 'ipAddress'> {}

class ActivityLog extends Model<ActivityLogAttributes, ActivityLogCreationAttributes> implements ActivityLogAttributes {
  public id!: number;
  public userId!: number;
  public action!: string;
  public resource!: string;
  public resourceId!: number | null;
  public details!: string | null;
  public ipAddress!: string | null;
  public readonly createdAt!: Date;
}

ActivityLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    resource: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    resourceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'activity_logs',
    updatedAt: false,
  }
);

export default ActivityLog;
