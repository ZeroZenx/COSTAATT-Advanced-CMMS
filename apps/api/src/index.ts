import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT_API || 4000;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:5174', 'http://localhost:3000'],
  credentials: true
}));

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Import routes
import authRoutes from './routes/auth';
import analyticsRoutes from './routes/analytics';
import notificationRoutes from './routes/notifications';
import { authenticate } from './middleware/authenticate';

// Import services
import { slaChecker } from './services/SLAChecker';
import { workflowEngine } from './services/WorkflowEngine';
import { predictiveMaintenanceService } from './services/PredictiveMaintenanceService';
import { iotService } from './services/IoTService';
import { blockchainService } from './services/BlockchainService';
import { energyManagementService } from './services/EnergyManagementService';

// API routes
app.get('/api/v1', (req, res) => {
  res.json({
    message: 'COSTAATT CMMS API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      workOrders: '/api/v1/work-orders',
      maintenance: '/api/v1/maintenance',
      inventory: '/api/v1/inventory',
      categories: '/api/v1/categories',
      locations: '/api/v1/locations'
    }
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Basic work orders endpoint (protected)
app.get('/api/v1/work-orders', authenticate, (req, res) => {
  res.json({
    data: [
      {
        id: '1',
        title: 'Sample Work Order',
        description: 'This is a sample work order for testing',
        status: 'OPEN',
        priority: 'MEDIUM',
        location: 'Main Building - Room 101',
        category: 'Maintenance',
        createdAt: new Date().toISOString()
      }
    ],
    total: 1
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 COSTAATT CMMS API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API docs: http://localhost:${PORT}/api/v1`);
});

export default app;
