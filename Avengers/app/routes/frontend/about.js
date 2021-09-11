var express = require('express');
var router = express.Router();

const articleModel = require(__path_models + 'article');
const categoryModel = require(__path_models + 'category');

const folderView = __path_views_blog + 'pages/about/';
const layoutBlog = __path_views_blog + 'frontend';
/* GET about page. */
router.get('/', async (req, res, next) => {
  let itemsCategory = [];
  let itemsRandom = [];

  await categoryModel.listItemsFrontend(null, {task: 'items-in-menu'}).then((items) => {
    itemsCategory = items;
  });

  await articleModel.listItemsFrontend(null, {task: 'items-random'}).then((items) => {
    itemsRandom = items;
  });

  res.render(`${folderView}index`, {
    layout: layoutBlog,
    top_post: false,
    itemsCategory,
    // itemsRandom
  });
});

module.exports = router;
