const credential = {
  username: "admin123",
  password: "admin123",
};

// admin login page get method
const getAdminLogin = (req, res, next) => {
  try {
    if (req.session.err) {
      const error = req.session.err;
      res.render("admin_signin", { title: "admin signin", error });
      delete req.session.err;
    }
    if (req.session.isAdmin) {
      res.redirect("/admin_dashboard");
    }
    res.render("admin_signin", { title: "admin signin" });
  } catch (err) {
    next("error");
    console.error(err.message);
  }
};

// admin login post method
// eslint-disable-next-line consistent-return
const AdminLoginLoginvalidation = (req, res, next) => {
  try {
    if (
      req.body.username === credential.username
      && req.body.password === credential.password
    ) {
      const adminData = {
        username: req.body.username,
        adminLogin: true,
      };
      req.session.adminData = adminData;
      console.log(req.session);
      return res.redirect("/admin_dashboard");
    }
    req.session.err = "Username or password is incorrect";
    return res.redirect("/admin_signin");
  } catch (err) {
    next("error");
    console.log(err.message);
  }
};
module.exports = {
  getAdminLogin,
  AdminLoginLoginvalidation,
};
