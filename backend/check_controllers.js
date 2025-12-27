const adminCtrl = require('./controllers/adminController');
const adminStudentCtrl = require('./controllers/adminStudentController');
const authCtrl = require('./controllers/authController');
const studentCtrl = require('./controllers/studentController');
const facultyCtrl = require('./controllers/facultyController');

const controllers = {
    adminCtrl,
    adminStudentCtrl,
    authCtrl,
    studentCtrl,
    facultyCtrl
};

for (const [name, ctrl] of Object.entries(controllers)) {
    console.log(`Checking ${name}:`);
    for (const [key, val] of Object.entries(ctrl)) {
        if (typeof val !== 'function') {
            console.log(`  - ${key}: ${typeof val} (NOT A FUNCTION!)`);
        } else {
            // console.log(`  - ${key}: OK`);
        }
    }
}
process.exit(0);
