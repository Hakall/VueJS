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

var PushMethod = Vue.extend({
    props: {
        'user': Object,
        'messages': Object,
    },
    template: '#push-method'
});

var BypassMethod = Vue.extend({
    props: {
        'user': Object,
        'messages': Object,
    },
    template: '#bypass-method'
});

var TotpMethod = Vue.extend({
    props: {
        'user': Object,
        'generatetotp': Function,
        'messages': Object,
    },
    template: '#totp-method'
});

var RandomCodeMethod = Vue.extend({
    props: {
        'user': Object,
        'messages': Object,
    },
    template: '#random_code-method'
});

var UserDashboard = Vue.extend({
    props: {
        'messages': Object,
        'methods': Object,
        'user': Object,
        'currentmethod': String
    },
    components: {
        "push": PushMethod,
        "totp": TotpMethod,
        "bypass": BypassMethod,
        "random_code": RandomCodeMethod
    },
    template: "#user-dashboard",
    methods: {
        activate: function(event) {
            switch (event.target.name) {
                case 'push':
                    this.activatePush();
                    break;
                case 'bypass':
                    this.activateBypass();
                    break;
                case 'random_code':
                    this.activateRandomCode();
                    break;
                case 'totp':
                    this.activateTotp();
                    break;
                default:
                    /** **/
                    this.user.methods[event.target.name].active = true;
                    break;
            }
        },
        activatePush: function() {
            console.log("activatePush");
            //ajax
        },
        activateBypass: function() {
            console.log("activateBypass");
            this.user.methods.bypass.active = true;
            this.generateBypass(function() {
                this.user.methods.bypass.active = false;
            })
        },
        activateTotp: function() {
            console.log("activateTotp");
            this.user.methods.totp.active = true;
            this.generateTotp(function() {
                this.user.methods.totp.active = false;
            })
        },
        activateRandomCode: function() {
            console.log("activateRandomCode");
            this.user.methods.random_code.active = true;
            $.ajax({
                url: "/data/activate.json",
                dataType: 'json',
                cache: false,
                success: function(data) {
                    if (data.code != "Ok") this.user.methods.random_code.active = false;
                }.bind(this),
                error: function(xhr, status, err) {
                    if (data.code != "Ok") this.user.methods.random_code.active = false;
                    console.error("/data/activate.json", status, err.toString());
                }.bind(this)
            });
        },
        deactivate: function(event) {
            console.log("deactivate " + event.target.name);
            this.user.methods[event.target.name].active = false;
            $.ajax({
                url: "/data/deactivate.json",
                dataType: 'json',
                cache: false,
                success: function(data) {
                    if (data.code != "Ok") this.user.methods[event.target.name].active = true;
                }.bind(this),
                error: function(xhr, status, err) {
                    this.user.methods[event.target.name].active = true;
                    console.error("/data/deactivate.json", status, err.toString());
                }.bind(this)
            });
        },
        generateBypass: function(onError) {
            $.ajax({
                url: "/data/bypass-secret.json",
                dataType: 'json',
                cache: false,
                success: function(data) {
                    if (data.code == "Ok") this.user.methods.bypass.codes = data.codes;
                    else if (typeof(onError) === "function") onError();
                }.bind(this),
                error: function(xhr, status, err) {
                    if (typeof(onError) === "function") onError();
                    console.error("/data/bypass-secret.json", status, err.toString());
                }.bind(this)
            });
        },
        generateTotp: function(onError) {
            $.ajax({
                url: "/data/totp-secret.json",
                dataType: 'json',
                cache: false,
                success: function(data) {
                    if (data.code == "Ok"){
                        this.user.methods.totp.message = data.message;
                        this.user.methods.totp.qrCode = data.qrCode;
                        this.user.methods.totp.uid = data.uid;
                    }
                    else if (typeof(onError) === "function") onError();
                }.bind(this),
                error: function(xhr, status, err) {
                    if (typeof(onError) === "function") onError();
                    console.error("/data/totp-secret.json", status, err.toString());
                }.bind(this)
            });
        },
    }
});

var ManagerDashboard = Vue.extend({
    props: {
        'methods': Object,
        'messages': Object,
        'uids': Array,
    },
    template: '#manager-dashboard'
});

var AdminDashboard = Vue.extend({
    props: {
        'messages': Object,
        'methods': Object
    },
    template: '#admin-dashboard'
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
        uids: [],
        messages: {}
    },
    created: function() {
        this.getMessages();
        this.getUser();
        this.getMethods();
    },
    methods: {
        cleanMethods: function() {
            for (method in this.methods) {
                if (method[0] == '_') delete this.methods[method];
                else {
                    this.methods[method].name = method;
                    if (this.messages.api) {
                        if (this.messages.api.methods[method]) this.methods[method].label = this.messages.api.methods[method].name;
                    }
                }
            }

        },

        navigate: function(event) {
            if (event.target.name == "manager") {
                this.getUsers();
                this.currentView = 'manager-dashboard';
            } else if (event.target.name == "admin") this.currentView = 'admin-dashboard';
            else {
                this.currentMethod = event.target.name;
                this.currentView = 'user-dashboard';
            }
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
        getMessages: function() {
            $.ajax({
                url: "/data/messages.json",
                dataType: 'json',
                cache: false,
                success: function(data) {
                    this.setMessages(data);
                }.bind(this),
                error: function(xhr, status, err) {
                    console.error("/data/messages.json", status, err.toString());
                }.bind(this)
            });
        },
        setMessages: function(data) {
            this.messages = data;
            this.cleanMethods();
        }
    }
})
