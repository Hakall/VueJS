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

/** User **/
var PushMethod = Vue.extend({
    props: {
        'user': Object,
        'activate_push': Function,
        'messages': Object,
    },
    template: '#push-method'
});

var BypassMethod = Vue.extend({
    props: {
        'user': Object,
        'generate_bypass': Function,
        'messages': Object,
    },
    template: '#bypass-method'
});

var TotpMethod = Vue.extend({
    props: {
        'user': Object,
        'generate_totp': Function,
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
                    this.askPushActivation(event);
                    break;
                case 'bypass':
                    this.activateBypass(event);
                    break;
                case 'random_code':
                    this.activateRandomCode(event);
                    break;
                case 'totp':
                    this.activateTotp(event);
                    break;
                default:
                    /** **/
                    event.target.checked = true;
                    this.user.methods[event.target.name].active = true;
                    break;
            }
        },
        activatePush: function(event) {
            console.log("activatePush");
            //ajax
            $.ajax({
                url: "/data/push-infos.json",
                dataType: 'json',
                cache: false,
                success: function(data) {
                    if (data.code == "Ok") {
                        event.target.checked = true;
                        this.user.methods.push.active = true;
                        this.user.methods.push.device.manufacturer = data.device.manufacturer;
                        this.user.methods.push.device.model = data.device.model;
                        this.user.methods.push.device.platform = data.device.platform;
                    }
                }.bind(this),
                error: function(xhr, status, err) {
                    event.target.checked = false;
                    this.user.methods.push.active = false;
                    console.error("/data/push-infos.json", status, err.toString());
                }.bind(this)
            });
        },
        askPushActivation: function(event) {
            console.log("askPushActivation");
            event.target.checked = false;
            this.user.methods.push.active = false;
            //ajax
            $.ajax({
                url: "/data/push-activation.json",
                dataType: 'json',
                cache: false,
                success: function(data) {
                    if (data.code == "Ok") {
                        this.user.methods.push.activationCode = data.activationCode;
                        this.user.methods.push.qrCode = data.qrCode;
                        this.user.methods.push.api_url = data.api_url;
                    }
                }.bind(this),
                error: function(xhr, status, err) {
                    console.error("/data/push-activation.json", status, err.toString());
                }.bind(this)
            });
        },
        activateBypass: function(event) {
            this.user.methods.bypass.active = true;
            event.target.checked = true;
            this.generateBypass(function() {
                this.user.methods.bypass.active = false;
                event.target.checked = false;
            })
        },
        activateTotp: function(event) {
            this.user.methods.totp.active = true;
            event.target.checked = true;
            this.generateTotp(function() {
                this.user.methods.totp.active = false;
                event.target.checked = false;
            })
        },
        activateRandomCode: function(event) {
            this.user.methods.random_code.active = true;
            event.target.checked = true;
            $.ajax({
                url: "/data/activate.json",
                dataType: 'json',
                cache: false,
                success: function(data) {
                    if (data.code != "Ok") {
                        this.user.methods.random_code.active = false;
                        event.target.checked = false;
                    }
                }.bind(this),
                error: function(xhr, status, err) {
                    this.user.methods.random_code.active = false;
                    event.target.checked = false;
                    console.error("/data/activate.json", status, err.toString());
                }.bind(this)
            });
        },
        deactivate: function(event) {
            console.log("deactivate " + event.target.name);
            event.target.checked = false;
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
                    event.target.checked = true;
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
                    if (data.code == "Ok") {
                        this.user.methods.totp.message = data.message;
                        this.user.methods.totp.qrCode = data.qrCode;
                        this.user.methods.totp.uid = data.uid;
                    } else if (typeof(onError) === "function") onError();
                }.bind(this),
                error: function(xhr, status, err) {
                    if (typeof(onError) === "function") onError();
                    console.error("/data/totp-secret.json", status, err.toString());
                }.bind(this)
            });
        },
    }
});

