var express = require('express');
var router = express.Router();

const folderView = __path_views_blog + 'pages/post/';
const layoutBlog = __path_views_blog + 'frontend';
/* GET dashboard page. */
router.get('/', async (req, res, next) => {
  res.render(`${folderView}index`, {
    layout: layoutBlog
  });
});

module.exports = router;
