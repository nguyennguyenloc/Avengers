var express = require('express');
var router 	= express.Router();

const controllerName = 'contact';

const systemConfig  = require(__path_config + 'system');
const MainModel 	= require(__path_models + controllerName);
const MainValidate	= require(__path_validates + controllerName);
const UtilsHelpers 	= require(__path_helpers + 'utils');
const NotifyHelpers = require(__path_helpers + 'notify');
const notify  		= require(__path_config + 'notify');
const ParamsHelpers = require(__path_helpers + 'params'); 

const linkIndex		 = '/' + systemConfig.prefixAdmin + `/${controllerName}/`;
const pageTitleIndex = 'QUẢN LÝ LIÊN HỆ';
const folderView	 = __path_views_admin + `pages/${controllerName}/`;


router.get('(/status/:status)?', async (req, res, next) => {
	let params 		 	 = ParamsHelpers.createParam(req);
		params.a = req.user.group.name;
	let statusFilter = await UtilsHelpers.createFilterStatus(params.currentStatus, controllerName);
	await MainModel.countItem(params).then( (data) => { params.pagination.totalItems = data; });
	
	MainModel.listItems(params)
	.then( (items) => {
			res.render(`${folderView}list`, { 
				pageTitle: pageTitleIndex,
				controllerName,
				items,
				statusFilter,
				params,
			});
		});
});


// Delete
router.get('/delete/:id', (req, res, next) => {
	let id				= ParamsHelpers.getParams(req.params, 'id', ''); 	
	MainModel.deleteItem(id, {task: 'delete-one'} )
	.then((result) => NotifyHelpers.show(req, res, linkIndex, {task: 'delete-one'}));
});

// SORT
router.get(('/sort/:sort_field/:sort_type'), (req, res, next) => {
	req.session.sort_field		= ParamsHelpers.getParams(req.params, 'sort_field', 'ordering');
	req.session.sort_type		= ParamsHelpers.getParams(req.params, 'sort_type', 'asc');
	res.redirect(linkIndex);
});

module.exports = router;