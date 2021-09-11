var express = require('express');
var router = express.Router();

const folderView = __path_views_admin + 'pages/dashboard/';
const ItemsModel 	= require(__path_schemas + 'items');
const GroupsModel 	= require(__path_schemas + 'groups');
const UsersModel 	= require(__path_schemas + 'users');
const CategoryModel 	= require(__path_schemas + 'category');
const ArticleModel 	= require(__path_schemas + 'article');
// const RssModel 	= require(__path_schemas + 'rss');
const ContactModel 	= require(__path_schemas + 'contact');
/* GET dashboard list */
router.get('/', async (req, res, next) => {

    let countItems = 0;
	let countGroups = 0;
	let countUsers = 0;
	let countCategories = 0;
	let countArticle = 0;
	// let countRss = 0;
	let countContact = 0;

    await ItemsModel.count({}).then( (data) => {
		countItems = data;
	});

	await GroupsModel.count({}).then( (data) => {
		countGroups = data;
	});

	await UsersModel.count({}).then( (data) => {
		countUsers = data;
	});
	
	await CategoryModel.count({}).then( (data) => {
		countCategories = data;
	});

	await ArticleModel.count({}).then( (data) => {
		countArticle = data;
	});

	// await RssModel.count({}).then( (data) => {
	// 	countRss = data;
	// });

	await ContactModel.count({}).then( (data) => {
		countContact = data;
	});

	res.render(`${folderView}index`, { 
		pageTitle: 'THỐNG KÊ', 
		countItems,
		countGroups,
		countUsers,
		countCategories,
		countArticle,
		// countRss,
		countContact
	});
});

module.exports = router;
