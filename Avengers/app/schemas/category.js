const mongoose = require('mongoose');
const databaseConfig = require(__path_config + 'database');

const schema = new mongoose.Schema({
    name: String,
    slug: String,
    ordering: Number,
    status: String,
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
module.exports = mongoose.model(databaseConfig.col_category, schema);