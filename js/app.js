/** jQuery Initialisation **/
(function($) {
    $(function() {

        $('.button-collapse').sideNav({ 'edge': 'left' });

        $('.collapsible').collapsible({
            accordion: false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
        });

    }); // end of document ready
})(jQuery); // end of jQuery name space

/** Vue.JS **/

var UserDashboard = Vue.extend({
    props: {
        'methods': Object,
        'currentmethod': String
    },
    template: '<div><div class="section" v-for="method in methods" v-show="method.activate && currentmethod==method.name">' +
        '<h5>{{method.name}}</h5>' +
        '</div></div>'
});

var ManagerDashboard = Vue.extend({
	props: {
        'methods': Object
    },
    template: '<div>ManagerDashboard!</div>'
});

var AdminDashboard = Vue.extend({
    template: '<div>AdminDashboard!</div>'
});

//Vue.component('user-dashboard', UserDashboard);

var app = new Vue({
    el: '#app',
    components: {
        "user-dashboard": UserDashboard,
        "manager-dashboard": ManagerDashboard,
        "admin-dashboard": AdminDashboard
    },
    data: {
        currentView: 'user-dashboard',
        currentMethod: '',
        methods: {
            "__v": 2,
            "_id": "57986fd12f531283395da163",
            "push": {
                "serverKey": "AIzaSyAVz-ebB4QQYvqRnZVf3i7ZxQn8ZBWxNeM",
                "activate": true,
                "transports": ["push"]
            },
            "bypass": {
                "activate": true,
                "codes_number": 10,
                "code_type": "digit",
                "code_length": 6,
                "transports": []
            },
            "random_code": {
                "activate": false,
                "code_length": 6,
                "code_type": "digit",
                "mail_validity": 30,
                "sms_validity": 15,
                "transports": ["mail", "sms"]
            },
            "totp": {
                "activate": false,
                "app_window": 2,
                "default_window": 2,
                "mail_window": 15,
                "sms_window": 6,
                "transports": ["sms"]
            }
        }
    },
    created: function() {
        this.cleanMethods();
    },
    methods: {
        cleanMethods: function() {
            for (method in this.methods) {
                if (method[0] == '_') delete this.methods[method];
                else this.methods[method].name = method;
            }
        },
        navigate: function(event) {
            this.currentMethod = event.target.text;
            this.currentView = event.target.name + '-dashboard';
        }
    }
})
