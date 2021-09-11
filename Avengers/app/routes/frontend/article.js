var express = require('express');
var router = express.Router();

const paramsHelpers = require(__path_helpers + 'params');
const articleModel = require(__path_models + 'article');
const categoryModel = require(__path_models + 'category');
// const itemsSearch;

const folderView = __path_views_blog + 'pages/article/';
const layoutBlog = __path_views_blog + 'frontend';
/* GET article item */
router.get('/:id', async (req, res, next) => {
  let idArticle = paramsHelpers.getParams(req.params, 'id', '');
  let itemArticle = {};
  let itemsCategory = [];
  let itemsOthers = [];
  let itemsRandom = [];
  // let itemsSearch = [];

  await categoryModel.listItemsFrontend(null, {task: 'items-in-menu'}).then((items) => {
    itemsCategory = items;
  });

  await articleModel.getItemsFrontend(idArticle, null).then((items) => {
    itemArticle = items;
  });
  
  await articleModel.listItemsFrontend(null, {task: 'items-random'}).then((items) => {
    itemsRandom = items;
  });
  
  
  await articleModel.listItemsFrontend(itemArticle, {task: 'items-others'}).then((items) => {
    itemsOthers = items;
  });
  console.log("dddddd");

  console.log(itemArticle);
  res.render(`${folderView}index`, {
    layout: layoutBlog,
    top_post: false,
    itemsCategory,
    itemArticle,
    itemsOthers,
    itemsRandom 
  });
});

module.exports = router;
