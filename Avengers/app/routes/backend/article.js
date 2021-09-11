var express = require('express');
var router = express.Router();
const util = require('util');

const systemConfig = require(__path_config + 'system');
const notify = require(__path_config + 'notify');
const mainModel = require(__path_models + 'article');
const categoryModel = require(__path_models + 'category');
const validatorArticle = require(__path_validates + 'article');
const utilsHelpers = require(__path_helpers + 'utils');
const fileHelpers = require(__path_helpers + 'file');
const paramsHelpers = require(__path_helpers + 'params');
const linkIndex = '/' + systemConfig.prefixAdmin + '/article/';
const pageTitleIndex = 'Article Mannagement';
const pageTitleAdd = pageTitleIndex + ' - Add';
const pageTitleEdit = pageTitleIndex + ' - Edit';
const folderView = __path_views_admin + 'pages/article/';
const uploadThumb = fileHelpers.upload('thumb','article');

/* GET items list */
router.get('(/status/:status)?', async(req, res, next) => {
  let params   = {};
  params.keyword = paramsHelpers.getParams(req.query,'keyword','');
  params.currentStatus=paramsHelpers.getParams(req.params,'status','all');  
  params.sortField = paramsHelpers.getParams(req.session, 'sort_field', 'ordering');
  params.sortType = paramsHelpers.getParams(req.session, 'sort_type', 'asc');
  params.categoryID = paramsHelpers.getParams(req.session, 'category_id', '');
  params.pagination = {
    totalItems: 1,
    totalItemsPerPage: 5,
    currentPage      : parseInt(paramsHelpers.getParams(req.query,'page',1)),
    pageRanges : 3
  };
  let statusFilter = await utilsHelpers.createFilterStatus(params.currentStatus, 'article');

  let categoryItems = [];

  await categoryModel.listItemsInSelectbox().then((items) =>{
    categoryItems = items; 
    categoryItems.unshift({_id:'allvalue', name:'All Category'}); 
  }); 

  // console.log(mainModel)
  await mainModel.countItem(params).then((data) => {
    params.pagination.totalItems = data;
  });

  mainModel
  .listItems(params)
    .then((dataItems) => {
      res.render(`${folderView}list`, {
        pageTitle: 'QUẢN LÝ TIN TỨC',
        items: dataItems,
        statusFilter: statusFilter,
        categoryItems,
        params
      });
    });
});

// Change special
router.get('/change-special/:id/:special', (req, res, next) => {
  let currentSpecial = paramsHelpers.getParams(req.params,'special','active');  
  let id             = paramsHelpers.getParams(req.params,'id','');
  
  mainModel.changeSpecial({_id: id}, currentSpecial, {task: "update-one"}).then((result) => {
    req.flash('success', notify.CHANGE_SPECIAL_SUCCESS);
    res.redirect(linkIndex);
  });
  
});

// Change status
router.get('/change-status/:id/:status', (req, res, next) => {
  let currentStatus = paramsHelpers.getParams(req.params,'status','active');  
  let id            = paramsHelpers.getParams(req.params,'id','');
  
  mainModel.changeStatus({_id: id}, currentStatus, {task: "update-one"}).then((result) => {
    req.flash('success', notify.CHANGE_STATUS_SUCCESS);
    res.redirect(linkIndex);
  });
  
});

// Change status multi
router.post('/change-status/:status', (req, res, next) => {
  let currentStatus = paramsHelpers.getParams(req.params,'status','active');  
  
  mainModel.changeStatus(req.body.cid, currentStatus, {task: "update-multi"}).then((result) => {
    req.flash('success', util.format(notify.CHANGE_STATUS_MULTI_SUCCESS, result.n));
    res.redirect(linkIndex);
  });
});

//Change ordering-multi
router.post('/change-ordering', (req, res, next) => {
  let cids = req.body.cid;
  let orderings = req.body.ordering;

  mainModel.changeOrderings(cids, orderings, null).then((result) => {
    req.flash('success', notify.CHANGE_ORDERING_SUCCESS);
    res.redirect(linkIndex);
  });

});

