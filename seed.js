const { connectDB } = require('./src/config/database');
const Admin = require('./src/models/admin.model');

const seedAdmin = async () => {
    try {
        await connectDB();
        await Admin.sync();

        let admin = await Admin.findOne({ where: { username: 'sufyan' } });
        if (admin) {
            admin.password = '@Sufyan786';
            await admin.save();
            console.log('✅ Admin "sufyan" password verified/updated.');
        } else {
            await Admin.create({
                username: 'sufyan',
                password: '@Sufyan786',
                role: 'admin'
            });
            console.log('✅ Admin "sufyan" created successfully.');
        }
    } catch (err) {
        console.error('Êc Error seeding admin:', err.message);
    }
};

if (require.main === module) {
    seedAdmin().then(() => process.exit());
 }

module.exports = { seedAdmin };