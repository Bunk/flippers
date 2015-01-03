'use strict';

angular.module('flippersApp')
    .service('Help', function($cookieStore) {

        function getSettings() {
            return $cookieStore.get('help') || {};
        }

        function storeSettings(settings) {
            $cookieStore.put('help', settings);
        }

        function getValue(key) {
            var settings = getSettings();
            if (settings[key] !== undefined) {
                return settings[key];
            }

            // Default to showing help
            return true;
        }

        function setValue(key, value) {
            var settings = getSettings();
            settings[key] = value;
            storeSettings(settings);
        }

        return {
            clear: function() {
                $cookieStore.remove('help');
            },
            shouldShow: function(key, value) {
                if (value === undefined) {
                    return getValue(key);
                } else {
                    setValue(key, value);
                    return value;
                }
            }
        };
    });
