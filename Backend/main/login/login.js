exports.login =  function(req, res, patientDB, therapistDB) {
    patientDB.login(req.body.username, req.body.password, function (sucess) {
        if (sucess) {
            res.writeHead(200, {
                "Content-Type": "application/json"
            });
            res.end(JSON.stringify({
                token: sucess
            }));
        } else {
            therapistDB.login(req.body.username, req.body.password, function (sucess) {
                if (sucess) {
                    res.writeHead(200, {
                        "Content-Type": "application/json"
                    });
                    res.end(JSON.stringify({
                        token: sucess
                    }));
                } else {
                    res.writeHead(403, {
                        "Content-Type": "application/json"
                    });
                    res.end(JSON.stringify({
                        error: "Invalid password"
                    }));
                }
            });
        }
    });
}

exports.show_login =  function(req, res) {
    res.render('login');
}