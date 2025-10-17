import crypto from 'crypto';
import { prisma } from '../utils/prisma';

interface AuditEntry {
  entityType: string;
  entityId: string;
  action: string;
  changes: any;
  userId?: string;
  timestamp?: Date;
}

interface Block {
  index: number;
  timestamp: number;
  data: AuditEntry[];
  previousHash: string;
  hash: string;
  nonce: number;
}

export class BlockchainService {
  private chain: Block[] = [];
  private difficulty = 4; // Number of leading zeros required
  private isInitialized = false;

  constructor() {
    this.initializeBlockchain();
  }

  // Initialize the blockchain with genesis block
  private async initializeBlockchain() {
    try {
      // Load existing chain from database
      const existingBlocks = await prisma.auditTrail.findMany({
        orderBy: { createdAt: 'asc' },
      });

      if (existingBlocks.length > 0) {
        // Reconstruct chain from database
        this.chain = await this.reconstructChainFromDatabase(existingBlocks);
      } else {
        // Create genesis block
        this.createGenesisBlock();
      }

      this.isInitialized = true;
      console.log(`🔗 Blockchain initialized with ${this.chain.length} blocks`);
    } catch (error) {
      console.error('Error initializing blockchain:', error);
    }
  }

  // Create genesis block
  private createGenesisBlock() {
    const genesisBlock: Block = {
      index: 0,
      timestamp: Date.now(),
      data: [{
        entityType: 'system',
        entityId: 'genesis',
        action: 'blockchain_initialized',
        changes: { message: 'COSTAATT CMMS Blockchain initialized' },
        timestamp: new Date(),
      }],
      previousHash: '0',
      hash: '',
      nonce: 0,
    };

    genesisBlock.hash = this.calculateHash(genesisBlock);
    this.chain.push(genesisBlock);
  }

  // Reconstruct chain from database
  private async reconstructChainFromDatabase(auditTrails: any[]): Promise<Block[]> {
    const blocks: Block[] = [];
    const blockSize = 10; // Number of audit entries per block
    
    for (let i = 0; i < auditTrails.length; i += blockSize) {
      const blockData = auditTrails.slice(i, i + blockSize);
      
      const block: Block = {
        index: Math.floor(i / blockSize),
        timestamp: blockData[0].createdAt.getTime(),
        data: blockData.map(trail => ({
          entityType: trail.entityType,
          entityId: trail.entityId,
          action: trail.action,
          changes: trail.changes,
          timestamp: trail.createdAt,
        })),
        previousHash: blocks.length > 0 ? blocks[blocks.length - 1].hash : '0',
        hash: '',
        nonce: 0,
      };

      block.hash = this.calculateHash(block);
      blocks.push(block);
    }

    return blocks;
  }

  // Add new audit entry to blockchain
  async addAuditEntry(entry: AuditEntry) {
    if (!this.isInitialized) {
      await this.initializeBlockchain();
    }

    try {
      // Add to current block
      const currentBlock = this.getCurrentBlock();
      currentBlock.data.push({
        ...entry,
        timestamp: entry.timestamp || new Date(),
      });

      // If block is full, mine it and create new block
      if (currentBlock.data.length >= 10) {
        await this.mineBlock(currentBlock);
        this.createNewBlock();
      }

      // Store in database
      await this.storeAuditTrail(entry);

      console.log(`📝 Audit entry added: ${entry.action} on ${entry.entityType}:${entry.entityId}`);
    } catch (error) {
      console.error('Error adding audit entry:', error);
    }
  }

  // Get current block (create if doesn't exist)
  private getCurrentBlock(): Block {
    if (this.chain.length === 0) {
      this.createGenesisBlock();
    }

    let currentBlock = this.chain[this.chain.length - 1];
    
    if (currentBlock.data.length >= 10) {
      this.createNewBlock();
      currentBlock = this.chain[this.chain.length - 1];
    }

    return currentBlock;
  }

  // Create new block
  private createNewBlock() {
    const previousBlock = this.chain[this.chain.length - 1];
    const newBlock: Block = {
      index: this.chain.length,
      timestamp: Date.now(),
      data: [],
      previousHash: previousBlock.hash,
      hash: '',
      nonce: 0,
    };

    this.chain.push(newBlock);
  }

  // Mine block (proof of work)
  private async mineBlock(block: Block) {
    console.log(`⛏️ Mining block ${block.index}...`);
    
    const startTime = Date.now();
    
    while (!this.isValidHash(block.hash)) {
      block.nonce++;
      block.hash = this.calculateHash(block);
    }

    const miningTime = Date.now() - startTime;
    console.log(`✅ Block ${block.index} mined in ${miningTime}ms (nonce: ${block.nonce})`);

    // Store block data in database
    await this.storeBlockData(block);
  }

