/*
 * GET editor page.
 */

exports.show = function(req, res){
  res.render('editor', { title: 'GentrificaTO' });
};