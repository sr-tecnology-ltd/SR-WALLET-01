const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(process.cwd(), 'data', 'srgateway_database.json');

const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Advaith', 'Kabir', 'Ananya', 'Diya', 'Gauri', 'Isha',
  'Kavya', 'Khushi', 'Myra', 'Navya', 'Pari', 'Prisha', 'Riya', 'Saanvi', 'Sia', 'Aaditri',
  'Sneha', 'Pooja', 'Rohan', 'Amit', 'Sunil', 'Rajesh', 'Vikram', 'Deepak', 'Suresh', 'Manoj',
  'Neeraj', 'Alok', 'Sachin', 'Mohit', 'Rahul', 'Karan', 'Naveen', 'Sameer', 'Pankaj', 'Dinesh',
  'Gaurav', 'Ravi', 'Ashish', 'Manish', 'Harsh', 'Vikas', 'Nikhil', 'Sumit', 'Abhishek', 'Tarun',
  'Kunal', 'Deepika', 'Priyanka', 'Neha', 'Swati', 'Preeti', 'Megha', 'Shweta', 'Sunita', 'Rekha',
  'Anita', 'Komal', 'Sonia', 'Jyoti', 'Babita', 'Radha', 'Simran', 'Payal', 'Divya', 'Bhawna',
  'Tanvi', 'Kritika', 'Nidhi', 'Shikha', 'Aarti', 'Kiran', 'Archana', 'Monika', 'Pinky', 'Meena',
  'Rani', 'Suman', 'Anjali', 'Sarita', 'Seema', 'Mamta', 'Usha', 'Lata', 'Shalini', 'Ritu',
  'Manju', 'Geeta', 'Sushma', 'Sonu', 'Dharmendra'
];

const lastNames = [
  'Sharma', 'Verma', 'Gupta', 'Patel', 'Singh', 'Kumar', 'Yadav', 'Mishra', 'Pandey', 'Tiwari',
  'Das', 'Roy', 'Chakraborty', 'Banerjee', 'Nair', 'Menon', 'Pillai', 'Rao', 'Reddy', 'Choudhary',
  'Mehra', 'Bose', 'Dutta', 'Joshi', 'Bhat', 'Khan', 'Ansari', 'Qureshi', 'Shaikh', 'Ali',
  'Malik', 'Mirza', 'Siddiqui', 'Shah', 'Jain', 'Agarwal', 'Bansal', 'Goel', 'Mittal', 'Singhal',
  'Khatri', 'Chauhan', 'Thakur', 'Rathore', 'Parmar', 'Solanki', 'Rawat', 'Negi', 'Bisht'
];

// Helper to generate a realistic 10-digit Indian mobile number
// Indian mobile numbers start with 9, 8, 7, or 6
const usedMobiles = new Set();
function generateMobile() {
  const prefixes = ['98', '97', '96', '95', '93', '91', '89', '88', '87', '86', '85', '84', '82', '81', '79', '78', '77', '76', '75', '74', '73', '72', '70', '63', '62'];
  while (true) {
    const pfx = prefixes[Math.floor(Math.random() * prefixes.length)];
    let remaining = '';
    for (let i = 0; i < 8; i++) {
      remaining += Math.floor(Math.random() * 10).toString();
    }
    const mobile = pfx + remaining;
    if (!usedMobiles.has(mobile)) {
      usedMobiles.add(mobile);
      return mobile;
    }
  }
}

// Generate random amount between 1.20 and 10.00
function generateRandomBalance() {
  const min = 1.20;
  const max = 10.00;
  const amt = Math.random() * (max - min) + min;
  return Number(amt.toFixed(2));
}

// Generate 4-digit RPIN
function generateRpin() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function run() {
  if (!fs.existsSync(DB_FILE)) {
    console.error('Database file not found:', DB_FILE);
    process.exit(1);
  }

  const raw = fs.readFileSync(DB_FILE, 'utf8');
  const db = JSON.parse(raw);

  if (!Array.isArray(db.users)) db.users = [];
  if (!db.wallets || typeof db.wallets !== 'object') db.wallets = {};
  if (!Array.isArray(db.transactions)) db.transactions = [];

  // Track existing mobiles and emails
  db.users.forEach(u => {
    if (u.mobile) usedMobiles.add(u.mobile.replace(/[^0-9]/g, '').slice(-10));
  });

  const targetCount = 105;
  const newUsers = [];
  const startId = 10031;

  for (let i = 0; i < targetCount; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${fn} ${ln}`;
    const customId = `SR-${startId + i}`;
    const id = `user-${startId + i}`;
    const mobile = generateMobile();
    const cleanFn = fn.toLowerCase().replace(/[^a-z]/g, '');
    const cleanLn = ln.toLowerCase().replace(/[^a-z]/g, '');
    const emailNum = Math.floor(100 + Math.random() * 900);
    const email = `${cleanFn}.${cleanLn}${emailNum}@gmail.com`;
    const rpin = generateRpin();
    const password = `User@${fn}${Math.floor(100 + Math.random() * 900)}`;
    const balance = generateRandomBalance();
    const createdAt = new Date(Date.now() - Math.floor(Math.random() * 30 * 86400000)).toISOString();

    const userObj = {
      id,
      user_custom_id: customId,
      full_name: fullName,
      mobile,
      email,
      password,
      rpin,
      telegram_id: '',
      telegram_chat_id: '',
      role: 'USER',
      status: 'ACTIVE',
      referral_code: `SR${mobile.slice(-4)}`,
      created_at: createdAt,
      updated_at: new Date().toISOString(),
      daily_api_requests_count: 0,
      daily_api_limit: 10,
    };

    const walletObj = {
      id: `w-${customId}`,
      user_id: customId,
      available_balance: balance,
      locked_balance: 0,
      created_at: createdAt,
      updated_at: new Date().toISOString(),
    };

    newUsers.push(userObj);

    // Register wallet under customId, internal id, and 10-digit mobile
    db.wallets[customId] = walletObj;
    db.wallets[id] = walletObj;
    db.wallets[mobile] = walletObj;

    // Add initial signup bonus / welcome deposit transaction in ledger
    db.transactions.push({
      id: `TXN-WELCOME-${customId}`,
      user_id: customId,
      type: 'DEPOSIT',
      amount: balance,
      fee: 0,
      net_amount: balance,
      status: 'SUCCESS',
      reference_id: `WELCOME-BONUS-${customId}`,
      description: 'Welcome Signup Bonus & Initial Wallet Balance',
      balance_before: 0,
      balance_after: balance,
      created_at: createdAt,
    });
  }

  // Add the 105 users
  db.users.push(...newUsers);

  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  console.log(`Successfully generated and registered ${newUsers.length} fake users! Total users now: ${db.users.length}`);
}

run();
