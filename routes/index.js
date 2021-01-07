var express = require('express');
var router = express.Router();
const Swal = require('sweetalert2');
var session = require('express-session');
var moment = require('moment');

module.exports = function (db) {
  /* GET home page. */
  router.get('/', function (req, res, next) {
    console.log(req.session.user)
    res.render('pages/index', {
      title: 'Express',
      user: req.session.user,
      isLogin: req.session.loggedIn
    });
  });

  router.get('/register', function (req, res, next) {
    res.render('pages/register', {
      title: 'Express',
      user: req.session.user,
      isLogin: req.session.loggedIn
    });
  });

  router.get('/add_ads', function (req, res, next) {
    res.render('pages/add_ads', {
      title: 'Tambah Iklan',
      user: req.session.user,
      isLogin: req.session.loggedIn

    });
  });

  router.get('/profil', function (req, res, next) {
    res.render('pages/profil', {
      title: 'Profil',
      user: req.session.user,
      isLogin: req.session.loggedIn

    });
  });

  router.get('/properties-details/:id', function (req, res, next) {
    const id = req.params.id
    console.log(id)
    res.render('pages/properties_details', {
      title: 'Properties Details',
      user: req.session.user,
      isLogin: req.session.loggedIn,
      id: id
    })
  })

  return router
};

