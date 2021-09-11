const mongoose = require('mongoose');
const databaseConfig = require(__path_config + 'database');

var schema = new mongoose.Schema({ 
    name: String,
    email: String,
    phone: String, 
    content: String,
    created: {
        user_id: Number,
        user_name: String,
        time: Date
    },
    modified: {
        user_id: Number,
        user_name: String,
        time: Date
    }
});

module.exports = mongoose.model(databaseConfig.col_contact, schema);