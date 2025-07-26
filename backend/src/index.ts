import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { neo4jDriver } from './config/database';
import personRoutes from './routes/person.routes';
import supporterRoutes from './routes/supporter.routes';
import lifeEventRoutes from './routes/lifeEvent.routes';
import decisionRoutes from './routes/decision.routes';
import preferenceRoutes from './routes/preference.routes';
import documentRoutes from './routes/document.routes';
import emergencyInfoRoutes from './routes/emergencyInfo.routes';
import aiInteractionRoutes from './routes/aiInteraction.routes';

// 環境変数の読み込み
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェア
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ルート
app.use('/api/persons', personRoutes);
app.use('/api/supporters', supporterRoutes);
app.use('/api/life-events', lifeEventRoutes);
app.use('/api/decisions', decisionRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/emergency-info', emergencyInfoRoutes);
app.use('/api/ai-interactions', aiInteractionRoutes);

// エラーハンドリング
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// プロセス終了時の処理
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await neo4jDriver.close();
  process.exit(0);
});
