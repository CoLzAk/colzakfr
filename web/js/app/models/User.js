App.module("UserModule", function(UserModule, App, Backbone, Marionette, $, _){

    User = Backbone.Model.extend({
        urlRoot: function() {
            return 'http://colzakfr.dev/app_dev.php/api/users/' + this.username + '/';
        },

        initialize: function(model, options) {
            this.username = options.username;
        }
    });
});