import { PrismaClient, Role } from '@prisma/client';
import { hashPassword } from '../src/utils/hash';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test users
  const users = [
    {
      email: 'admin@costaatt.edu.tt',
      password: 'Admin@123',
      displayName: 'System Administrator',
      role: Role.ADMIN,
      department: 'IT Services',
      phone: '+1-868-555-0100',
    },
    {
      email: 'sup1@costaatt.edu.tt',
      password: 'Pass@123',
      displayName: 'Maintenance Supervisor',
      role: Role.SUPERVISOR,
      department: 'Facilities Management',
      phone: '+1-868-555-0101',
    },
    {
      email: 'tech1@costaatt.edu.tt',
      password: 'Pass@123',
      displayName: 'John Technician',
      role: Role.TECHNICIAN,
      department: 'Facilities Management',
      phone: '+1-868-555-0102',
    },
    {
      email: 'tech2@costaatt.edu.tt',
      password: 'Pass@123',
      displayName: 'Sarah Technician',
      role: Role.TECHNICIAN,
      department: 'Facilities Management',
      phone: '+1-868-555-0103',
    },
    {
      email: 'staff1@costaatt.edu.tt',
      password: 'Pass@123',
      displayName: 'Faculty Member',
      role: Role.REQUESTOR,
      department: 'Academic Affairs',
      phone: '+1-868-555-0104',
    },
    {
      email: 'staff2@costaatt.edu.tt',
      password: 'Pass@123',
      displayName: 'Office Staff',
      role: Role.REQUESTOR,
      department: 'Administration',
      phone: '+1-868-555-0105',
    },
  ];

  // Hash passwords and create users
  for (const userData of users) {
    const passwordHash = await hashPassword(userData.password);
    
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        passwordHash,
        displayName: userData.displayName,
        role: userData.role,
        department: userData.department,
        phone: userData.phone,
        isActive: true,
      },
    });
  }

  // Create sample categories
  const categories = [
    { name: 'Electrical', description: 'Electrical maintenance and repairs' },
    { name: 'Plumbing', description: 'Plumbing maintenance and repairs' },
    { name: 'HVAC', description: 'Heating, ventilation, and air conditioning' },
    { name: 'General Maintenance', description: 'General building maintenance' },
    { name: 'Cleaning', description: 'Cleaning and janitorial services' },
    { name: 'Security', description: 'Security system maintenance' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  // Create sample locations
  const locations = [
    { name: 'Main Building - Ground Floor', building: 'Main Building', floor: 'Ground', room: 'Various' },
    { name: 'Main Building - First Floor', building: 'Main Building', floor: 'First', room: 'Various' },
    { name: 'Main Building - Second Floor', building: 'Main Building', floor: 'Second', room: 'Various' },
    { name: 'Library Building', building: 'Library', floor: 'Ground', room: 'Various' },
    { name: 'Science Building', building: 'Science', floor: 'Ground', room: 'Various' },
    { name: 'Administration Building', building: 'Administration', floor: 'Ground', room: 'Various' },
  ];

  for (const location of locations) {
    await prisma.location.upsert({
      where: { name: location.name },
      update: {},
      create: location,
    });
  }

  // Create sample inventory items
  const inventoryItems = [
    { name: 'Light Bulb - LED 60W', sku: 'LED-60W-001', category: 'Electrical', quantity: 50, reorderLevel: 10, unitCost: 5.99 },
    { name: 'Pipe Wrench 12"', sku: 'WRENCH-12-001', category: 'Plumbing', quantity: 5, reorderLevel: 2, unitCost: 25.99 },
    { name: 'Air Filter 20x25x1', sku: 'FILTER-20x25-001', category: 'HVAC', quantity: 20, reorderLevel: 5, unitCost: 12.99 },
    { name: 'Cleaning Spray', sku: 'CLEAN-001', category: 'Cleaning', quantity: 15, reorderLevel: 5, unitCost: 8.99 },
    { name: 'Electrical Tape', sku: 'TAPE-ELEC-001', category: 'Electrical', quantity: 25, reorderLevel: 5, unitCost: 3.99 },
  ];

  for (const item of inventoryItems) {
    await prisma.inventoryItem.upsert({
      where: { sku: item.sku },
      update: {},
      create: item,
    });
  }

  // Get users for creating work orders
  const admin = await prisma.user.findUnique({ where: { email: 'admin@costaatt.edu.tt' } });
  const supervisor = await prisma.user.findUnique({ where: { email: 'sup1@costaatt.edu.tt' } });
  const technician = await prisma.user.findUnique({ where: { email: 'tech1@costaatt.edu.tt' } });
  const staff = await prisma.user.findUnique({ where: { email: 'staff1@costaatt.edu.tt' } });

  if (admin && supervisor && technician && staff) {
    // Create sample work orders
    const workOrders = [
      {
        title: 'Broken Light in Room 101',
        description: 'The overhead light in room 101 is not working. Please replace the bulb.',
        status: 'OPEN' as const,
        priority: 'MEDIUM' as const,
        location: 'Main Building - First Floor',
        category: 'Electrical',
        createdById: staff.id,
        assignedToId: technician.id,
      },
      {
        title: 'Leaky Faucet in Staff Restroom',
        description: 'The faucet in the staff restroom on the ground floor is dripping continuously.',
        status: 'IN_PROGRESS' as const,
        priority: 'LOW' as const,
        location: 'Main Building - Ground Floor',
        category: 'Plumbing',
        createdById: staff.id,
        assignedToId: technician.id,
      },
      {
        title: 'AC Unit Not Cooling',
        description: 'The air conditioning unit in the library is not providing adequate cooling.',
        status: 'OPEN' as const,
        priority: 'HIGH' as const,
        location: 'Library Building',
        category: 'HVAC',
        createdById: admin.id,
        assignedToId: null,
      },
    ];

    for (const workOrder of workOrders) {
      await prisma.workOrder.create({
        data: workOrder,
      });
    }
  }

  console.log('✅ Database seeded successfully!');
  console.log('\n🔑 Test User Credentials:');
  console.log('Admin: admin@costaatt.edu.tt / Admin@123');
  console.log('Supervisor: sup1@costaatt.edu.tt / Pass@123');
  console.log('Technician: tech1@costaatt.edu.tt / Pass@123');
  console.log('Staff: staff1@costaatt.edu.tt / Pass@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
