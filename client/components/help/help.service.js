'use strict';

angular.module('flippersApp')
    .service('Help', function($cookieStore) {

        function getSettings() {
            return $cookieStore.get('help') || {};
        }

        function storeSettings(settings) {
            $cookieStore.put('help', settings);
        }

        return {
            clear: function() {
                $cookieStore.remove('help');
            },
            showHelp: function(key) {
                var settings = getSettings();
                if (settings[key] !== undefined) {
                    return settings[key];
                }

                // Default to showing help
                return true;
            },
            hideHelp: function(key) {
                var settings = getSettings();
                settings[key] = false;
                storeSettings(settings);
            }
        }
    });
