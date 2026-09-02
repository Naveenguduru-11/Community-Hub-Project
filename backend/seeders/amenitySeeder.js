const Amenity = require('../models/Amenity');

const DEFAULT_AMENITIES = [
  {
    name: 'Clubhouse', emoji: '🏢',
    description: 'Spacious multi-purpose hall ideal for parties, meetings and community events.',
    category: 'Hall', capacity: 150, operatingHours: '9:00 AM - 11:00 PM', status: 'active',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
    slots: [
      { label: '10:00 AM - 12:00 PM', price: 500,  guestCharge: 50 },
      { label: '12:00 PM - 2:00 PM',  price: 500,  guestCharge: 50 },
      { label: '2:00 PM - 5:00 PM',   price: 800,  guestCharge: 50 },
      { label: '6:00 PM - 10:00 PM',  price: 1500, guestCharge: 100 },
    ], maintenance: [],
  },
  {
    name: 'Gymnasium', emoji: '🏋️',
    description: 'Fully equipped gym with cardio machines, free weights, and dedicated yoga space.',
    category: 'Fitness', capacity: 30, operatingHours: '6:00 AM - 10:00 PM', status: 'active',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
    slots: [
      { label: '6:00 AM - 8:00 AM',  price: 0, guestCharge: 0 },
      { label: '8:00 AM - 10:00 AM', price: 0, guestCharge: 0 },
      { label: '5:00 PM - 7:00 PM',  price: 0, guestCharge: 0 },
      { label: '7:00 PM - 9:00 PM',  price: 0, guestCharge: 0 },
    ], maintenance: [],
  },
  {
    name: 'Swimming Pool', emoji: '🏊',
    description: 'Olympic-size pool with dedicated lanes, kids area, and lifeguard on duty.',
    category: 'Sports', capacity: 40, operatingHours: '6:00 AM - 9:00 PM', status: 'active',
    image: 'https://images.unsplash.com/photo-1569361116630-9c98a5a14e23?w=600&q=80',
    slots: [
      { label: '6:00 AM - 8:00 AM',  price: 100, guestCharge: 50 },
      { label: '8:00 AM - 10:00 AM', price: 100, guestCharge: 50 },
      { label: '4:00 PM - 6:00 PM',  price: 100, guestCharge: 50 },
      { label: '6:00 PM - 8:00 PM',  price: 150, guestCharge: 50 },
    ], maintenance: [],
  },
  {
    name: 'Badminton Court', emoji: '🏸',
    description: '2 indoor badminton courts with professional flooring and lighting.',
    category: 'Sports', capacity: 8, operatingHours: '6:00 AM - 10:00 PM', status: 'active',
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&q=80',
    slots: [
      { label: '6:00 AM - 7:00 AM',  price: 150, guestCharge: 0 },
      { label: '7:00 AM - 8:00 AM',  price: 150, guestCharge: 0 },
      { label: '5:00 PM - 6:00 PM',  price: 200, guestCharge: 0 },
      { label: '6:00 PM - 7:00 PM',  price: 200, guestCharge: 0 },
      { label: '7:00 PM - 8:00 PM',  price: 200, guestCharge: 0 },
    ], maintenance: [],
  },
  {
    name: 'Party Hall', emoji: '🎉',
    description: 'Elegant event space for birthday parties, anniversaries and celebrations.',
    category: 'Hall', capacity: 80, operatingHours: '10:00 AM - 11:00 PM', status: 'active',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80',
    slots: [
      { label: '10:00 AM - 2:00 PM', price: 2000, guestCharge: 100 },
      { label: '3:00 PM - 7:00 PM',  price: 2000, guestCharge: 100 },
      { label: '7:00 PM - 11:00 PM', price: 3000, guestCharge: 150 },
    ], maintenance: [],
  },
  {
    name: 'Tennis Court', emoji: '🎾',
    description: 'Full-size tennis court with floodlights for evening play.',
    category: 'Sports', capacity: 4, operatingHours: '6:00 AM - 10:00 PM', status: 'active',
    image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600&q=80',
    slots: [
      { label: '6:00 AM - 7:30 AM',  price: 250, guestCharge: 0 },
      { label: '7:30 AM - 9:00 AM',  price: 250, guestCharge: 0 },
      { label: '5:00 PM - 6:30 PM',  price: 300, guestCharge: 0 },
      { label: '6:30 PM - 8:00 PM',  price: 300, guestCharge: 0 },
    ], maintenance: [],
  },
  {
    name: 'Guest Rooms', emoji: '🛏️',
    description: '2 fully furnished guest rooms for visiting family and friends of residents.',
    category: 'Accommodation', capacity: 4, operatingHours: '24 hours (check-in 12 PM)', status: 'active',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
    slots: [
      { label: 'Full Day (24 hrs)', price: 1500, guestCharge: 500 },
    ], maintenance: [],
  },
  {
    name: 'Games Room', emoji: '🎮',
    description: 'Indoor games room with billiards, table tennis, chess and board games.',
    category: 'Entertainment', capacity: 20, operatingHours: '10:00 AM - 9:00 PM', status: 'active',
    image: 'https://images.unsplash.com/photo-1554479736-0d5a8e3e3cb3?w=600&q=80',
    slots: [
      { label: '10:00 AM - 1:00 PM', price: 0, guestCharge: 0 },
      { label: '2:00 PM - 5:00 PM',  price: 0, guestCharge: 0 },
      { label: '6:00 PM - 9:00 PM',  price: 0, guestCharge: 0 },
    ], maintenance: [],
  },
];

const seedAmenities = async () => {
  try {
    const count = await Amenity.countDocuments();
    if (count > 0) {
      console.log(`Amenities already seeded (${count} found) - skipping`);
      return;
    }
    const inserted = await Amenity.insertMany(DEFAULT_AMENITIES);
    console.log(`Seeded ${inserted.length} default amenities into MongoDB`);
  } catch (err) {
    console.error('Amenity seeding failed (non-fatal):', err.message);
  }
};

module.exports = { seedAmenities };
