const notify = require(__path_config + 'notify');
const util = require('util');

const options = {
    username: {min: 3, max: 10},
    password: {min: 3, max: 10}
}
module.exports = {
    validator: (req) => {
        req.checkBody('username',util.format(notify.ERROR_NAME, options.username.min, options.username.max )).isLength({min: options.username.min, max: options.username.max});
        req.checkBody('password',util.format(notify.ERROR_NAME, options.password.min, options.password.max )).isLength({min: options.password.min, max: options.password.max});
    }
};