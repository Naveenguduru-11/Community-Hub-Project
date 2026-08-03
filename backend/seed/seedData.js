const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Community = require('../models/Community');
const Villa = require('../models/Villa');
const Visitor = require('../models/Visitor');
const Vehicle = require('../models/Vehicle');
const Complaint = require('../models/Complaint');
const Notice = require('../models/Notice');
const Payment = require('../models/Payment');
const Event = require('../models/Event');

const seed = async () => {
  try {
    console.log('Seeding initial community dataset...');
    await Promise.all([
      User.deleteMany({}),
      Community.deleteMany({}),
      Villa.deleteMany({}),
      Visitor.deleteMany({}),
      Vehicle.deleteMany({}),
      Complaint.deleteMany({}),
      Notice.deleteMany({}),
      Payment.deleteMany({}),
      Event.deleteMany({})
    ]);

    const community = await Community.create({
      name: 'Greenfield Heights & Villa Enclave',
      code: 'GHVE-2026',
      address: {
        street: '100 Feet Outer Ring Road, Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        zipCode: '500033',
        country: 'India'
      },
      totalVillas: 40,
      amenities: ['Clubhouse', 'Swimming Pool', 'Tennis Court', 'Children Play Park', 'EV Charging Station', '24/7 Gate Security'],
      contactPhone: '+91 98765 43210',
      contactEmail: 'support@greenfieldvillas.com',
      maintenanceMonthlyRate: 4500,
      bannerUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'
    });

    const superAdmin = await User.create({
      name: 'Eleanor Vance (Super Admin)',
      email: 'superadmin@communityhub.com',
      password: 'password123',
      phone: '+91 90000 11111',
      role: 'SUPER_ADMIN',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
    });

    const communityAdmin = await User.create({
      name: 'Rajesh Sharma (Admin)',
      email: 'admin@greenfield.com',
      password: 'password123',
      phone: '+91 98765 11223',
      role: 'COMMUNITY_ADMIN',
      community: community._id,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80'
    });

    community.admin = communityAdmin._id;
    await community.save();

    const guard = await User.create({
      name: 'Vikram Singh (Security Chief)',
      email: 'guard@greenfield.com',
      password: 'password123',
      phone: '+91 99887 76655',
      role: 'SECURITY_GUARD',
      community: community._id,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
    });

    const resident1 = await User.create({
      name: 'Aarav Mehta',
      email: 'resident@greenfield.com',
      password: 'password123',
      phone: '+91 91234 56789',
      role: 'RESIDENT',
      community: community._id,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      familyMembers: [
        { name: 'Priya Mehta', relation: 'Spouse', phone: '+91 91234 56790', age: 32 },
        { name: 'Vivaan Mehta', relation: 'Son', phone: '', age: 8 }
      ],
      emergencyContact: { name: 'Dr. Suresh Mehta', phone: '+91 98989 89898', relation: 'Father' }
    });

    const resident2 = await User.create({
      name: 'Ananya Reddy',
      email: 'resident2@greenfield.com',
      password: 'password123',
      phone: '+91 98888 77777',
      role: 'RESIDENT',
      community: community._id,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      familyMembers: [
        { name: 'Karthik Reddy', relation: 'Spouse', phone: '+91 98888 77778', age: 35 }
      ]
    });

    const villa1 = await Villa.create({
      villaNumber: 'V-101',
      block: 'Phase 1 - Royal Palms',
      sizeSqFt: 3200,
      bedrooms: 4,
      community: community._id,
      owner: resident1._id,
      occupancyStatus: 'OWNER_OCCUPIED'
    });

    const villa2 = await Villa.create({
      villaNumber: 'V-102',
      block: 'Phase 1 - Royal Palms',
      sizeSqFt: 2800,
      bedrooms: 3,
      community: community._id,
      owner: resident2._id,
      occupancyStatus: 'OWNER_OCCUPIED'
    });

    resident1.villa = villa1._id;
    await resident1.save();

    resident2.villa = villa2._id;
    await resident2.save();

    await Visitor.create({
      name: 'Rohan Verma',
      phone: '+91 99001 12233',
      visitorType: 'GUEST',
      purpose: 'Weekend Dinner Visit',
      community: community._id,
      villa: villa1._id,
      hostResident: resident1._id,
      passcode: '849201',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=COMMUNITYHUB-VISITOR-849201',
      status: 'PRE_APPROVED',
      vehicleNumber: 'TS 08 GB 1234'
    });

    await Visitor.create({
      name: 'Amazon Delivery Executive',
      phone: '+91 97777 66666',
      visitorType: 'DELIVERY',
      company: 'Amazon Logistics',
      purpose: 'Parcel Delivery',
      community: community._id,
      villa: villa1._id,
      hostResident: resident1._id,
      passcode: '521940',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=COMMUNITYHUB-VISITOR-521940',
      status: 'INSIDE',
      entryTime: new Date(Date.now() - 15 * 60 * 1000),
      checkedInBy: guard._id
    });

    await Complaint.create({
      title: 'Water Pressure Low in Master Bathroom',
      description: 'The overhead water pressure booster pump seems to be fluctuating since this morning.',
      category: 'PLUMBING',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      raisedBy: resident1._id,
      villa: villa1._id,
      community: community._id,
      assignedTo: 'Senior Plumber - Ramesh'
    });

    await Notice.create({
      title: 'Scheduled Water Tank Sanitization',
      content: 'Please be informed that the main overhead water tanks for Phase 1 & 2 will undergo sanitization on Saturday from 9:00 AM to 1:00 PM.',
      category: 'MAINTENANCE',
      priority: 'IMPORTANT',
      community: community._id,
      author: communityAdmin._id
    });

    await Payment.create({
      title: 'Monthly Maintenance Fee - August 2026',
      month: 'August 2026',
      amount: 4500,
      totalAmount: 4500,
      status: 'PENDING',
      dueDate: new Date('2026-08-15'),
      resident: resident1._id,
      villa: villa1._id,
      community: community._id,
      receiptNumber: 'INV-2026-08-101'
    });

    await Event.create({
      title: 'Annual Villa Championship Badminton Tournament',
      description: 'Singles and Doubles matches for Mens, Womens, and Juniors categories.',
      location: 'Greenfield Sports Complex Court 1 & 2',
      eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      startTime: '16:00',
      endTime: '20:30',
      category: 'SPORTS',
      community: community._id,
      organizer: communityAdmin._id,
      attendees: [
        { user: resident1._id, status: 'GOING', guestsCount: 2 }
      ]
    });

    console.log('✅ SEEDING COMPLETED SUCCESSFULLY ✅');
  } catch (err) {
    console.error('Seeding Error:', err.message);
  }
};

module.exports = seed;
