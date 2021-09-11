var express = require('express');
var router = express.Router();

const controllerName = 'contact';
const contactConfig  = require(__path_config + 'contact');
const MainModel 	= require(__path_models + controllerName);
const MainValidate	= require(__path_validates + controllerName);
const NotifyHelpers = require(__path_helpers + 'notify');
const systemConfig  = require(__path_config + 'system');
const linkIndex		 	= systemConfig.prefixBlog + `/contact/`;
const fileHelpers = require(__path_helpers + 'file');
const uploadAvatar = fileHelpers.upload('content','homework');
const categoryModel = require(__path_models + 'category');

const folderView = __path_views_blog + 'pages/contact/';
const layoutBlog = __path_views_blog + 'frontend';
/* GET about page. */
router.get('/', async (req, res, next) => {
  let errors = null;
  let contact = contactConfig;
  let itemsCategory = [];

  await categoryModel.listItemsFrontend(null, {task: 'items-in-menu'}).then((items) => {
    itemsCategory = items;
  });

  res.render(`${folderView}index`, {
    layout: layoutBlog,
    top_post: false,
    itemsCategory,
    errors,
    contact,
  });
});

// SAVE = ADD EDIT
router.post('/save', async (req, res, next) => {
  uploadAvatar(req, res, async (errUpload) => {
  
    req.body = JSON.parse(JSON.stringify(req.body));
    MainValidate.validator(req);
    
    let item = Object.assign(req.body);
    let errors = null
    let contact = contactConfig;
    errors = req.validationErrors();
    let taskCurrent = 'add';
    
    let itemsCategory = [];
    
    await categoryModel.listItemsFrontend(null, {task: 'items-in-menu'}).then((items) => {
      itemsCategory = items;
    });
    
    console.log("file là",req.file.filename);
    if(errors) { 
          res.render(`${folderView}index`, {itemsCategory,layout:layoutBlog, top_post:false, item, errors,contact});
    } else {
      item.content = req.file.filename;
      MainModel.saveItem(item, {task: taskCurrent}).then( (result) => {
          NotifyHelpers.show(req, res, linkIndex, {task: 'add-contact-success'},contact);
      });
    }
  });
});

module.exports = router;

