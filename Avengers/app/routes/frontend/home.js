var express = require('express');
var router = express.Router();

const articleModel = require(__path_models + 'article');
const documentModel = require(__path_models + 'documents');
const categoryModel = require(__path_models + 'category');

const folderView = __path_views_blog + 'pages/home/';
const layoutBlog = __path_views_blog + 'frontend';

const paramsHelpers = require(__path_helpers + 'params');
/* GET dashboard page. */
router.get('/', async (req, res, next) => {
  
  let itemsSpecial = [];
  let itemsNews = [];
  let itemsCategory = [];
  let itemsDocument = [];
  let itemsRandom = [];

  let itemsPopular = [];

  await articleModel.listItemsFrontend(null,{task: 'items-special'}).then((items) => {
    itemsSpecial = items;
  });

  await articleModel.listItemsFrontend(null, {task: 'items-news'}).then((items) => {
    itemsNews = items;
  });

  await categoryModel.listItemsFrontend(null, {task: 'items-in-menu'}).then((items) => {
    itemsCategory = items;
  });

  await documentModel.listItemsFrontend(null, {task: 'items-in-menu'}).then((items) => {
    itemsDocument = items;
  });

  await articleModel.listItemsFrontend(null, {task: 'items-random'}).then((items) => {
    itemsRandom = items;
  });

  await articleModel.listItemsFrontend(null, {task: 'items-popular'}).then((items) => {
    itemsPopular = items;
    //đây á an giao dien
  });

  res.render(`${folderView}index`, {
    layout: layoutBlog,
    top_post: true,
    itemsCategory,
    itemsDocument,
    itemsSpecial,
    itemsNews,
    itemsRandom,
    itemsPopular
  });
});

module.exports = router;