  // Calculate hash for block
  private calculateHash(block: Block): string {
    const dataString = JSON.stringify({
      index: block.index,
      timestamp: block.timestamp,
      data: block.data,
      previousHash: block.previousHash,
      nonce: block.nonce,
    });

    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  // Check if hash is valid (proof of work)
  private isValidHash(hash: string): boolean {
    return hash.startsWith('0'.repeat(this.difficulty));
  }

  // Store audit trail in database
  private async storeAuditTrail(entry: AuditEntry) {
    const hash = this.calculateEntryHash(entry);
    
    await prisma.auditTrail.create({
      data: {
        entityType: entry.entityType,
        entityId: entry.entityId,
        action: entry.action,
        changes: entry.changes,
        hash,
        blockNumber: this.chain.length.toString(),
      },
    });
  }

  // Store block data in database
  private async storeBlockData(block: Block) {
    // Store each audit entry in the block
    for (const entry of block.data) {
      await prisma.auditTrail.create({
        data: {
          entityType: entry.entityType,
          entityId: entry.entityId,
          action: entry.action,
          changes: entry.changes,
          hash: this.calculateEntryHash(entry),
          blockNumber: block.index.toString(),
        },
      });
    }
  }

  // Calculate hash for individual entry
  private calculateEntryHash(entry: AuditEntry): string {
    const dataString = JSON.stringify({
      entityType: entry.entityType,
      entityId: entry.entityId,
      action: entry.action,
      changes: entry.changes,
      timestamp: entry.timestamp?.getTime() || Date.now(),
    });

    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  // Verify blockchain integrity
  async verifyChain(): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Check if current block's previous hash matches previous block's hash
      if (currentBlock.previousHash !== previousBlock.hash) {
        errors.push(`Block ${i}: Previous hash mismatch`);
      }

      // Check if current block's hash is valid
      if (!this.isValidHash(currentBlock.hash)) {
        errors.push(`Block ${i}: Invalid hash`);
      }

      // Verify hash calculation
      const calculatedHash = this.calculateHash(currentBlock);
      if (currentBlock.hash !== calculatedHash) {
        errors.push(`Block ${i}: Hash calculation mismatch`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Get audit trail for specific entity
  async getAuditTrail(entityType: string, entityId: string) {
    return prisma.auditTrail.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get blockchain statistics
  async getBlockchainStats() {
    const totalBlocks = this.chain.length;
    const totalEntries = this.chain.reduce((sum, block) => sum + block.data.length, 0);
    const lastBlock = this.chain[this.chain.length - 1];
    
    const verification = await this.verifyChain();

    return {
      totalBlocks,
      totalEntries,
      lastBlockHash: lastBlock?.hash,
      lastBlockTimestamp: lastBlock?.timestamp,
      isChainValid: verification.isValid,
      errors: verification.errors,
    };
  }

  // Get recent audit entries
  async getRecentAuditEntries(limit = 100) {
    return prisma.auditTrail.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // Search audit trail
  async searchAuditTrail(query: {
    entityType?: string;
    action?: string;
    userId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const where: any = {};

    if (query.entityType) where.entityType = query.entityType;
    if (query.action) where.action = query.action;
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = query.dateFrom;
      if (query.dateTo) where.createdAt.lte = query.dateTo;
    }

    return prisma.auditTrail.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  // Generate compliance report
  async generateComplianceReport(period: {
    startDate: Date;
    endDate: Date;
  }) {
    const auditEntries = await prisma.auditTrail.findMany({
      where: {
        createdAt: {
          gte: period.startDate,
          lte: period.endDate,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by entity type and action
    const report: any = {
      period,
      summary: {
        totalEntries: auditEntries.length,
        entityTypes: {},
        actions: {},
        users: {},
      },
      entries: auditEntries,
    };

    for (const entry of auditEntries) {
      // Count by entity type
      if (!report.summary.entityTypes[entry.entityType]) {
        report.summary.entityTypes[entry.entityType] = 0;
      }
      report.summary.entityTypes[entry.entityType]++;

      // Count by action
      if (!report.summary.actions[entry.action]) {
        report.summary.actions[entry.action] = 0;
      }
      report.summary.actions[entry.action]++;

      // Count by user (if available)
      const userId = entry.changes?.userId || 'system';
      if (!report.summary.users[userId]) {
        report.summary.users[userId] = 0;
      }
      report.summary.users[userId]++;
    }

    return report;
  }

  // Export blockchain data
  async exportBlockchainData() {
    const blocks = this.chain.map(block => ({
      index: block.index,
      timestamp: block.timestamp,
      hash: block.hash,
      previousHash: block.previousHash,
      nonce: block.nonce,
      dataCount: block.data.length,
      data: block.data,
    }));

    return {
      chain: blocks,
      stats: await this.getBlockchainStats(),
      exportedAt: new Date().toISOString(),
    };
  }

  // Import blockchain data (for backup restoration)
  async importBlockchainData(data: any) {
    try {
      // Clear existing data
      await prisma.auditTrail.deleteMany({});
      
      // Reconstruct chain
      this.chain = data.chain;
      
      // Store in database
      for (const block of data.chain) {
        for (const entry of block.data) {
          await prisma.auditTrail.create({
            data: {
              entityType: entry.entityType,
              entityId: entry.entityId,
              action: entry.action,
              changes: entry.changes,
              hash: this.calculateEntryHash(entry),
              blockNumber: block.index.toString(),
            },
          });
        }
      }

      console.log('✅ Blockchain data imported successfully');
      return { success: true };
    } catch (error) {
      console.error('Error importing blockchain data:', error);
      return { success: false, error: error.message };
    }
  }
}

export const blockchainService = new BlockchainService();