/** Manager **/
var UserView = Vue.extend({
    props: {
        'user': Object,
        'methods': Object,
        'messages': Object
    },
    components: {
        "push": PushMethod,
        "totp": TotpMethod,
        "bypass": BypassMethod,
        "random_code": RandomCodeMethod
    },
    template: '#user-view',
    methods: {
        activate: function(event) {
            switch (event.target.name) {
                case 'push':
                    this.askPushActivation(event);
                    break;
                case 'bypass':
                    this.activateBypass(event);
                    break;
                case 'random_code':
                    this.activateRandomCode(event);
                    break;
                case 'totp':
                    this.activateTotp(event);
                    break;
                default:
                    /** **/
                    event.target.checked = true;
                    this.user.methods[event.target.name].active = true;
                    break;
            }
        },
        activatePush: function(event) {
            console.log("activatePush");
            //ajax
            $.ajax({
                url: "/data/push-infos.json",
                dataType: 'json',
                cache: false,
                success: function(data) {
                    if (data.code == "Ok") {
                        event.target.checked = true;
                        this.user.methods.push.active = true;
                        this.user.methods.push.device.manufacturer = data.device.manufacturer;
                        this.user.methods.push.device.model = data.device.model;
                        this.user.methods.push.device.platform = data.device.platform;
                    }
                }.bind(this),
                error: function(xhr, status, err) {
                    event.target.checked = false;
                    this.user.methods.push.active = false;
                    console.error("/data/push-infos.json", status, err.toString());
                }.bind(this)
            });
        },
        askPushActivation: function(event) {
            console.log("askPushActivation");
            event.target.checked = false;
            this.user.methods.push.active = false;
            //ajax
            $.ajax({
                url: "/data/push-activation.json",
                dataType: 'json',
                cache: false,
                success: function(data) {
                    if (data.code == "Ok") {
                        this.user.methods.push.activationCode = data.activationCode;
                        this.user.methods.push.qrCode = data.qrCode;
                        this.user.methods.push.api_url = data.api_url;
                    }
                }.bind(this),
                error: function(xhr, status, err) {
                    console.error("/data/push-activation.json", status, err.toString());
                }.bind(this)
            });
        },
        activateBypass: function(event) {
            this.user.methods.bypass.active = true;
            event.target.checked = true;
            this.generateBypass(function() {
                this.user.methods.bypass.active = false;
                event.target.checked = false;
            })
        },
        activateTotp: function(event) {
            this.user.methods.totp.active = true;
            event.target.checked = true;
            this.generateTotp(function() {
                this.user.methods.totp.active = false;
                event.target.checked = false;
            })
        },
        activateRandomCode: function(event) {
            this.user.methods.random_code.active = true;
            event.target.checked = true;
            $.ajax({
                url: "/data/activate.json",
                dataType: 'json',
                cache: false,
                success: function(data) {
                    if (data.code != "Ok") {
                        this.user.methods.random_code.active = false;
                        event.target.checked = false;
                    }
                }.bind(this),
                error: function(xhr, status, err) {
                    this.user.methods.random_code.active = false;
                    event.target.checked = false;
                    console.error("/data/activate.json", status, err.toString());
                }.bind(this)
            });
        },
        deactivate: function(event) {
            console.log("deactivate " + event.target.name);
            event.target.checked = false;
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
                    event.target.checked = true;
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
                    if (data.code == "Ok") {
                        this.user.methods.totp.message = data.message;
                        this.user.methods.totp.qrCode = data.qrCode;
                        this.user.methods.totp.uid = data.uid;
                    } else if (typeof(onError) === "function") onError();
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
        'messages': Object
    },
    components: {
        "user-view": UserView
    },
    data: function() {
        return {
            suggestions: [],
            user: {
                uid: String,
                methods: Object,
                transports: Object
            },
            uids: Array,
        }
    },
    created: function() {
        this.getUsers();
    },
    methods: {
        suggest: function(event) {
            this.suggestions = [];
            if (event.target.value !== "") {
                for (uid in this.uids) {
                    if (this.uids[uid].includes(event.target.value)) this.suggestions.push(this.uids[uid]);
                }
            }
        },

        search: function(event) {
            if ($('#autocomplete-input').val() !== "" && this.suggestions.includes($('#autocomplete-input').val())) {
                this.getUser($('#autocomplete-input').val());
                $('#autocomplete-input').val('');
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

        getUser: function(uid) {
            $.ajax({
                url: "/data/alex.json",
                dataType: 'json',
                cache: false,
                success: function(data) {
                    this.setUser(data);
                }.bind(this),
                error: function(xhr, status, err) {
                    console.error("/data/alex.json", status, err.toString());
                }.bind(this)
            });
        },
        setUser: function(data) {
            this.user = {
                uid: data.uid,
                methods: data.user.methods,
                transports: data.user.transports
            }
        }
    },
    template: '#manager-dashboard'
});

/** Admin **/
var AdminDashboard = Vue.extend({
    props: {
        'messages': Object,
        'methods': Object
    },
    template: '#admin-dashboard',
    methods: {
        activate: function(event) {
            this.methods[event.target.name].activate = true;
            event.target.checked = true;
            $.ajax({
                url: "/data/activate.json",
                dataType: 'json',
                cache: false,
                success: function(data) {
                    if (data.code != "Ok") {
                        this.methods.activate = false;
                        event.target.checked = false;
                    }
                }.bind(this),
                error: function(xhr, status, err) {
                    this.methods.activate = false;
                    event.target.checked = false;
                    console.error("/data/activate.json", status, err.toString());
                }.bind(this)
            });
        },
        deactivate: function(event) {
            console.log("deactivate " + event.target.name);
            event.target.checked = false;
            this.methods[event.target.name].activate = false;
            $.ajax({
                url: "/data/deactivate.json",
                dataType: 'json',
                cache: false,
                success: function(data) {
                    if (data.code != "Ok") {
                        this.methods[event.target.name].activate = true;
                        event.target.checked = true;
                    }
                }.bind(this),
                error: function(xhr, status, err) {
                    this.methods[event.target.name].activate = true;
                    event.target.checked = true;
                    console.error("/data/deactivate.json", status, err.toString());
                }.bind(this)
            });
        },
        activateTransport: function(method, transport) {
            event.target.checked = true;
            $.ajax({
                url: "/data/activate.json",
                dataType: 'json',
                cache: false,
                success: function(data) {
                    if (data.code != "Ok") {
                        event.target.checked = false;
                    } else {
                        this.methods[method].transports.push(transport);
                    }
                }.bind(this),
                error: function(xhr, status, err) {
                    event.target.checked = false;
                    console.error("/data/activate.json", status, err.toString());
                }.bind(this)
            });
        },
        deactivateTransport: function(method, transport) {
            event.target.checked = false;
            $.ajax({
                url: "/data/deactivate.json",
                dataType: 'json',
                cache: false,
                success: function(data) {
                    if (data.code != "Ok") {
                        event.target.checked = true;
                    } else {
                        var index = this.methods[method].transports.indexOf(transport);
                        if (index > (-1)) this.methods[method].transports.splice(index, 1);
                    }
                }.bind(this),
                error: function(xhr, status, err) {
                    event.target.checked = true;
                    console.error("/data/deactivate.json", status, err.toString());
                }.bind(this)
            });
        },
    }
});

/** Admin **/
var Home = Vue.extend({
    props: {
        messages: Object
    },
    template: '#home-dashboard'
});

/** Main **/
var app = new Vue({
    el: '#app',
    components: {
        "home": Home,
        "user-dashboard": UserDashboard,
        "manager-dashboard": ManagerDashboard,
        "admin-dashboard": AdminDashboard
    },
    data: {
        pageTitle: 'Accueil',
        currentView: 'home',
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
                this.pageTitle = event.target.text;
                this.currentView = 'manager-dashboard';
            } else if (event.target.name == "admin") {
                this.currentView = 'admin-dashboard';
                this.pageTitle = event.target.text;
            } else if (event.target.name == "home") {
                this.currentView = 'home';
                this.pageTitle = event.target.text;
            } else {
                this.pageTitle = "Préférences";
                this.currentMethod = event.target.name;
                this.currentView = 'user-dashboard';
            }
            $('a').parent().removeClass('active');
            $('#' + event.target.name).parent().addClass('active');
            if(document.getElementById("sidenav-overlay"))$('#navButton').click();
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
