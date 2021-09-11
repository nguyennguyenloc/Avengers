var express = require('express');
var router = express.Router();

const systemConfig  = require(__path_config + 'system');
const linkLogin     = '/' + systemConfig.prefixAdmin + '/auth/login/';
const linkNoPremission = '/' + systemConfig.prefixAdmin + '/auth/no-permission/';
const linkNoPremission1 = '/' + systemConfig.prefixAdmin + '/article/';

/* GET dashboard page. */

router.use('/auth', require('./auth'));
router.use('/', (req, res, next) => { 
    if(req.isAuthenticated()){
        if(req.user.group.name == "Admin123"){
            next();
        }else if(req.user.group.name == "Trưởng phòng"){
            next();
        }else if(req.user.group.name == "Member"){
            next();
        }else{
            res.redirect(linkNoPremission);
        }
        return;
    }else{
        res.redirect(linkLogin);
    }
}, require('./home'));

router.use('/groups', require('./groups'));
router.use('/users', require('./users'));
router.use('/dashboard', require('./dashboard'));
router.use('/category', require('./category'));
router.use('/article', require('./article'));
router.use('/contact', require('./contact'));
router.use('/documents',require('./documents'));

module.exports = router;
