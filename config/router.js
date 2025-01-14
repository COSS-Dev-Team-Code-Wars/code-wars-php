'use strict';

const $        = require(__dirname + '/../lib/session');
const importer = require('anytv-node-importer');


module.exports = (router) => {

    const __ = importer.dirloadSync(__dirname + '/../controllers');

    router.del = router.delete;

    //     method router                    session         controller

    // login page
    router.post ('/login',                                  __.auth.login);

    // logged in user's page
    router.post ('/logout',                 $,              __.auth.logout);

    // for team and judge
    router.get  ('/submissions',            $,              __.submission.get_all);

    // for team
    router.post ('/submit/:id',             $('team'),      __.submission.submit);

    // for judges
    router.get  ('/preview/:id/:file',      $('judge'),     __.submission.preview);
    router.get  ('/take_over/:id',          $('judge'),     __.submission.take_over);
    router.post ('/evaluate/:id',           $('judge'),     __.submission.evaluate);

    // for getting all problems
    router.get  ('/problems',               $,              __.problems.get_all);

    // for admin
    router.get  ('/scores',                 $('admin'),     __.user.get_scores);
    router.get  ('/users',                  $('admin'),     __.user.get_all);
    router.post ('/user/create',            $('admin'),     __.user.create_user);
    router.post ('/user/delete',            $('admin'),     __.user.delete_user);
    router.post ('/user/change_password',   $('admin'),     __.user.change_password);


    router.all('*', (req, res) => {
        res.status(404)
            .send({message: 'Nothing to do here.'});
    });

    return router;
};
