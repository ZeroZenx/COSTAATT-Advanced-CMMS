# Inventory Management Module

## Overview
Complete inventory tracking system for tools, parts, and consumables with real-time stock levels, transaction history, and automated reorder alerts.

## Features

### ✅ **Inventory Tracking**
- Track all tools, parts, and consumables
- Real-time stock levels
- SKU-based organization
- Category management
- Unit cost tracking
- Total value calculations

### 📊 **Stock Management**
- Add new inventory items
- Record stock in/out transactions
- Adjust quantities
- Low stock alerts
- Reorder level management
- Transaction history

### 🔍 **Search & Filter**
- Search by name, SKU, or category
- Filter by category
- View low stock items only
- Real-time filtering

### 💰 **Cost Tracking**
- Unit cost per item
- Total inventory value
- Transaction cost history
- Budget planning

### ⚠️ **Alerts**
- Low stock warnings (visual indicators)
- Reorder level notifications
- Out of stock alerts
- Cost threshold warnings

## API Endpoints

```
GET    /api/v1/inventory                - List all items
GET    /api/v1/inventory/:id            - Get item details
POST   /api/v1/inventory                - Create new item
PATCH  /api/v1/inventory/:id            - Update item
DELETE /api/v1/inventory/:id            - Delete item
POST   /api/v1/inventory/transaction    - Record transaction
GET    /api/v1/inventory/transactions   - View transaction history
```

## Usage Guide

### Adding Inventory Items

1. Click **"Add Item"** button
2. Fill in item details:
   - **Item Name**: Descriptive name
   - **SKU**: Stock Keeping Unit code
   - **Category**: Type (e.g., Tools, Parts, Consumables)
   - **Description**: Optional details
   - **Initial Quantity**: Starting stock level
   - **Reorder Level**: Minimum stock threshold
   - **Unit Cost**: Price per unit
3. Click **"Add Item"**

### Recording Transactions

1. Find the item in the list
2. Click **"Transaction"** button
3. Select transaction type:
   - **Stock In (+)**: Receiving new stock
   - **Stock Out (-)**: Using/issuing stock
   - **Adjust Quantity**: Correct stock levels
4. Enter quantity
5. Add notes (optional)
6. Click **"Record Transaction"**

### Viewing Item Details

1. Click **"Details"** on any item
2. See complete information:
   - Current quantity
   - Total value
   - Reorder level
   - Unit cost
   - Full transaction history
3. Record new transactions from details view

## Transaction Types

### Stock In (+)
**When to use:**
- Receiving new shipments
- Returns from technicians
- Found inventory

**Effect:** Increases quantity

### Stock Out (-)
**When to use:**
- Using parts for work orders
- Issuing tools to technicians
- Consumables used

**Effect:** Decreases quantity

### Adjust Quantity
**When to use:**
- Physical inventory count
- Correcting errors
- Write-offs/damage

**Effect:** Sets exact quantity

## Low Stock Management

### Visual Indicators
- 🔴 Red background on low stock items
- ⚠️ Warning badge
- Highlighted in stats

### Reorder Process
1. System flags items below reorder level
2. Admin/Supervisor receives notification
3. Purchase order created
4. Stock In transaction when received
5. Quantity updated automatically

### Setting Reorder Levels

**Consider:**
- Average usage rate
- Lead time for ordering
- Storage capacity
- Budget constraints
- Seasonal variations

**Formula:**
```
Reorder Level = (Daily Usage × Lead Time Days) + Safety Stock
```

## Categories

### Common Categories
- **Tools**: Wrenches, drills, measuring devices
- **HVAC Parts**: Filters, belts, refrigerant
- **Electrical**: Bulbs, switches, wiring
- **Plumbing**: Pipes, fittings, fixtures
- **Consumables**: Cleaning supplies, lubricants
- **Safety**: PPE, first aid, signage
- **Office**: Printer supplies, stationery

### Best Practices
- Use consistent naming
- Create subcategories as needed
- Review and consolidate regularly
- Align with procurement

## Data Model

### Inventory Item Schema
```typescript
{
  id: string;
  name: string;
  sku: string;                // Unique identifier
  category: string;
  quantity: number;           // Current stock level
  reorderLevel: number;       // Minimum stock threshold
  unitCost: number;          // Cost per unit
  description: string;
  createdAt: DateTime;
  updatedAt: DateTime;
  transactions: Transaction[];
}
```

