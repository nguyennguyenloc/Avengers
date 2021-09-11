var express = require('express');
var router = express.Router();
const util = require('util');

const systemConfig = require(__path_config + 'system');
const notify = require(__path_config + 'notify');
const mainModel = require(__path_models + 'users');
const groupsModel = require(__path_models + 'groups');
const validatorItems = require(__path_validates + 'users');
const utilsHelpers = require(__path_helpers + 'utils');
const fileHelpers = require(__path_helpers + 'file');
const paramsHelpers = require(__path_helpers + 'params');
const linkIndex = '/' + systemConfig.prefixAdmin + '/users/';
const pageTitleIndex = 'User Mannagement';
const pageTitleAdd = pageTitleIndex + ' - Add';
const pageTitleEdit = pageTitleIndex + ' - Edit';
const folderView = __path_views_admin + 'pages/users/';
const uploadAvatar = fileHelpers.upload('avatar','users');
const folderView1 = __path_views_admin + 'elements/';

/* GET items list */
router.get('(/status/:status)?', async(req, res, next) => {
  let params   = {};
  params.a = req.user.group.name;

  params.keyword = paramsHelpers.getParams(req.query,'keyword','');
  params.currentStatus=paramsHelpers.getParams(req.params,'status','all');  
  params.sortField = paramsHelpers.getParams(req.session, 'sort_field', 'ordering');
  params.sortType = paramsHelpers.getParams(req.session, 'sort_type', 'asc');
  params.groupID = paramsHelpers.getParams(req.session, 'group_id', '');
  params.pagination = {
    totalItems: 1,
    totalItemsPerPage: 5,
    currentPage      : parseInt(paramsHelpers.getParams(req.query,'page',1)),
    pageRanges : 3
  };
  let statusFilter = await utilsHelpers.createFilterStatus(params.currentStatus, 'users');

  let groupsItems = [];

  await groupsModel.listItemsInSelectbox().then((items) =>{
    groupsItems = items; 
    groupsItems.unshift({_id:'allvalue', name:'All Group'}); 
  }); 

  // console.log(mainModel)
  await mainModel.countItem(params).then((data) => {
    params.pagination.totalItems = data;
  });
  var a = req.user.group.name;// in ra  cho a y
  console.log(a);
  mainModel
  .listItems(params)
    .then((dataItems) => {
      res.render(`${folderView}list`, {
        pageTitle: 'QUẢN LÝ NHÂN VIÊN',
        items: dataItems,
        statusFilter: statusFilter,
        groupsItems,
        params
      });
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
  let item = {name: '', ordering: 0, status: 'novalue', group_id:'', group_name:''};
  let errors = null;
  let groupsItems = [];

  await groupsModel.listItemsInSelectbox().then((items) =>{
    groupsItems = items; 
    groupsItems.unshift({_id:'allvalue', name:'Choose Group'}); 
  });
  if(id === ''){ // Add
    res.render(`${folderView}form`,{ pageTitle: pageTitleAdd, item, errors, groupsItems});
  } else { // Edit
    mainModel.getItems(id).then((item) => {
      item.group_id = item.group.id;
      item.group_name = item.group.name;
      res.render(`${folderView}form`, { pageTitle: pageTitleEdit, item, errors, groupsItems});
    });
  }
});

//Save
router.post('/save', (req, res, next) => {
  uploadAvatar(req, res, async (errUpload) => {
    req.body = JSON.parse(JSON.stringify(req.body));
    
    let item = Object.assign(req.body);
    let taskCurrent = (typeof item !== "undefined" && item.id !== "") ? "edit" : "add";

    let errors = validatorItems.validator(req, errUpload, taskCurrent);
    
    if (errors.length > 0) {
      let pageTitle = (taskCurrent == "add") ? pageTitleAdd : pageTitleEdit;
      if(req.file != undefined) fileHelpers.remove('public/uploads/users/', req.file.filename);
      let groupsItems = [];
      
      await groupsModel.listItemsInSelectbox().then((items) =>{
        groupsItems = items; 
        groupsItems.unshift({_id:'allvalue', name:'Choose Group'}); 
      });
      if(taskCurrent == 'edit') item.avatar = item.image_old;
      res.render(`${folderView}form`,{ pageTitle: pageTitle, item, errors, groupsItems});
    } else {
      let message = (taskCurrent == "add") ? notify.ADD_SUCCESS : notify.EDIT_SUCCESS;
      if(req.file == undefined){
        item.avatar = item.image_old;
      }else{
        item.avatar = req.file.filename;
        if(taskCurrent == "edit") fileHelpers.remove('public/uploads/users/', item.image_old);
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
// Filter Group
router.get('/filter-group/:group_id', (req, res, next) => {
  req.session.group_id = paramsHelpers.getParams(req.params, 'group_id','');

  res.redirect(linkIndex);

}); 
module.exports = router;
