var express = require('express');
var router = express.Router();
const url = require('url');
const crypto = require("crypto");

module.exports = function (db) {
    router.get('/', function (req, res) {
        res.send('got it');
    });

    router.post('/login', (req, res) => {
        var {email, password} = req.body;
        let myKey = crypto.createCipher("aes-128-cbc", "mypassword");
        let myStr = myKey.update(password, "utf8", "hex");
        myStr += myKey.final("hex");

        const hashPass = myStr;

        var sql = `SELECT * FROM member WHERE email = '${email}' AND password_hash = '${hashPass}'`;

        db.query(sql, (err, result) => {
            if (err) {
                res.json({
                    msg: err
                });
            }else{
                if (result.rows.length == 0) {
                    res.json({
                        msg: 'not_match'
                    })
                }else{
                    const user = result.rows[0];
                    req.session.user = user;
                    req.session.loggedIn = true;
                    res.json({
                        msg: 'logged_in',
                        session: req.session.user
                    })
                }
            }
        })
    })

    router.get('/logout', (req, res) => {
        req.session.destroy(function(err){
            res.json({
                msg: 'success'
            })
        })
    })

    router.post('/register', (req, res) => {
        var { nama_lengkap, jenis_kelamin, no_telp, tgl_lahir, alamat, email, password_member } = req.body;

        var sql = `SELECT * FROM member WHERE email = '${email}'`;

        let myKey = crypto.createCipher("aes-128-cbc", "mypassword");
        let myStr = myKey.update(password_member, "utf8", "hex");
        myStr += myKey.final("hex");

        const hashPass = myStr;

        db.query(sql, (err, result) => {
            if (err) {
                res.send('Gagal');
            } else {
                if (result.rows.length > 0) {
                    res.json({
                        data: result.rows.length,
                        msg: 'emailexist'
                    });
                } else {
                    var sql_insert = `INSERT INTO member (nama_lengkap, jenis_kelamin, tgl_lahir, alamat, no_telp, email, password_hash, date_created) VALUES ('${nama_lengkap}', '${jenis_kelamin}', '${tgl_lahir}', '${alamat}', '${no_telp}', '${email}', '${hashPass}', current_timestamp)`;
                    db.query(sql_insert, (err, result) => {
                        if (err) {
                            res.json({
                                msg: 'insertfailed'
                            })
                        } else {
                            res.json({
                                msg: 'success'
                            });
                        }
                    })
                }
            }
        })
    });

    return router;
}