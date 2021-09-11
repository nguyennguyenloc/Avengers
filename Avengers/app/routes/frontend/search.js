var express = require('express');
var router = express.Router();

// const contactConfig  = require(__path_configs + 'contact');
const paramsHelpers = require(__path_helpers + 'params');
const articleModel = require(__path_models + 'article');
const categoryModel = require(__path_models + 'category');

const folderView = __path_views_blog + 'pages/search/';
const layoutBlog = __path_views_blog + 'frontend';

/* GET home page. */
router.get('/', async (req, res, next) => {
  let params 		 	 = paramsHelpers.createParam(req);
  let itemsSearch = null;
  let itemsCategory = [];
//   let contact = contactConfig;
  await articleModel.listItemsSearch(params).then((items) => {itemsSearch = items});

  await categoryModel.listItemsFrontend(null, {task: 'items-in-menu'}).then((items) => {
    itemsCategory = items;
  });
  res.render(`${folderView}index`, {
    layout:layoutBlog,
    top_post:false,
    itemsSearch,
    params,
    // contact,
    pageTitle:'Tin tức',
    // titleCategory:false,
    // titleArticle:false,
    itemsCategory
  });
});


module.exports = router;
