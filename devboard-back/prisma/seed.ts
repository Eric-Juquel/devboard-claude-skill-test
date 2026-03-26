import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear in dependency order (tasks first, then projects)
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();

  const devboard = await prisma.project.create({
    data: {
      id: 'a0000000-0000-0000-0000-000000000001',
      name: 'DevBoard Core',
      description: 'Main tracking application',
      status: 'active',
      createdAt: new Date('2026-01-15T10:00:00Z'),
    },
  });

  const mobile = await prisma.project.create({
    data: {
      id: 'a0000000-0000-0000-0000-000000000002',
      name: 'Mobile Companion',
      description: 'React Native mobile app',
      status: 'active',
      createdAt: new Date('2026-02-01T09:00:00Z'),
    },
  });

  await prisma.task.createMany({
    data: [
      {
        id: 'b0000000-0000-0000-0000-000000000001',
        title: 'Setup CI/CD pipeline',
        description: 'Configure GitHub Actions for automated testing and deployment',
        status: 'done',
        priority: 'high',
        projectId: devboard.id,
        createdAt: new Date('2026-01-16T10:00:00Z'),
      },
      {
        id: 'b0000000-0000-0000-0000-000000000002',
        title: 'Design system tokens',
        description: 'Define and document the color palette and typography',
        status: 'in_progress',
        priority: 'medium',
        projectId: devboard.id,
        createdAt: new Date('2026-01-17T10:00:00Z'),
      },
      {
        id: 'b0000000-0000-0000-0000-000000000003',
        title: 'JWT authentication flow',
        description: 'Implement login and token refresh',
        status: 'todo',
        priority: 'high',
        projectId: mobile.id,
        createdAt: new Date('2026-02-02T09:00:00Z'),
      },
      {
        id: 'b0000000-0000-0000-0000-000000000004',
        title: 'Push notifications',
        description: 'Setup Firebase Cloud Messaging',
        status: 'todo',
        priority: 'low',
        projectId: mobile.id,
        createdAt: new Date('2026-02-03T09:00:00Z'),
      },
    ],
  });

  console.log('✅ Database seeded successfully');
  console.log(`  → ${await prisma.project.count()} projects`);
  console.log(`  → ${await prisma.task.count()} tasks`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
