var express = require('express');
var router = express.Router();

const paramsHelpers = require(__path_helpers + 'params');
const articleModel = require(__path_models + 'documents');
const categoryModel = require(__path_models + 'category');

const folderView = __path_views_blog + 'pages/documents/';
const layoutBlog = __path_views_blog + 'frontend';
/* GET dashboard page. */
router.get('/:id', async (req, res, next) => {
  let idCategory = paramsHelpers.getParams(req.params, 'id', '');
  let itemsCategory = [];
  let itemsInCategory = [];
  let itemsRandom = [];
  
  await categoryModel.listItemsFrontend(null, {task: 'items-in-menu'}).then((items) => {
    itemsCategory = items;
  });

  await articleModel.listItemsFrontend({id: idCategory}, {task: 'items-in-category'}).then((items) => {
    itemsInCategory = items;
  });

  await articleModel.listItemsFrontend(null, {task: 'items-random'}).then((items) => {
    itemsRandom = items;
  }); 

  res.render(`${folderView}index`, {
    layout: layoutBlog,
    top_post: false,
    itemsCategory,
    itemsInCategory,
  });
});

module.exports = router;