### Inventory Transaction Schema
```typescript
{
  id: string;
  itemId: string;
  workOrderId: string;        // Optional link to work order
  type: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  notes: string;
  performedById: string;
  createdAt: DateTime;
}
```

## Integration with Work Orders

### Automatic Linking
- Link transactions to work orders
- Track parts used per job
- Calculate work order costs
- Inventory impact visibility

### Workflow
1. Technician starts work order
2. Records parts used
3. Creates Stock Out transaction
4. Links to work order
5. Inventory updated automatically
6. Cost added to work order

## Reporting

### Inventory Reports
1. **Stock Level Report**: Current quantities
2. **Low Stock Alert**: Items needing reorder
3. **Inventory Valuation**: Total value by category
4. **Usage Report**: Most used items
5. **Transaction Log**: All stock movements
6. **Cost Analysis**: Spending by category

### Key Metrics
- **Inventory Turnover**: Usage rate
- **Carrying Cost**: Storage and maintenance
- **Stockout Rate**: Out-of-stock frequency
- **Accuracy Rate**: Physical vs system count

## Physical Inventory Count

### Process
1. Schedule regular counts (monthly/quarterly)
2. Print inventory list
3. Count physical stock
4. Use Adjust transactions to correct
5. Investigate discrepancies
6. Update reorder levels if needed

### Tips
- Count during low activity periods
- Use two-person teams for accuracy
- Organize by category/location
- Barcode scanning for speed
- Document all adjustments

## Cost Management

### Total Inventory Value
```
Total Value = Σ (Quantity × Unit Cost)
```

### Average Cost
```
Avg Cost = Total Value ÷ Total Items
```

### Cost Per Work Order
- Track parts used
- Calculate material costs
- Include labor and overhead
- Generate cost reports

## Best Practices

### Inventory Organization
1. **Labeling**: Clear, consistent labels
2. **Storage**: Organized, accessible locations
3. **Security**: Secure high-value items
4. **FIFO**: First In, First Out for consumables
5. **Regular Audits**: Monthly spot checks

### Stock Control
1. **Min/Max Levels**: Set for all items
2. **Just-in-Time**: Balance stock levels
3. **Supplier Relations**: Reliable vendors
4. **Bulk Discounts**: Strategic purchasing
5. **Obsolescence**: Review slow-moving items

### Transaction Recording
1. **Immediate Entry**: Record as used
2. **Accurate Quantities**: Count carefully
3. **Detailed Notes**: Document usage
4. **Link to WO**: Connect to work orders
5. **Regular Review**: Audit transactions

## Mobile App Features

- Scan barcodes/QR codes
- Quick stock out from field
- Photo documentation
- Offline transactions
- GPS location tracking
- Real-time sync

## Automation Features

### Auto-Reordering (Coming Soon)
- Set reorder points
- Auto-generate purchase orders
- Email to suppliers
- Track order status

### Predictive Stock Levels
- AI predicts usage patterns
- Suggests optimal stock levels
- Seasonal adjustments
- Cost optimization

## Sample Data

The system includes sample inventory items:

| Name | SKU | Category | Qty | Reorder |
|------|-----|----------|-----|---------|
| HVAC Filter 16x20 | FLT-1620 | HVAC Parts | 25 | 10 |
| LED Bulb 60W | BLB-LED60 | Electrical | 100 | 20 |
| Pipe Wrench 12" | TL-PW12 | Tools | 5 | 2 |
| Cleaning Spray | CLN-SPR | Consumables | 15 | 5 |
| Circuit Breaker 20A | CB-20A | Electrical | 30 | 10 |

## Troubleshooting

### Can't Record Transaction
- Check item exists
- Verify permissions
- Ensure quantity is valid
- Check for sufficient stock (Stock Out)

### Inventory Count Mismatch
- Use Adjust transaction
- Add notes explaining discrepancy
- Investigate root cause
- Improve tracking process

### Low Stock Not Alerting
- Verify reorder level is set
- Check quantity vs reorder level
- Ensure notifications enabled

## Security

### Access Control
- View: All authenticated users
- Create Items: Admin, Supervisor
- Transactions: Admin, Supervisor, Technician
- Delete: Admin only

### Audit Trail
- All transactions logged
- User tracking
- Timestamp recording
- Immutable history

## Integration Points

### Purchase Orders
- Generate from low stock
- Track vendor performance
- Automate reordering

### Asset Management
- Link inventory to assets
- Track parts per asset
- Warranty management

### Financial System
- Export for accounting
- Cost center allocation
- Budget tracking

---

**Version**: 1.0.0  
**Last Updated**: October 2025

