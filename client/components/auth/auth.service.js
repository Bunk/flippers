'use strict';

angular.module('flippersApp')
    .factory('Auth', function Auth($q, $cookieStore, $location, $rootScope, $http, User) {
        var currentUser = {};
        if ($cookieStore.get('token')) {
            User.current(function(me) {
                currentUser = me;
            });
        }

        return {

            /**
             * Authenticate user and save token
             *
             * @param  {Object}   user     - login info
             * @param  {Function} callback - optional
             * @return {Promise}
             */
            login: function(user, callback) {
                var cb = callback || angular.noop;
                var deferred = $q.defer();

                $http.post('/auth/local', {
                    email: user.email,
                    password: user.password
                }).
                success(function(data) {
                    $cookieStore.put('token', data.token);
                    User.current(function(me) {
                        currentUser = me;

                        deferred.resolve(data);

                        return cb();
                    });
                }).
                error(function(err) {
                    this.logout();
                    deferred.reject(err);
                    return cb(err);
                }.bind(this));

                return deferred.promise;
            },

            /**
             * Delete access token and user info
             *
             * @param  {Function}
             */
            logout: function() {
                $cookieStore.remove('token');
                currentUser = {};
            },

            /**
             * Create a new user
             *
             * @param  {Object}   user     - user info
             * @param  {Function} callback - optional
             * @return {Promise}
             */
            createUser: function(user) {
                return User.post(user)

                .then(function success(data) {
                    $cookieStore.put('token', data.token);
                    User.current(function(me) {
                        currentUser = me;
                    });
                })

                .catch(function(err) {
                    this.logout();
                    throw err;
                }.bind(this));
            },

            /**
             * Change password
             *
             * @param  {String}   oldPassword
             * @param  {String}   newPassword
             * @param  {Function} callback    - optional
             * @return {Promise}
             */
            changePassword: function(oldPassword, newPassword, callback) {
                var cb = callback || angular.noop;

                return User.changePassword({
                    id: currentUser._id
                }, {
                    oldPassword: oldPassword,
                    newPassword: newPassword
                }, function(user) {
                    return cb(user);
                }, function(err) {
                    return cb(err);
                }).$promise;
            },

            /**
             * Gets all available info on authenticated user
             *
             * @return {Object} user
             */
            getCurrentUser: function() {
                return currentUser;
            },

            /**
             * Check if a user is logged in
             *
             * @return {Boolean}
             */
            isLoggedIn: function() {
                return currentUser.hasOwnProperty('role');
            },

            /**
             * Waits for currentUser to resolve before checking if user is logged in
             */
            isLoggedInAsync: function(cb) {
                if (currentUser.hasOwnProperty('$promise')) {
                    currentUser.$promise.then(function() {
                        cb(true);
                    }).catch(function() {
                        cb(false);
                    });
                } else if (currentUser.hasOwnProperty('role')) {
                    cb(true);
                } else {
                    cb(false);
                }
            },

            /**
             * Check if a user is an admin
             *
             * @return {Boolean}
             */
            isAdmin: function() {
                return currentUser.role === 'admin';
            },

            /**
             * Check if a user is a viewer
             *
             * @return {Boolean}
             */
            isViewer: function() {
                return currentUser.role === 'viewer' ||
                    currentUser.role === 'admin';
            },

            /**
             * Get auth token
             */
            getToken: function() {
                return $cookieStore.get('token');
            }
        };
    });
