// Renders the home page
exports.show_home = function (req, res) {
    req.responder.render(req, res, 'home', {});
};
