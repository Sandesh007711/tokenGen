const dotenv = require('dotenv');
const mongoose = require('mongoose');

const User = require('./../../models/userModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
    '<password>',
    process.env.DATABASE_PASSWORD
);
  
mongoose
    .connect(DB, {
    //   useNewUrlParser: true,
    //   useCreateIndex: true,
    //   useFindAndModify: false
    })
    .then(() => console.log('DB connection successful!'));

/**
 * create admin using this
 */ 
const importAdmin = async() => {
    try {
        console.log('Super Admin Seeder Started');
        
        const admin = {
            username: 'Super Admin',
            password: 'Router@123',
            phone: 9334466191,
            role: 'admin',
            route: 'Sadmin'
        }

        await User.create(admin)
        console.log('Admin created');
    } catch (error) {
        console.log(error);
    }
    process.exit();
}

if(process.argv[2] === '--import') {
    importAdmin()
    console.log('Super Admin Seeder Finished');
}