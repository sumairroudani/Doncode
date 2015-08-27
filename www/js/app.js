// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'angular-md5' , 'ngCordova'])

.run(function($rootScope,$ionicPlatform,$ionicModal,$window,dataFactory,$cordovaDevice) {

  document.addEventListener("deviceready", function () {

    $rootScope.device = $cordovaDevice.getDevice();
    console.log("Dev:",$rootScope.device);

  }, false);

  $rootScope.Donor = {
  }

  $rootScope.updateProf = function(){
    profchk = null;
    dataFactory._loading(true);
    dataFactory.service('POST',"http://app.octantapp.com/api/donor_dg",{donor_id:App_Session.donor_id}).
    then(function(res){
      console.log('prof',res.data);
      rem = API.storage.get('remember');
      if(rem)
        res.data.Users.remember = true;
      API.storage.set('userProf',res.data.Users);
      console.log(res.data);

    },function(res){
      console.log(res);
    }).
    finally(function(){
      dataFactory._loading(false);
    });
  }

  $rootScope.updateSession= function(){

      App_Session = {
        donor_id    : API.storage.get('donorId'),
        donor_name  : API.storage.get('donorName'),
        donor_image : API.storage.get('donorImage'),
        donor_image : API.storage.get('remember'),
        remember    : false
      }

    $rootScope.Donor = {
      _name: App_Session.donor_name,
      _image: App_Session.donor_image
    }
  }

  $rootScope.$on('loading.show',function(){
    $ionicLoading.show({
      template: '<ion-spinner icon="lines"></ion-spinner>'
    });
  });

  $rootScope.$on('loading.hide',function(){
    $ionicLoading.hide();
  });

  // Open the login modal
  $rootScope.terms = function() {
    $ionicModal.fromTemplateUrl('templates/terms.html', {
      scope: $rootScope
    }).then(function(modal) {
      $rootScope.modal = modal;
      $rootScope.modal.show();
    });
  };

  $rootScope.privacy = function() {
    $ionicModal.fromTemplateUrl('templates/privacy.html', {
      scope: $rootScope
    }).then(function(modal) {
      $rootScope.modal = modal;
      $rootScope.modal.show();
    });
  };

  $rootScope.loadm = function() {
    $ionicModal.fromTemplateUrl('templates/loading.html', {
      scope: $rootScope
    }).then(function(modal) {
      $rootScope.modal = modal;
      $rootScope.modal.show();
    });
  };

  $rootScope.forgot = function() {
    $ionicModal.fromTemplateUrl('templates/forgot.html', {
      scope: $rootScope
    }).then(function(modal) {
      $rootScope.modal = modal;
      $rootScope.modal.show();
    });
  };

  $rootScope.closeMod = function() {
    $rootScope.modal.hide();
  };

  $rootScope.destroySess = function(did,logout){
      $rootScope.Donor = {}
      App_Session = {}
      API.storage.remove('userProf')
      API.storage.remove('event_'+did)
      API.storage.remove('feeds_'+did)
      API.storage.remove('msg_'+did)
      API.storage.remove('donorId')
      API.storage.remove('donorName')
      API.storage.remove('donorImage')
      console.log(logout)
      if(logout){
        API.storage.set('remember',false)
      }
  }

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    // if(API.networkCheck()){
    //   console.log("NoInternet");
    //   $ionicPopup.alert({
    //     title: 'No Internet Connection!',
    //     template: 'Using Offiline data'
    //   });
    // }
    // else{
    //   API.storage.remove("terms");
    //   API.storage.remove("feeds");
    // }

  });
})

.config(function($stateProvider, $urlRouterProvider, $httpProvider) {

    // $httpProvider.defaults.useXDomain = true;
    // $httpProvider.defaults.headers.common = 'Content-Type: application/json';
    // delete $httpProvider.defaults.headers.common['X-Requested-With'];
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
    // $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
  $stateProvider

  .state('login', {
    url: "/login",
    cache: false,
    templateUrl: "login.html",
    controller: 'LoginController'
  })
  .state('signup', {
    url: "/signup",
    cache: false,
    templateUrl: "templates/signup.html",
    controller: 'SignupController'
    })
  .state('logout', {
    url: "/logout",
    cache: false,
    controller: 'SignupController'
    })
  .state('facebook', {
    url: "/facebook",
    templateUrl: "templates/signup_facebook.html",
    controller: 'SignupController'
    })
  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })
    .state('app.home', {
      url: "/home",
    cache: false,
      views: {
        'menuContent': {
          templateUrl: "templates/home.html",
          controller: 'FeedsController'
        }
      }
    })
    .state('app.feed', {
      url: "/feed/:index/:message_id",
      views: {
        'menuContent': {
          templateUrl: "templates/feed.html",
          controller: 'FeedController'
        }
      }
    })
    .state('app.org', {
      url: "/org",
      // param: {orgid:0},
    cache: false,
      views: {
        'menuContent': {
          templateUrl: "templates/org.html",
          controller: 'orgController'
        }
      }
    })
    .state('app.events', {
      url: "/events",
    cache: false,
      views: {
        'menuContent': {
          templateUrl: "templates/events.html",
          controller: 'EventsController'
        }
      }
    })
    .state('app.event', {
      url: "/event/:index/:message_id",
      views: {
        'menuContent': {
          templateUrl: "templates/event.html",
          controller: 'EventController'
        }
      }
    })
    .state('app.messages', {
      url: "/messages",
    cache: false,
      views: {
        'menuContent': {
          templateUrl: "templates/messages.html",
          controller: 'MessagesController'
        }
      }
    })
    .state('app.donate', {
      url: "/donate/:orgid",
    cache: false,
      views: {
        'menuContent': {
          templateUrl: "templates/donate.html",
          controller: 'DonateController'
        }
      }
    })
    .state('app.pledge', {
      url: "/pledge",
    cache: false,
      views: {
        'menuContent': {
          templateUrl: "templates/pledge.html",
          controller: 'PledgeController'
        }
      }
    })
    .state('app.profile', {
      url: "/profile",
      cache: false,
      views: {
        'menuContent': {
          templateUrl: "templates/profile.html",
          controller: 'ProfileController'
        }
      }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});

var API = {
  platformCheck : function(){
    return (typeof device !== 'undefined') ? device.platform : '';
  },
  networkCheck: function()
  {
    var noConnection = navigator.connection && navigator.connection.type == Connection.NONE;
    return noConnection;  
  },
  storage:
  {
    get: function(key, skipParse)
    {
      var data = window.localStorage.getItem(key);

      if (data)
      {
        if (!skipParse)
        {
          data = JSON.parse(data);
        }

        return data;
      }
    },
    set: function(key, value, skipParse)
    {
      console.log(key,value);
      if (!skipParse)
      {
        value = JSON.stringify(value);
      }

      window.localStorage.setItem(key, value);
    },
    remove: function(key)
    {
      window.localStorage.removeItem(key);
    }
  },
  _arrayBufferToBase64 : function( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
  }
};

// var settings = {
//   _url : "",
//   _token : "",
//   _tokenID : "",
//   _then : function(){},
//   _success : function(){},
//   _error : function(){}
// }
var App_Session = {
  donor_id    : API.storage.get('donorId'),
  donor_name  : API.storage.get('donorName'),
  donor_image  : API.storage.get('donorName'),
  org_id      : null
}
