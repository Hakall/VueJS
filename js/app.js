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
        'user': Object,
        'currentmethod': String
    },
    template: '<div>' +
        '<div class="section" v-for="method in methods" v-show="method.activate && currentmethod==method.name">' +
        '<h5>{{method.name}}</h5>' +
        '</div>' +
        '<div class="divider"></div>'+
        '<div class="section" v-show="methods[currentmethod].transports.length>0 && currentmethod!==\'push\' " >'+
        '<h5>Transports</h5>'+
        '<div v-if="user.transports.sms">'+
        'Sms : {{user.transports.sms}}'+
        '</div>'+
        '<div v-if="user.transports.mail">'+
        'Mail : {{user.transports.mail}}'+
        '</div>'+
        '</div>'+
        '</div>'
});

var ManagerDashboard = Vue.extend({
    props: {
        'methods': Object,
        'uids': Array,
    },
    template: '<div>ManagerDashboard!</div>'
});

var AdminDashboard = Vue.extend({
    props: {
        'methods': Object
    },
    template: '<div><div class="section" v-for="method in methods">' +
        '<h5>{{method.name}}</h5>' +
        '<div class="divider"></div></div></div>'
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
        methods: {},
        user: {
            uid: '',
            methods: {},
            transports: {}
        },
        uids: []
    },
    created: function() {
        this.getUser();
        this.getMethods();
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
            if (event.target.name == "manager") this.getUsers();
        },

        getUsers: function() {
            $.ajax({
                url: "/data/users.json",
                dataType: 'json',
                cache: false,
                success: function(data) {
                    this.setUsers(data);
                }.bind(this),
                error: function(xhr, status, err) {
                    console.error("/data/users.json", status, err.toString());
                }.bind(this)
            });
        },

        setUsers: function(data) {
            this.uids = data.uids;
        },

        getUser: function() {
            $.ajax({
                url: "/data/user.json",
                dataType: 'json',
                cache: false,
                success: function(data) {
                    this.setUser(data);
                }.bind(this),
                error: function(xhr, status, err) {
                    console.error("/data/user.json", status, err.toString());
                }.bind(this)
            });
        },

        setUser: function(data) {
            this.user.uid = data.uid;
            this.user.methods = data.user.methods;
            this.user.transports = data.user.transports;
        },

        getMethods: function() {
            $.ajax({
                url: "/data/methods.json",
                dataType: 'json',
                cache: false,
                success: function(data) {
                    this.setMethods(data);
                }.bind(this),
                error: function(xhr, status, err) {
                    console.error("/data/methods.json", status, err.toString());
                }.bind(this)
            });
        },

        setMethods: function(data) {
            this.methods = data.methods;
            this.cleanMethods();
        },
    }
})
