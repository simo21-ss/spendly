const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const systemRules = [
  {
    category: 'Groceries',
    icon: '🛒',
    color: '#10b981',
    rules: [
      { name: 'Walmart', value: 'walmart', field: 'description', operator: 'contains', priority: 100 },
      { name: 'Target', value: 'target', field: 'description', operator: 'contains', priority: 101 },
      { name: 'Safeway', value: 'safeway', field: 'description', operator: 'contains', priority: 102 },
      { name: 'Kroger', value: 'kroger', field: 'description', operator: 'contains', priority: 103 },
      { name: 'Whole Foods', value: 'whole foods', field: 'description', operator: 'contains', priority: 104 },
      { name: 'Trader Joe', value: 'trader joe', field: 'description', operator: 'contains', priority: 105 },
      { name: 'Costco', value: 'costco', field: 'description', operator: 'contains', priority: 106 },
      { name: 'Sprouts', value: 'sprouts', field: 'description', operator: 'contains', priority: 107 },
    ]
  },
  {
    category: 'Gas',
    icon: '⛽',
    color: '#f59e0b',
    rules: [
      { name: 'Shell', value: 'shell', field: 'merchant', operator: 'contains', priority: 110 },
      { name: 'Chevron', value: 'chevron', field: 'merchant', operator: 'contains', priority: 111 },
      { name: 'BP', value: 'bp', field: 'merchant', operator: 'contains', priority: 112 },
      { name: 'Mobil', value: 'mobil', field: 'merchant', operator: 'contains', priority: 113 },
      { name: 'Exxon', value: 'exxon', field: 'merchant', operator: 'contains', priority: 114 },
      { name: 'Texaco', value: 'texaco', field: 'merchant', operator: 'contains', priority: 115 },
      { name: 'Speedway', value: 'speedway', field: 'merchant', operator: 'contains', priority: 116 },
    ]
  },
  {
    category: 'Restaurants',
    icon: '🍽️',
    color: '#ef4444',
    rules: [
      { name: 'McDonald', value: 'mcdonalds', field: 'description', operator: 'contains', priority: 120 },
      { name: 'Subway', value: 'subway', field: 'description', operator: 'contains', priority: 121 },
      { name: 'Chipotle', value: 'chipotle', field: 'description', operator: 'contains', priority: 122 },
      { name: 'Taco Bell', value: 'taco bell', field: 'description', operator: 'contains', priority: 123 },
      { name: 'Burger King', value: 'burger king', field: 'description', operator: 'contains', priority: 124 },
      { name: 'Wendy', value: "wendy's", field: 'description', operator: 'contains', priority: 125 },
      { name: 'Chick-fil-A', value: 'chick-fil-a', field: 'description', operator: 'contains', priority: 126 },
    ]
  },
  {
    category: 'Utilities',
    icon: '💡',
    color: '#3b82f6',
    rules: [
      { name: 'Electric Company', value: 'electric', field: 'description', operator: 'contains', priority: 130 },
      { name: 'Water Company', value: 'water', field: 'description', operator: 'contains', priority: 131 },
      { name: 'Gas Company', value: 'gas utility', field: 'description', operator: 'contains', priority: 132 },
      { name: 'Internet Provider', value: 'internet', field: 'description', operator: 'contains', priority: 133 },
      { name: 'Phone Provider', value: 'phone service', field: 'description', operator: 'contains', priority: 134 },
    ]
  },
  {
    category: 'Healthcare',
    icon: '⚕️',
    color: '#dc2626',
    rules: [
      { name: 'Pharmacy', value: 'pharmacy', field: 'description', operator: 'contains', priority: 140 },
      { name: 'CVS', value: 'cvs', field: 'description', operator: 'contains', priority: 141 },
      { name: 'Walgreens', value: 'walgreens', field: 'description', operator: 'contains', priority: 142 },
      { name: 'Hospital', value: 'hospital', field: 'description', operator: 'contains', priority: 143 },
      { name: 'Doctor', value: 'medical', field: 'description', operator: 'contains', priority: 144 },
    ]
  },
  {
    category: 'Entertainment',
    icon: '🎬',
    color: '#8b5cf6',
    rules: [
      { name: 'Movie Theater', value: 'regal cinemas', field: 'description', operator: 'contains', priority: 150 },
      { name: 'Cinema', value: 'cinema', field: 'description', operator: 'contains', priority: 151 },
      { name: 'AMC', value: 'amc', field: 'description', operator: 'contains', priority: 152 },
    ]
  },
  {
    category: 'Shopping',
    icon: '🛍️',
    color: '#ec4899',
    rules: [
      { name: 'Amazon', value: 'amazon', field: 'description', operator: 'contains', priority: 160 },
      { name: 'eBay', value: 'ebay', field: 'description', operator: 'contains', priority: 161 },
      { name: 'Gap', value: 'gap', field: 'description', operator: 'contains', priority: 162 },
      { name: 'H&M', value: 'h&m', field: 'description', operator: 'contains', priority: 163 },
      { name: 'Nordstrom', value: 'nordstrom', field: 'description', operator: 'contains', priority: 164 },
      { name: 'Macy', value: "macy's", field: 'description', operator: 'contains', priority: 165 },
    ]
  },
  {
    category: 'Transportation',
    icon: '🚗',
    color: '#06b6d4',
    rules: [
      { name: 'Uber', value: 'uber', field: 'description', operator: 'contains', priority: 170 },
      { name: 'Lyft', value: 'lyft', field: 'description', operator: 'contains', priority: 171 },
      { name: 'Taxi', value: 'taxi', field: 'description', operator: 'contains', priority: 172 },
      { name: 'Public Transit', value: 'transit', field: 'description', operator: 'contains', priority: 173 },
      { name: 'Parking', value: 'parking', field: 'description', operator: 'contains', priority: 174 },
    ]
  },
  {
    category: 'Subscriptions',
    icon: '📱',
    color: '#06b6d4',
    rules: [
      { name: 'Netflix', value: 'netflix', field: 'description', operator: 'contains', priority: 180 },
      { name: 'Spotify', value: 'spotify', field: 'description', operator: 'contains', priority: 181 },
      { name: 'Disney+', value: 'disney', field: 'description', operator: 'contains', priority: 182 },
      { name: 'Apple Music', value: 'apple music', field: 'description', operator: 'contains', priority: 183 },
      { name: 'Adobe', value: 'adobe', field: 'description', operator: 'contains', priority: 184 },
      { name: 'Microsoft', value: 'microsoft 365', field: 'description', operator: 'contains', priority: 185 },
    ]
  },
  {
    category: 'Coffee Shops',
    icon: '☕',
    color: '#92400e',
    rules: [
      { name: 'Starbucks', value: 'starbucks', field: 'description', operator: 'contains', priority: 190 },
      { name: 'Dunkin', value: "dunkin'", field: 'description', operator: 'contains', priority: 191 },
      { name: 'Local Coffee', value: 'coffee', field: 'description', operator: 'contains', priority: 192 },
    ]
  },
  {
    category: 'Fast Food',
    icon: '🍔',
    color: '#dc2626',
    rules: [
      { name: 'Pizza Hut', value: 'pizza hut', field: 'description', operator: 'contains', priority: 200 },
      { name: 'Domino', value: "domino's", field: 'description', operator: 'contains', priority: 201 },
      { name: 'KFC', value: 'kfc', field: 'description', operator: 'contains', priority: 202 },
      { name: 'Popeyes', value: 'popeyes', field: 'description', operator: 'contains', priority: 203 },
    ]
  },
  {
    category: 'Online Shopping',
    icon: '📦',
    color: '#dc2626',
    rules: [
      { name: 'Shopify', value: 'shopify', field: 'description', operator: 'contains', priority: 210 },
      { name: 'Etsy', value: 'etsy', field: 'description', operator: 'contains', priority: 211 },
      { name: 'DoorDash', value: 'doordash', field: 'description', operator: 'contains', priority: 212 },
    ]
  },
  {
    category: 'Home Improvement',
    icon: '🏠',
    color: '#f59e0b',
    rules: [
      { name: 'Home Depot', value: 'home depot', field: 'description', operator: 'contains', priority: 220 },
      { name: 'Lowe', value: "lowe's", field: 'description', operator: 'contains', priority: 221 },
      { name: 'Menards', value: 'menards', field: 'description', operator: 'contains', priority: 222 },
    ]
  },
  {
    category: 'Insurance',
    icon: '🛡️',
    color: '#0891b2',
    rules: [
      { name: 'Insurance Company', value: 'insurance', field: 'description', operator: 'contains', priority: 230 },
      { name: 'Geico', value: 'geico', field: 'description', operator: 'contains', priority: 231 },
      { name: 'State Farm', value: 'state farm', field: 'description', operator: 'contains', priority: 232 },
    ]
  },
  {
    category: 'Fitness',
    icon: '💪',
    color: '#059669',
    rules: [
      { name: 'Gym', value: 'gym', field: 'description', operator: 'contains', priority: 240 },
      { name: 'Planet Fitness', value: 'planet fitness', field: 'description', operator: 'contains', priority: 241 },
      { name: 'Yoga Studio', value: 'yoga', field: 'description', operator: 'contains', priority: 242 },
      { name: 'Sports', value: 'fitness', field: 'description', operator: 'contains', priority: 243 },
    ]
  },
  {
    category: 'Education',
    icon: '📚',
    color: '#3b82f6',
    rules: [
      { name: 'University', value: 'university', field: 'description', operator: 'contains', priority: 250 },
      { name: 'College', value: 'college', field: 'description', operator: 'contains', priority: 251 },
      { name: 'Tuition', value: 'tuition', field: 'description', operator: 'contains', priority: 252 },
      { name: 'School', value: 'school', field: 'description', operator: 'contains', priority: 253 },
    ]
  },
  {
    category: 'Travel',
    icon: '✈️',
    color: '#06b6d4',
    rules: [
      { name: 'Airline', value: 'airline', field: 'description', operator: 'contains', priority: 260 },
      { name: 'Hotel', value: 'hotel', field: 'description', operator: 'contains', priority: 261 },
      { name: 'Airbnb', value: 'airbnb', field: 'description', operator: 'contains', priority: 262 },
      { name: 'Travel', value: 'travel', field: 'description', operator: 'contains', priority: 263 },
      { name: 'booking.com', value: 'booking', field: 'description', operator: 'contains', priority: 264 },
    ]
  },
  {
    category: 'Dining',
    icon: '🍷',
    color: '#8b5cf6',
    rules: [
      { name: 'Restaurant', value: 'restaurant', field: 'description', operator: 'contains', priority: 270 },
      { name: 'Bar', value: 'bar', field: 'description', operator: 'contains', priority: 271 },
      { name: 'Cafe', value: 'cafe', field: 'description', operator: 'contains', priority: 272 },
    ]
  },
  {
    category: 'Automotive',
    icon: '🔧',
    color: '#64748b',
    rules: [
      { name: 'Car Maintenance', value: 'automotive', field: 'description', operator: 'contains', priority: 280 },
      { name: 'Repair Shop', value: 'repair', field: 'description', operator: 'contains', priority: 281 },
      { name: 'Oil Change', value: 'oil change', field: 'description', operator: 'contains', priority: 282 },
    ]
  },
  {
    category: 'Personal Care',
    icon: '💅',
    color: '#ec4899',
    rules: [
      { name: 'Salon', value: 'salon', field: 'description', operator: 'contains', priority: 290 },
      { name: 'Hair Cut', value: 'barber', field: 'description', operator: 'contains', priority: 291 },
      { name: 'Spa', value: 'spa', field: 'description', operator: 'contains', priority: 292 },
      { name: 'Beauty', value: 'beauty', field: 'description', operator: 'contains', priority: 293 },
    ]
  },
  {
    category: 'Pets',
    icon: '🐾',
    color: '#f59e0b',
    rules: [
      { name: 'Pet Store', value: 'pet store', field: 'description', operator: 'contains', priority: 300 },
      { name: 'Veterinary', value: 'vet', field: 'description', operator: 'contains', priority: 301 },
      { name: 'Animal Hospital', value: 'animal hospital', field: 'description', operator: 'contains', priority: 302 },
    ]
  },
  {
    category: 'Bills',
    icon: '📋',
    color: '#6b7280',
    rules: [
      { name: 'Payment', value: 'payment', field: 'description', operator: 'contains', priority: 310 },
      { name: 'Bills', value: 'bill', field: 'description', operator: 'contains', priority: 311 },
    ]
  },
  {
    category: 'Income',
    icon: '💰',
    color: '#059669',
    rules: [
      { name: 'Salary', value: 'salary', field: 'description', operator: 'contains', priority: 320 },
      { name: 'Deposit', value: 'deposit', field: 'description', operator: 'contains', priority: 321 },
      { name: 'Paycheck', value: 'paycheck', field: 'description', operator: 'contains', priority: 322 },
    ]
  },
];

async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // Clear existing data
    await prisma.rule.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.category.deleteMany({});

    console.log('🗑️ Cleared existing data');

    // Create categories and rules
    for (const systemRule of systemRules) {
      const category = await prisma.category.create({
        data: {
          name: systemRule.category,
          icon: systemRule.icon,
          color: systemRule.color,
          isSystem: true,
        },
      });

      console.log(`✅ Created category: ${systemRule.category}`);

      // Create rules for this category
      for (const rule of systemRule.rules) {
        await prisma.rule.create({
          data: {
            name: rule.name,
            field: rule.field,
            operator: rule.operator,
            value: rule.value,
            priority: rule.priority,
            isSystemRule: true,
            isActive: true,
            categoryId: category.id,
          },
        });
      }

      console.log(`  → Added ${systemRule.rules.length} rules`);
    }

    console.log('✨ Database seed completed successfully!');
    console.log(`📊 Created ${systemRules.length} categories with ${systemRules.reduce((sum, s) => sum + s.rules.length, 0)} total rules`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
