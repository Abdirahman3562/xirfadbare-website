const mongoose = require('mongoose');

const checkRealData = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/samafale-academy');
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    console.log('📊 REAL DATABASE DATA FOR DASHBOARD:\n');

    // Check users
    const users = await db.collection('users').find({}).toArray();
    console.log(`👥 Total Users: ${users.length}`);
    if (users.length > 0) {
      console.log('   Sample users:', users.slice(0, 3).map(u => `${u.firstName} ${u.lastName} (${u.role})`));
    }

    // Check courses
    const courses = await db.collection('courses').find({}).toArray();
    console.log(`📚 Total Courses: ${courses.length}`);
    if (courses.length > 0) {
      console.log('   Sample courses:', courses.slice(0, 3).map(c => c.title));
    }

    // Check orders
    const orders = await db.collection('orders').find({}).toArray();
    console.log(`🛒 Total Orders: ${orders.length}`);
    if (orders.length > 0) {
      const totalRevenue = orders.reduce((sum, order) => sum + (order.finalPrice || order.totalToPay || 0), 0);
      const activeUsers = orders.filter(order => order.status === 'active').length;
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      console.log(`   💰 Total Revenue: $${totalRevenue}`);
      console.log(`   👨‍🎓 Active Students: ${activeUsers}`);
      console.log(`   ⏳ Pending Orders: ${pendingOrders}`);
    }

    // Check testimonials
    const testimonials = await db.collection('testimonials').find({}).toArray();
    console.log(`⭐ Total Testimonials: ${testimonials.length}`);
    if (testimonials.length > 0) {
      console.log('   Sample testimonials:', testimonials.slice(0, 2).map(t => `${t.name} (${t.rating}⭐)`));
    }

    // Check contacts
    const contacts = await db.collection('contacts').find({}).toArray();
    console.log(`💬 Total Contact Messages: ${contacts.length}`);
    if (contacts.length > 0) {
      console.log('   Sample messages:', contacts.slice(0, 2).map(c => `${c.name}: ${c.about}`));
    }

    console.log('\n📈 DASHBOARD WILL DISPLAY THESE REAL VALUES!');
    console.log('No more sample/fake data - only real database data.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

checkRealData();

