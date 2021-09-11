const mongoose = require('mongoose');
const databaseConfig = require(__path_config + 'database');

const schema = new mongoose.Schema({
    name: String,
    status: String,
});
module.exports = mongoose.model(databaseConfig.col_subject, schema);