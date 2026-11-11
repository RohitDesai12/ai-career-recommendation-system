/**
 * Career Compass — Production Admin Creation Script
 * 
 * Safely provisions an Admin account directly into MongoDB Atlas.
 * - Reuses official User model and bcryptjs pre('save') hashing (10 salt rounds)
 * - Never stores plaintext passwords
 * - Verifies against duplicate admin accounts
 * - Leaves all existing collections (jobs, companies, students) completely untouched
 * 
 * Usage:
 *   1. Interactive mode:
 *      node backend/scripts/createAdmin.js
 * 
 *   2. Non-interactive mode (via environment variables):
 *      ADMIN_NAME="System Admin" ADMIN_EMAIL="admin@careercompass.com" ADMIN_PASSWORD="SecurePassword123!" node backend/scripts/createAdmin.js
 */

const path = require('path');
const readline = require('readline');
const mongoose = require('mongoose');

// Load environment variables from backend/.env
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

function promptInput(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(query, (ans) => {
            rl.close();
            resolve(ans.trim());
        });
    });
}

function promptHidden(query) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        // Simple masked input prompt
        process.stdout.write(query);
        let input = '';
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        const onData = (char) => {
            if (char === '\n' || char === '\r' || char === '\u0004') {
                process.stdin.setRawMode(false);
                process.stdin.pause();
                process.stdin.removeListener('data', onData);
                process.stdout.write('\n');
                rl.close();
                resolve(input.trim());
            } else if (char === '\u0003') { // Ctrl+C
                process.exit(1);
            } else if (char === '\b' || char === '\x7f') { // Backspace
                if (input.length > 0) {
                    input = input.slice(0, -1);
                    process.stdout.write('\b \b');
                }
            } else {
                input += char;
                process.stdout.write('*');
            }
        };

        process.stdin.on('data', onData);
    });
}

async function createAdmin() {
    console.log('\n==================================================');
    console.log('   Career Compass — Production Admin Setup Tool   ');
    console.log('==================================================\n');

    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.error('Error: MONGO_URI is not defined in backend/.env');
        process.exit(1);
    }

    const sanitizedUri = mongoUri.replace(/:([^:@]+)@/, ':****@');
    console.log(`Connecting to MongoDB Atlas at: ${sanitizedUri}`);

    try {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 15000 });
        console.log(`Connected to database: ${mongoose.connection.name}\n`);

        // Check if an admin account already exists
        const existingAdmins = await User.find({ role: 'admin' }).select('name email role status createdAt');
        if (existingAdmins.length > 0) {
            console.log(`[NOTICE] Found ${existingAdmins.length} existing Admin account(s) in database:`);
            existingAdmins.forEach((a, i) => {
                console.log(`   ${i + 1}. Name: ${a.name} | Email: ${a.email} | Status: ${a.status} | Created: ${a.createdAt}`);
            });
            console.log('\nAn admin account already exists in Atlas.');
            console.log('To prevent duplicate admin accounts and preserve audit integrity, automatic creation is blocked.');
            console.log('If you need to log in, use the above email at http://localhost:5173/login (or your production URL).');
            await mongoose.disconnect();
            return;
        }

        console.log('No existing Admin account found in this database.');
        console.log('Ready to provision the primary production Admin account.\n');

        // Resolve admin details (from ENV or interactive prompt)
        let name = process.env.ADMIN_NAME;
        let email = process.env.ADMIN_EMAIL;
        let password = process.env.ADMIN_PASSWORD;

        if (!name) {
            name = await promptInput('Enter Admin Full Name [Default: Administrator]: ');
            if (!name) name = 'Administrator';
        }

        if (!email) {
            email = await promptInput('Enter Admin Email Address: ');
            while (!email || !email.includes('@')) {
                console.log('Invalid email format. Please enter a valid email.');
                email = await promptInput('Enter Admin Email Address: ');
            }
        }
        email = email.toLowerCase().trim();

        // Check if a user with this email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.error(`\n[ERROR] A user with email "${email}" already exists with role: "${existingUser.role}".`);
            console.error('Cannot create duplicate user. Choose another email or update the existing account role.');
            await mongoose.disconnect();
            process.exit(1);
        }

        if (!password) {
            if (process.stdin.isTTY) {
                password = await promptHidden('Enter Admin Password (min 8 chars): ');
                while (!password || password.length < 8) {
                    console.log('Password must be at least 8 characters long.');
                    password = await promptHidden('Enter Admin Password (min 8 chars): ');
                }
                const confirmPassword = await promptHidden('Confirm Admin Password: ');
                if (password !== confirmPassword) {
                    console.error('\n[ERROR] Passwords do not match. Aborting.');
                    await mongoose.disconnect();
                    process.exit(1);
                }
            } else {
                console.error('\n[ERROR] ADMIN_PASSWORD environment variable must be set in non-interactive mode.');
                await mongoose.disconnect();
                process.exit(1);
            }
        } else if (password.length < 8) {
            console.error('\n[ERROR] ADMIN_PASSWORD must be at least 8 characters long.');
            await mongoose.disconnect();
            process.exit(1);
        }

        console.log('\nCreating Admin account in database...');

        const newAdmin = new User({
            name,
            email,
            password, // Mongoose pre('save') hook hashes with bcryptjs (10 salt rounds)
            role: 'admin',
            status: 'Active',
            isVerified: true,
            consent: {
                termsAccepted: true,
                privacyAccepted: true,
                version: 'v1.0',
                acceptedAt: new Date()
            }
        });

        await newAdmin.save();

        // Verification query
        const verified = await User.findById(newAdmin._id).select('-password');
        console.log('\n==================================================');
        console.log('       ADMIN ACCOUNT SUCCESSFULLY PROVISIONED      ');
        console.log('==================================================');
        console.log(`ID:        ${verified._id}`);
        console.log(`Name:      ${verified.name}`);
        console.log(`Email:     ${verified.email}`);
        console.log(`Role:      ${verified.role}`);
        console.log(`Status:    ${verified.status}`);
        console.log(`Verified:  ${verified.isVerified}`);
        console.log(`Created:   ${verified.createdAt}`);
        console.log('==================================================\n');
        console.log('Next Steps:');
        console.log('1. Start frontend and backend.');
        console.log('2. Navigate to: /login');
        console.log(`3. Sign in with: ${verified.email}`);
        console.log('4. The frontend will automatically redirect you to /admin/dashboard\n');

        await mongoose.disconnect();
        console.log('Disconnected cleanly from MongoDB Atlas.');
    } catch (err) {
        console.error('\n[ERROR] Failed to provision admin account:', err.message);
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        process.exit(1);
    }
}

createAdmin();

