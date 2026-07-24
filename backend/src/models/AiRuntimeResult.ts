import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface Attributes { id: number; userId: number; feature: string; input: object; output: string; model: string; createdAt?: Date; updatedAt?: Date; }
type Creation = Optional<Attributes, 'id'>;

class AiRuntimeResult extends Model<Attributes, Creation> implements Attributes {
  declare id: number;
  declare userId: number;
  declare feature: string;
  declare input: object;
  declare output: string;
  declare model: string;
}

AiRuntimeResult.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  feature: { type: DataTypes.STRING(120), allowNull: false },
  input: { type: DataTypes.JSONB, allowNull: false },
  output: { type: DataTypes.TEXT, allowNull: false },
  model: { type: DataTypes.STRING(255), allowNull: false },
}, { sequelize, modelName: 'AiRuntimeResult', tableName: 'ai_runtime_results', underscored: true });

export default AiRuntimeResult;
