/// <reference types="node" />

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Add any initial data you want to seed here
  // For example, you could create a test user:
  /*
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      id: 'user_test123', // This is now the primary ID (from Clerk or other auth provider)
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
    },
  });
  console.log('Created test user:', testUser);
  */

  // Seed categories
  const categories = [
    {
      id: 1,
      emoji: '🍕',
      name: 'pizza',
      keywords: ['italian', 'pepperoni', 'cheese', 'pasta', 'calzone'],
    },
    {
      id: 2,
      emoji: '🍺',
      name: 'beer',
      keywords: ['brewery', 'pub', 'ale', 'lager', 'bar'],
    },
    {
      id: 3,
      emoji: '🍣',
      name: 'sushi',
      keywords: ['japanese', 'sashimi', 'roll', 'tempura', 'miso'],
    },
    {
      id: 4,
      emoji: '☕️',
      name: 'coffee',
      keywords: ['cafe', 'espresso', 'latte', 'pastry', 'mocha'],
    },
    {
      id: 5,
      emoji: '🍔',
      name: 'burger',
      keywords: ['fries', 'diner', 'cheeseburger', 'shake', 'grill'],
    },
    {
      id: 6,
      emoji: '🌮',
      name: 'mexican',
      keywords: ['taco', 'burrito', 'salsa', 'guacamole', 'enchilada'],
    },
    {
      id: 7,
      emoji: '🍜',
      name: 'ramen',
      keywords: ['noodle', 'broth', 'japanese', 'miso', 'tonkotsu'],
    },
    {
      id: 8,
      emoji: '🥗',
      name: 'salad',
      keywords: ['healthy', 'greens', 'dressing', 'veggie', 'bowl'],
    },
    {
      id: 9,
      emoji: '🍦',
      name: 'dessert',
      keywords: ['cake', 'ice cream', 'pastry', 'sweet', 'cookie'],
    },
    {
      id: 10,
      emoji: '🍷',
      name: 'wine',
      keywords: ['vineyard', 'bar', 'red', 'white', 'tasting'],
    },
    {
      id: 11,
      emoji: '🍲',
      name: 'asian_fusion',
      keywords: ['thai', 'vietnamese', 'korean', 'chinese', 'noodle'],
    },
    {
      id: 12,
      emoji: '🥪',
      name: 'sandwich',
      keywords: ['deli', 'sub', 'bread', 'panini', 'bodega'],
    },
    {
      id: 13,
      emoji: '🍝',
      name: 'italian',
      keywords: ['pasta', 'pizza', 'risotto', 'lasagna', 'gelato'],
    },
    {
      id: 14,
      emoji: '🥩',
      name: 'steak',
      keywords: ['grill', 'beef', 'ribeye', 'sirloin', 'barbecue'],
    },
    {
      id: 15,
      emoji: '🍗',
      name: 'chicken',
      keywords: ['fried', 'grilled', 'wings', 'nuggets', 'roast'],
    },
    {
      id: 16,
      emoji: '🍤',
      name: 'seafood',
      keywords: ['shrimp', 'fish', 'crab', 'lobster', 'oyster'],
    },
    {
      id: 17,
      emoji: '🍛',
      name: 'indian',
      keywords: ['curry', 'naan', 'tandoori', 'biryani', 'samosa'],
    },
    {
      id: 18,
      emoji: '🥘',
      name: 'spanish',
      keywords: ['paella', 'tapas', 'chorizo', 'sangria', 'churros'],
    },
    {
      id: 19,
      emoji: '🍱',
      name: 'japanese',
      keywords: ['sushi', 'ramen', 'tempura', 'teriyaki', 'sake'],
    },
    {
      id: 20,
      emoji: '🥟',
      name: 'chinese',
      keywords: [
        'dumpling',
        'noodle',
        'fried rice',
        'dim sum',
        'sweet and sour',
      ],
    },
    {
      id: 21,
      emoji: '🧆',
      name: 'middle_eastern',
      keywords: ['falafel', 'hummus', 'kebab', 'shawarma', 'baklava'],
    },
    {
      id: 22,
      emoji: '🥐',
      name: 'bakery',
      keywords: ['bread', 'pastry', 'croissant', 'cake', 'muffin'],
    },
    {
      id: 23,
      emoji: '🍨',
      name: 'ice_cream',
      keywords: ['gelato', 'sundae', 'frozen yogurt', 'sorbet', 'cone'],
    },
    {
      id: 24,
      emoji: '🍹',
      name: 'cocktail',
      keywords: ['bar', 'mixology', 'mojito', 'martini', 'margarita'],
    },
    {
      id: 25,
      emoji: '🍽️',
      name: 'place',
      keywords: ['restaurant', 'eatery', 'diner', 'cafe', 'bistro'],
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: category,
      create: category,
    });
  }
  console.log('Categories seeded successfully');

  console.log('Database seeding completed.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
