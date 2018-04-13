const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

function getDatabaseUri() {
    if (process.env.NODE_ENV === 'test') return 'mongodb://localhost/project1901-test';
    // if (process.env.NODE_ENV === 'production') return 'mongodb://localhost/project1901-test';
    return 'mongodb://localhost/project1901'
}

mongoose.connect(getDatabaseUri(), { useMongoClient: true })
.catch(() => process.exit(1));
