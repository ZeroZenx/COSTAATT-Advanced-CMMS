import express from 'express';
import { z } from 'zod';
import { prisma } from '../../utils/prisma';

const router = express.Router();

// Validation schemas
const createItemSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  category: z.string().min(1),
  quantity: z.number().int().min(0).default(0),
  reorderLevel: z.number().int().min(0).default(0),
  unitCost: z.number().min(0).default(0),
  description: z.string().optional(),
});

const updateItemSchema = createItemSchema.partial();

const transactionSchema = z.object({
  itemId: z.string(),
  workOrderId: z.string().optional(),
  type: z.enum(['IN', 'OUT', 'ADJUST']),
  quantity: z.number().int(),
  performedById: z.string(),
  notes: z.string().optional(),
});

// GET /api/v1/inventory
router.get('/', async (req, res) => {
  try {
    const { category, lowStock } = req.query;
    
    const where: any = {};
    if (category) {
      where.category = category;
    }
    if (lowStock === 'true') {
      where.quantity = { lte: prisma.inventoryItem.fields.reorderLevel };
    }

    const items = await prisma.inventoryItem.findMany({
      where,
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            performedBy: {
              select: { id: true, displayName: true }
            },
            workOrder: {
              select: { id: true, title: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Calculate low stock items
    const lowStockItems = items.filter(item => item.quantity <= item.reorderLevel);

    res.json({
      data: items,
      total: items.length,
      lowStockCount: lowStockItems.length,
      lowStockItems: lowStockItems.map(item => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        reorderLevel: item.reorderLevel
      }))
    });
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    res.status(500).json({ error: 'Failed to fetch inventory items' });
  }
});

// GET /api/v1/inventory/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          include: {
            performedBy: {
              select: { id: true, displayName: true }
            },
            workOrder: {
              select: { id: true, title: true }
            }
          }
        }
      }
    });

    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    res.json({ data: item });
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ error: 'Failed to fetch inventory item' });
  }
});

// POST /api/v1/inventory
router.post('/', async (req, res) => {
  try {
    const validatedData = createItemSchema.parse(req.body);
    
    const item = await prisma.inventoryItem.create({
      data: validatedData
    });

    res.status(201).json({ data: item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating inventory item:', error);
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
});

// PATCH /api/v1/inventory/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateItemSchema.parse(req.body);
    
    const item = await prisma.inventoryItem.update({
      where: { id },
      data: validatedData
    });

    res.json({ data: item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating inventory item:', error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

// POST /api/v1/inventory/transaction
router.post('/transaction', async (req, res) => {
  try {
    const validatedData = transactionSchema.parse(req.body);
    
    // Start a transaction to update item quantity and create transaction record
    const result = await prisma.$transaction(async (tx) => {
      // Get current item
      const item = await tx.inventoryItem.findUnique({
        where: { id: validatedData.itemId }
      });

      if (!item) {
        throw new Error('Inventory item not found');
      }

      // Calculate new quantity
      let newQuantity = item.quantity;
      if (validatedData.type === 'IN') {
        newQuantity += validatedData.quantity;
      } else if (validatedData.type === 'OUT') {
        newQuantity -= validatedData.quantity;
        if (newQuantity < 0) {
          throw new Error('Insufficient inventory quantity');
        }
      } else if (validatedData.type === 'ADJUST') {
        newQuantity = validatedData.quantity;
      }

      // Update item quantity
      const updatedItem = await tx.inventoryItem.update({
        where: { id: validatedData.itemId },
        data: { quantity: newQuantity }
      });

      // Create transaction record
      const transaction = await tx.inventoryTransaction.create({
        data: validatedData,
        include: {
          performedBy: {
            select: { id: true, displayName: true }
          },
          workOrder: {
            select: { id: true, title: true }
          }
        }
      });

      return { item: updatedItem, transaction };
    });

    res.status(201).json({ data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating inventory transaction:', error);
    res.status(500).json({ error: error.message || 'Failed to create inventory transaction' });
  }
});

// GET /api/v1/inventory/transactions
router.get('/transactions', async (req, res) => {
  try {
    const { itemId, workOrderId, type } = req.query;
    
    const where: any = {};
    if (itemId) where.itemId = itemId;
    if (workOrderId) where.workOrderId = workOrderId;
    if (type) where.type = type;

    const transactions = await prisma.inventoryTransaction.findMany({
      where,
      include: {
        item: {
          select: { id: true, name: true, sku: true }
        },
        performedBy: {
          select: { id: true, displayName: true }
        },
        workOrder: {
          select: { id: true, title: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      data: transactions,
      total: transactions.length
    });
  } catch (error) {
    console.error('Error fetching inventory transactions:', error);
    res.status(500).json({ error: 'Failed to fetch inventory transactions' });
  }
});

// DELETE /api/v1/inventory/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.inventoryItem.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
});

export default router;
