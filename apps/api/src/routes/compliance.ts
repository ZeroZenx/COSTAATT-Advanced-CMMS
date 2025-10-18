import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { complianceReportingService } from '../services/ComplianceReportingService';
import { Role } from '@prisma/client';

const router = Router();

// Get SOX compliance report
router.get('/sox', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // Default: last 90 days
    const end = endDate ? new Date(endDate as string) : new Date();

    const report = await complianceReportingService.generateSOXReport(start, end);
    res.json(report);
  } catch (error) {
    console.error('SOX report error:', error);
    res.status(500).json({ error: 'Failed to generate SOX compliance report' });
  }
});

// Get ISO compliance report
router.get('/iso', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const report = await complianceReportingService.generateISOReport(start, end);
    res.json(report);
  } catch (error) {
    console.error('ISO report error:', error);
    res.status(500).json({ error: 'Failed to generate ISO compliance report' });
  }
});

// Get OSHA compliance report
router.get('/osha', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const report = await complianceReportingService.generateOSHAReport(start, end);
    res.json(report);
  } catch (error) {
    console.error('OSHA report error:', error);
    res.status(500).json({ error: 'Failed to generate OSHA compliance report' });
  }
});

// Get comprehensive compliance dashboard
router.get('/dashboard', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const dashboard = await complianceReportingService.generateComplianceDashboard(start, end);
    res.json(dashboard);
  } catch (error) {
    console.error('Compliance dashboard error:', error);
    res.status(500).json({ error: 'Failed to generate compliance dashboard' });
  }
});

export default router;