// Delete status
router.get('/delete/:id', (req, res, next) => {
  let id            = paramsHelpers.getParams(req.params,'id','');

  mainModel.deleteItems(id, {task: "delete-one"}).then((result) => {
    req.flash('success', notify.DELETE_SUCCESS);
    res.redirect(linkIndex);
  });
  
});

// Delete status multi
router.post('/delete', (req, res, next) => {

  mainModel.deleteItems(req.body.cid, {task: "delete-multi"}).then((result) => {
    req.flash('success',  util.format(notify.DELETE_MULTI_SUCCESS, result.n));
    res.redirect(linkIndex);
  });
});

// Form items
router.get('/form(/:id)?',async function (req, res, next) {
  let id = paramsHelpers.getParams(req.params, 'id', '');
  let item = {name: '', ordering: 0, status: 'novalue', category_id:'', category_name:''};
  let errors = null;
  let categoryItems = [];

  await categoryModel.listItemsInSelectbox().then((items) =>{
    categoryItems = items; 
    categoryItems.unshift({_id:'allvalue', name:'All Category'}); 
  });
  if(id === ''){ // Add
    res.render(`${folderView}form`,{ pageTitle: pageTitleAdd, item, errors, categoryItems});
  } else { // Edit
    mainModel.getItems(id).then((item) => {
      item.category_id = item.category.id;
      item.category_name = item.category.name;
      res.render(`${folderView}form`, { pageTitle: pageTitleEdit, item, errors, categoryItems});
    });
  }
});

//Save
router.post('/save', (req, res, next) => {
  uploadThumb(req, res, async (errUpload) => {
    req.body = JSON.parse(JSON.stringify(req.body));
    
    let item = Object.assign(req.body);
    let taskCurrent = (typeof item !== "undefined" && item.id !== "") ? "edit" : "add";

    let errors = validatorArticle.validator(req, errUpload, taskCurrent);
    
    if (errors.length > 0) {
      let pageTitle = (taskCurrent == "add") ? pageTitleAdd : pageTitleEdit;
      if(req.file != undefined) fileHelpers.remove('public/uploads/article/', req.file.filename);
      let categoryItems = [];
      
      await categoryModel.listItemsInSelectbox().then((items) =>{
        categoryItems = items; 
        categoryItems.unshift({_id:'allvalue', name:'Choose Category'}); 
      });
      if(taskCurrent == 'edit') item.thumb = item.image_old;
      res.render(`${folderView}form`,{ pageTitle: pageTitle, item, errors, categoryItems});
    } else {
      let message = (taskCurrent == "add") ? notify.EDIT_SUCCESS : notify.EDIT_SUCCESS;
      if(req.file == undefined){
        item.thumb = item.image_old;
      }else{
        item.thumb = req.file.filename;
        if(taskCurrent == "edit") fileHelpers.remove('public/uploads/article/', item.image_old);
      }
      mainModel.saveItems(item, {task: taskCurrent}).then(() => {
        req.flash('success', message);
        res.redirect(linkIndex);
      });
    }
  });
        
});

router.get('/edit', function (req, res, next) {
  res.render(`${folderView}editItem`, { pageTitle: 'editItem' });
});

// SORT
router.get('/sort/:sort_field/:sort_type', (req, res, next) => {
  req.session.sort_field = paramsHelpers.getParams(req.params, 'sort_field', 'ordering');
  req.session.sort_type = paramsHelpers.getParams(req.params, 'sort_type', 'asc');

  res.redirect(linkIndex);

}); 
// Filter Category
router.get('/filter-category/:category_id', (req, res, next) => {
  req.session.category_id = paramsHelpers.getParams(req.params, 'category_id','');

  res.redirect(linkIndex);

}); 
module.exports = router;
