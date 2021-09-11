var express = require('express');
var router = express.Router();
const util = require('util');

const systemConfig = require(__path_config + 'system');
const notify = require(__path_config + 'notify');
const groupsModel = require(__path_models + 'groups');
const usersModel = require(__path_models + 'users');
const validatorGroups = require(__path_validates + 'groups');
const utilsHelpers = require(__path_helpers + 'utils');
const paramsHelpers = require(__path_helpers + 'params');
const linkIndex = '/' + systemConfig.prefixAdmin + '/groups/';

const pageTitleIndex = 'Groups Mannagement';
const pageTitleAdd = pageTitleIndex + ' - Add';
const pageTitleEdit = pageTitleIndex + ' - Edit';
const folderView = __path_views_admin + 'pages/groups/';
/* GET groups list */
router.get('(/status/:status)?', async(req, res, next) => {
  let params   = {};
  params.a = req.user.group.name;
  params.keyword = paramsHelpers.getParams(req.query,'keyword','');
  params.currentStatus=paramsHelpers.getParams(req.params,'status','all');  
  params.sortField = paramsHelpers.getParams(req.session, 'sort_field', 'ordering');
  params.sortType = paramsHelpers.getParams(req.session, 'sort_type', 'asc');
  params.pagination = {
    totalItems: 1,
    totalItemsPerPage: 4,
    currentPage      : parseInt(paramsHelpers.getParams(req.query,'page',1)),
    pageRanges : 3
  };
  let statusFilter = await utilsHelpers.createFilterStatus(params.currentStatus, 'groups');
  
  await groupsModel.countItem(params).then((data) => {
    params.pagination.totalItems = data;
  });
  
  groupsModel
    .listItems(params)
    .then((dataItems) => {
      res.render(`${folderView}list`, {
        pageTitle: 'QUẢN LÝ PHÒNG BAN',
        items: dataItems,
        statusFilter: statusFilter,
        params
      });
    });
  });

// Change status
router.get('/change-status/:id/:status', (req, res, next) => {
  let currentStatus = paramsHelpers.getParams(req.params,'status','active');  
  let id            = paramsHelpers.getParams(req.params,'id','');
 
  groupsModel.changeStatus(id, currentStatus, {task: "update-one"}).then((result) => {
    req.flash('success', notify.CHANGE_STATUS_SUCCESS);
    res.redirect(linkIndex);
  });
  
});

// Change status multi
router.post('/change-status/:status', (req, res, next) => {
  let currentStatus = paramsHelpers.getParams(req.params,'status','active');  
 
  groupsModel.changeStatus(req.body.cid, currentStatus, {task: "update-multi"}).then((result) => {
    req.flash('success', util.format(notify.CHANGE_STATUS_MULTI_SUCCESS, result.n));
    res.redirect(linkIndex);
  });
});

// Change group
router.get('/change-group-acp/:id/:group_acp', (req, res, next) => {
  let currentGroups = paramsHelpers.getParams(req.params,'group_acp','yes');  
  let id            = paramsHelpers.getParams(req.params,'id','');
  
  groupsModel.changeGroupACP(id, currentGroups).then((result) => {
    req.flash('success', notify.CHANGE_GROUP_ACP_SUCCESS);
    res.redirect(linkIndex);
  });
  
});
//Change ordering-multi
router.post('/change-ordering', (req, res, next) => {
  let cids = req.body.cid;
  let orderings = req.body.ordering;

  groupsModel.changeOrderings(cids, orderings, null).then((result) => {
    req.flash('success', notify.CHANGE_ORDERING_SUCCESS);
    res.redirect(linkIndex);
  });

});

// Delete status
router.get('/delete/:id', (req, res, next) => {
  let id            = paramsHelpers.getParams(req.params,'id','');

  groupsModel.deleteItems(id, {task: "delete-one"}).then((result) => {
    req.flash('success', notify.DELETE_SUCCESS);
    res.redirect(linkIndex);
  });
  
});

// Delete status multi
router.post('/delete', (req, res, next) => {

  groupsModel.deleteItems(req.body.cid, {task: "delete-multi"}).then((result) => {
    req.flash('success',  util.format(notify.DELETE_MULTI_SUCCESS, result.n));
    res.redirect(linkIndex);
  });
});

// Form items
router.get('/form(/:id)?', function (req, res, next) {
  let id = paramsHelpers.getParams(req.params, 'id', '');
  let item = {name: '', ordering: 0, status: 'novalue'};
  let errors = null;
  if(id === ''){ // Add
    res.render(`${folderView}form`,{ pageTitle: pageTitleAdd, item, errors});
  } else { // Edit
    groupsModel.getItems(id).then((item) => {
      res.render(`${folderView}form`, { pageTitle: pageTitleEdit, item, errors});
    });
  }
});

//Save
router.post('/save', (req, res, next) => {
  req.body = JSON.parse(JSON.stringify(req.body));
  validatorGroups.validator(req);

  let item = Object.assign(req.body);
  let errors = req.validationErrors();

  let taskCurrent = (typeof item !== "undefined" && item.id !== "") ? "edit" : "add";
    if (errors) {
      let pageTitle = (taskCurrent == "add") ? pageTitleAdd : pageTitleEdit;
      res.render(`${folderView}form`,{ pageTitle: pageTitle, item, errors});
    } else {
      let message = (taskCurrent == "add") ? notify.EDIT_SUCCESS : notify.EDIT_SUCCESS;
      groupsModel.saveItems(item, {task: taskCurrent}).then((result) => {
        if(taskCurrent == "edit"){
            usersModel.saveItems(item, {task: "change-group-name"}).then((result) => {
              req.flash('success', message);
              res.redirect(linkIndex);
            });
        }else if(taskCurrent == "add"){
            req.flash('success', notify.ADD_SUCCESS);
            res.redirect(linkIndex);
        }
      });
    }
  
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
module.exports = router;
