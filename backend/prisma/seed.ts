import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 12;

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPasswordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'changeme123', BCRYPT_ROUNDS);
  const admin = await prisma.admin.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@Farmer-Dairy.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@Farmer-Dairy.com',
      passwordHash: adminPasswordHash,
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // Create categories
  const categories = [
    { name: 'Vegetables', slug: 'vegetables', description: 'Fresh vegetables' },
    { name: 'Fruits', slug: 'fruits', description: 'Fresh fruits' },
    { name: 'Dairy', slug: 'dairy', description: 'Dairy products' },
    { name: 'Grains', slug: 'grains', description: 'Grains and cereals' },
  ];

  const createdCategories = [];
  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCategories.push(category);
    console.log(`✅ Category created: ${category.name}`);
  }

  // Create sample products
  const products = [
    {
      categoryId: createdCategories[0].id,
      name: 'Organic Tomatoes',
      slug: 'organic-tomatoes',
      description: 'Fresh organic tomatoes from local farms',
      price: 2.99,
      stock: 100,
      images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea'],
    },
    {
      categoryId: createdCategories[0].id,
      name: 'Fresh Carrots',
      slug: 'fresh-carrots',
      description: 'Sweet and crunchy carrots',
      price: 1.99,
      stock: 150,
      images: ['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37'],
    },
    {
      categoryId: createdCategories[1].id,
      name: 'Red Apples',
      slug: 'red-apples',
      description: 'Crisp and sweet red apples',
      price: 3.49,
      stock: 80,
      images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6'],
    },
    {
      categoryId: createdCategories[1].id,
      name: 'Bananas',
      slug: 'bananas',
      description: 'Fresh yellow bananas',
      price: 1.29,
      stock: 200,
      images: ['https://images.unsplash.com/photo-1603833665858-e61d17a86224'],
    },
    {
      categoryId: createdCategories[2].id,
      name: 'Whole Milk',
      slug: 'whole-milk',
      description: 'Fresh whole milk, 1 gallon',
      price: 4.99,
      stock: 50,
      images: ['https://images.unsplash.com/photo-1563636619-e9143da7973b'],
    },
    {
      categoryId: createdCategories[3].id,
      name: 'Brown Rice',
      slug: 'brown-rice',
      description: 'Organic brown rice, 5 lbs',
      price: 6.99,
      stock: 40,
      images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c'],
    },
  ];

  for (const prod of products) {
    const product = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: prod,
    });
    console.log(`✅ Product created: ${product.name}`);
  }

  console.log('✨ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
