const notify = require(__path_config + 'notify');
const util = require('util');

const options = {
    name: {min: 6, max: 100},
    ordering: {min: 0, max: 99},
    status: {value: 'novalue'},
    special: {value: 'novalue'},
    content: {min: 5, max: 200000000000}

}
module.exports = {
    validator: (req) => {
        req.checkBody('name',util.format(notify.ERROR_NAME, options.name.min, options.name.max )).isLength({min: options.name.min, max: options.name.max});
        req.checkBody('ordering',util.format(notify.ERROR_ORDERING, options.ordering.min, options.ordering.max )).isInt({gt: options.ordering.min, lt: options.ordering.max});
        req.checkBody('status', notify.ERROR_STATUS).isNotEqual(options.status.value);
        req.checkBody('special', notify.ERROR_SPECIAL).isNotEqual(options.special.value);
        req.checkBody('content',util.format(notify.ERROR_NAME, options.content.min, options.content.max )).isLength({min: options.content.min, max: options.content.max});
        
        let errors = req.validationErrors() !== false ? req.validationErrors() : [];
        return errors;
    }
};