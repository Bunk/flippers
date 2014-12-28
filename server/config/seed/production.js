/**
 * Populate DB with sample data on server start
 * This script is smart enough to only load data when necessary.
 * It will not scorch the earth.
 */

'use strict';

var User = require('../../api/user/user.model');

User.findOne({
    role: 'admin'
}, function(err, value) {
    if (!value) {
        console.log(
            'No administrator detected.  Creating the default administrator.'
        );
        User.create({
            provider: 'local',
            role: 'admin',
            name: 'Administrator',
            email: 'admin@flippers.com',
            password: 'admin'
        }, function() {
            console.log(
                'Successfully created the default administrator.  U: admin@flippers.com, P: admin'
            );
        });
    }
});
