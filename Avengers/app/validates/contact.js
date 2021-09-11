const notify = require(__path_config + 'notify');
const util = require('util');

const options = {
    name: {min: 5, max: 30},
    email: {min: 5, max: 100},
    phone: {min: 5, max: 100},
    // content: {min: 5, max: 200}

}
module.exports = {
    validator: (req) => {
        req.checkBody('name',util.format(notify.ERROR_NAME, options.name.min, options.name.max )).isLength({min: options.name.min, max: options.name.max});
        req.checkBody('email',util.format(notify.ERROR_NAME, options.email.min, options.email.max )).isLength({min: options.email.min, max: options.email.max});
        req.checkBody('phone',  util.format(notify.ERROR_PHONE))
            .isLength({ min: options.phone.min, max: options.phone.max });
        // req.checkBody('content',util.format(notify.ERROR_NAME, options.content.min, options.content.max )).isLength({min: options.content.min, max: options.content.max});
        
        let errors = req.validationErrors() !== false ? req.validationErrors() : [];
        return errors;
    }
};