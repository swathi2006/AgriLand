// middleware.js
const checkAuth = (req, res, next) => {
    if (req.session && req.session.user) {
        next(); // allow access
    } else {
        // If user not logged in, redirect to login
        res.redirect("/login?alert=1");
    }
};


module.exports = checkAuth;
