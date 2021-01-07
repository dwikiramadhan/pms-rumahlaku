var express = require('express');
var router = express.Router();
const url = require('url');
const crypto = require("crypto");

module.exports = function (db) {
    router.get('/', function (req, res) {
        res.send('got it');
    });

    router.post('/login', (req, res) => {
        var { email, password } = req.body;
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
            } else {
                if (result.rows.length == 0) {
                    res.json({
                        msg: 'not_match'
                    })
                } else {
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

    router.get('/profil/:id', (req, res) => {
        const { id } = req.params;
        var sql = `SELECT * FROM member WHERE id = ${id}`;
        db.query(sql, (err, result) => {
            if (err) {
                res.json({
                    msg: err
                });
            } else {
                res.json(result.rows);
            }
        })
    })

    router.put('/profil/:id', (req, res) => {
        var { id } = req.params;
        var { nama_lengkap, jenis_kelamin, no_telp, tgl_lahir, alamat, email } = req.body;

        var sql = `UPDATE member SET nama_lengkap = '${nama_lengkap}', jenis_kelamin = '${jenis_kelamin}', no_telp = '${no_telp}', tgl_lahir = '${tgl_lahir}', alamat = '${alamat}', email = '${email}' WHERE id = ${id}`;

        db.query(sql, (err, result) => {
            if (err) {
                res.send('Gagal');
            }
            res.json({
                msg: 'Berhasil update Data'
            })
        })
    })

    router.get('/iklan', (req, res) => {
        const per_page = 3;
        const page = req.params.page || 1;
        var sql_all = `SELECT * FROM iklan ORDER BY created_date DESC`;
        db.query(sql_all, (err, result_all) => {
            if (err) { res.status(400).json({ "error": err.message }); return; }
            var sql = `SELECT * FROM iklan ORDER BY created_date DESC LIMIT 3`;
            db.query(sql, (err, result) => {
                if (err) {
                    res.send('Gagal memuat data')
                } else {
                    res.json({
                        data: result.rows,
                        current: page,
                        pages: Math.ceil(result_all.rows.length / per_page),
                        next_page: parseInt(page) + 1,
                        previous_page: parseInt(page) - 1
                    })
                }
            })
        })
    })

    router.get('/iklan/:page', (req, res) => {
        const per_page = 3;
        const page = req.params.page || 1;
        var sql_all = `SELECT * FROM iklan ORDER BY created_date DESC`;
        db.query(sql_all, (err, result_all) => {
            if (err) { res.status(400).json({ "error": err.message }); return; }
            var sql = `SELECT * FROM iklan ORDER BY created_date DESC LIMIT 3 OFFSET ${(page - 1) * per_page}`;
            db.query(sql, (err, result) => {
                if (err) {
                    res.send('Gagal memuat data')
                } else {
                    res.json({
                        data: result.rows,
                        current: page,
                        pages: Math.ceil(result_all.rows.length / per_page),
                        next_page: parseInt(page) + 1,
                        previous_page: parseInt(page) - 1
                    })
                }
            })
        })
    })

    router.get('/properties-details/:id', (req, res) => {
        var { id } = req.params;
        var sql = `SELECT * FROM iklan WHERE id_iklan = ${id}`;
        db.query(sql, (err, result) => {
            if (err) {
                res.send('Gagal memuat data iklan')
            }else{
                res.json(result.rows)
            }
        })
    })

    router.put('/changepassword/:id', (req, res) => {
        var { id } = req.params;
        var { password } = req.body;

        let myKey = crypto.createCipher("aes-128-cbc", "mypassword");
        let myStr = myKey.update(password, "utf8", "hex");
        myStr += myKey.final("hex");

        const hashPass = myStr;
        var sql = `SELECT password_hash FROM member WHERE id = ${id}`;
        db.query(sql, (err, result) => {
            if (result.rows.password_hash === hashPass) {
                var sql_update = `UPDATE member SET password_hash = '${hashPass}' WHERE id = ${id}`;
                db.query(sql_update, (err, result) => {
                    if (err) res.send('Gagal');
                    res.json({
                        msg: 'Berhasil update Password'
                    })
                })
            } else {
                res.json({
                    msg: 'Password lama Salah.'
                })
            }
        })

    })

    router.post('/iklan', (req, res) => {
        var { alamat, harga, ukuran, coordinate, deskripsi, id_member, kategori } = req.body
        var sql = `INSERT INTO iklan (alamat, harga, ukuran, coordinate, deskripsi, id_member, status, kategori, created_date) VALUES ('${alamat}', ${harga}, ${ukuran}, '${coordinate}', '${deskripsi}', ${id_member}, 0, ${kategori}, current_timestamp)`;
        console.log(req.body)
        db.query(sql, (err, result) => {
            if (err) {
                res.send('Gagal')
            } else {
                res.json({
                    msg: 'success'
                })
            }
        })
    })

    router.get('/coordinate', (req, res) => {
        var sql = "SELECT coordinate FROM iklan";
        db.query(sql, (err, result) => {
            if (err) {
                res.send('Gagal')
            } else {
                res.json({
                    data: result.rows
                })
            }
        })
    })

    router.get('/logout', (req, res) => {
        req.session.destroy(function (err) {
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