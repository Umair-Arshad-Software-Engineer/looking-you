const { connectDB, sequelize } = require('./src/config/database');
const Admin = require('./src/models/admin.model');

const seedAdmin = async () => {
    try {
        await connectDB();
        
        // Sync the Admins table (incase it's not created yet)
        await Admin.sync();

        const count = await Admin.count();
        if (count > 0) {
            console.log('⚠️ Admin already exists in database.');
            process.exit();
        }

        await Admin.create({
            username: 'sufyan',
            password: '@Sufyan123', // Automatically hashed by the model hook
            role: 'admin'
        });

        console.log('✅ Success: Admin account "admin" with password "admin123" created!');
        process.exit();
    } catch (err) {
        console.error('❌ Error seeding admin:', err.message);
        process.exit(1);
    }
};

seedAdmin();
