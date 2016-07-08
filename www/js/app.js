// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var myApp = angular.module('btApp', ['ionic', 'firebase', 'ngCordova'])
.constant('FIREBASE_URL', 'https://bt01.firebaseio.com/')
.run(function ($ionicPlatform) {
  $ionicPlatform.ready(function () {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true)

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true)
    }
    if (window.StatusBar) {
      StatusBar.styleDefault()
    }
  })
})
.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('index', {
      url: '/',
      templateUrl: 'templates/login.html'
    })
    .state('register', {
      url: '/register',
      templateUrl: 'templates/register.html',
      controller: 'RegisterController'
    })
    .state('app', {
      url: '/app',
      templateUrl: 'templates/app.html',
      controller: 'AppController',
      resolve: {
        currentAuth: function (Authentication) {
          return Authentication.requireAuth()
        }
      }
    })
    .state('expense', {
      url: '/expense',
      templateUrl: 'templates/expense.html',
      controller: 'AppController',
      resolve: {
        currentAuth: function (Authentication) {
          return Authentication.requireAuth()
        }
      }
    })
    .state('income', {
      url: '/income',
      templateUrl: 'templates/income.html',
      controller: 'AppController',
      resolve: {
        currentAuth: function (Authentication) {
          return Authentication.requireAuth()
        }
      }
    })
    .state('category', {
      url: '/category',
      templateUrl: 'templates/category.html',
      controller: 'AppController',
      resolve: {
        currentAuth: function (Authentication) {
          return Authentication.requireAuth()
        }
      }
    })
    .state('infographic', {
      url: '/infographic',
      templateUrl: 'templates/infographic.html',
      controller: 'AppController',
      resolve: {
        currentAuth: function (Authentication) {
          return Authentication.requireAuth()
        }
      }
    })

  $urlRouterProvider.otherwise('/')
})

myApp.factory('Authentication', ['$rootScope', '$location', '$firebaseAuth', '$firebaseObject', 'FIREBASE_URL', '$ionicNavBarDelegate', '$ionicHistory', function ($rootScope, $location, $firebaseAuth, $firebaseObject, FIREBASE_URL, $ionicNavBarDelegate, $ionicHistory) {
  var ref = new Firebase(FIREBASE_URL)
  var auth = $firebaseAuth(ref)

  $rootScope.data = {
    message: null
  }

  auth.$onAuth(function (authUser) {
    if (authUser) {
      // grab the authenticated user id
      var userRef = new Firebase(FIREBASE_URL + 'users/' + authUser.uid)
      // grab all the data of the current user
      var userObj = $firebaseObject(userRef)
      // expose the data to AngularJS
      $rootScope.currentUser = userObj
    } else {
      $rootScope.currentUser = null
      $rootScope.data.message = null
    }
  })

  var authObj = {
    login: function (user) {
      if (user) {
        auth.$authWithPassword({
          email: user.email,
          password: user.password
        }).then(function (regUser) {
          //  $ionicNavBarDelegate.showBackButton(false)
          $location.path('/app')
          $rootScope.data.message = 'You are currently logged in.'
          //  Prevent back navigation button to appear in the main application view
          $ionicHistory.nextViewOptions({
            disableBack: true
          })
        }).catch(function (error) {
          $rootScope.data.message = error.message
        })
      } else {
        console.log('login failed')
      }
    },
    logout: function () {
      $ionicNavBarDelegate.showBackButton(false)
      return auth.$unauth()
    },
    requireAuth: function () {
      return auth.$requireAuth()
    },
    register: function (user) {
      //  $ionicNavBarDelegate.showBackButton(true)
      auth.$createUser({
        email: user.email,
        password: user.password
      }).then(function (regUser) {
        // store the users info into the user document
        var regRef = new Firebase(FIREBASE_URL + 'users')
        .child(regUser.uid).set({
          date: Firebase.ServerValue.TIMESTAMP,
          regUser: regUser.uid,
          email: user.email,
          username: user.username
        })

        authObj.login(user)
      }).catch(function (error) {
        $rootScope.data.message = error.message
      })
    },
    showGraph: function () {
      //  $ionicNavBarDelegate.showBackButton(true)
      $location.path('/infographic')
    },
    income: function () {
      //  $ionicNavBarDelegate.showBackButton(true)
      $location.path('/income')
    },
    expense: function () {
      //  $ionicNavBarDelegate.showBackButton(true)
      $location.path('/expense')
    }
  }

  return authObj
}])


myApp.controller('LoginController', ['$scope', '$rootScope', 'Authentication', function ($scope, $rootScope, Authentication) {
  $scope.login = function () {
    Authentication.login($scope.user)
  }

  $scope.logout = function () {
    Authentication.logout()
  }
}])

myApp.controller('RegisterController', ['$scope', '$http', 'Authentication', function ($scope, $http, Authentication) {

  $scope.register = function () {
    if ($scope.user.username !== '' && $scope.user.email !== '' && $scope.user.password !== '') {
      Authentication.register($scope.user)
    } else {
      $scope.message = 'Invalid registration information.'
    }
  }
}])

myApp.controller('AppController', ['$scope', '$ionicModal', 'Authentication', '$http', '$rootScope', '$firebaseAuth', '$firebaseArray', 'FIREBASE_URL', function ($scope, $ionicModal, Authentication, $http, $rootScope, $firebaseAuth, $firebaseArray, FIREBASE_URL) {
  $rootScope.data = {
    budget: 0,
    expense: 0,
    message: null,
    balance: 100,
    modalCategory: '',
    listTitle: '',
    items: [
      {
        'category': 'Groceries',
        'value': 250
      },
      {
        'category': 'Eating Out',
        'value': 50
      },
      {
        'category': 'Gas',
        'value': 40
      },
      {
        'category': 'Shopping',
        'value': 120
      }
    ],
    incomeList: [
      {
        'category': 'Salary',
        'value': 1500
      },
      {
        'category': 'Freelance',
        'value': 1000
      }
    ],
    expenseList: [
      {
        'category': 'Groceries',
        'value': 100
      },
      {
        'category': 'Groceries',
        'value': 150
      },
      {
        'category': 'Eating Out',
        'value': 50
      },
      {
        'category': 'Gas',
        'value': 40
      },
      {
        'category': 'Shopping',
        'value': 120
      }
    ],
    itemsList: []
  }

  $scope.logout = function () {
    Authentication.logout()
  }
  $scope.showGraph = function () {
    Authentication.showGraph()
  }
  $scope.income = function () {
    Authentication.income()
  }
  $scope.expense = function () {
    Authentication.expense()
  }
  $scope.showModal = function (title) {
    $scope.data.listTitle = title
    title = title.toLowerCase()
    $rootScope.data.itemsList = $rootScope.data[title + 'List']
    $scope.modal.show()
  }

  $ionicModal.fromTemplateUrl('templates/itemListModal.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.modal = modal
  })
  $scope.$on('$destroy', function () {
    $scope.modal.remove()
    console.log('modal destroyed')
  })
  $scope.$on('modal.hidden', function () {
    $rootScope.data.modalCategory = ''
    console.log('modal hidden')
  })
  $scope.$on('modal.removed', function () {
    console.log('modal removed')
  })
  $scope.$on('$ionicView.enter', function (event, data) {
    // handle event
    console.log('View: ', data.title)
  })
}])

myApp.controller('CategoryController', ['$scope', '$ionicModal', 'Authentication', '$http', '$rootScope', '$firebaseAuth', '$firebaseArray', 'FIREBASE_URL', function ($scope, $ionicModal, Authentication, $http, $rootScope, $firebaseAuth, $firebaseArray, FIREBASE_URL) {
  $rootScope.data = {
    budget: 0,
    expense: 0,
    message: null,
    balance: 100,
    modalCategory: '',
    categories: {
      'income': [
        'Salary',
        'Bonus'
      ],
      'expense': [
        'Groceries',
        'Eating Out',
        'Gas',
        'Shopping'
      ]
    },
    items: [
      {
        'category': 'Groceries',
        'value': 250
      },
      {
        'category': 'Eating Out',
        'value': 50
      },
      {
        'category': 'Gas',
        'value': 40
      },
      {
        'category': 'Shopping',
        'value': 120
      }
    ],
    incomeList: [
      {
        'category': 'Salary',
        'value': 1500
      },
      {
        'category': 'Freelance',
        'value': 1000
      }
    ],
    expenseList: [
      {
        'category': 'Groceries',
        'value': 100
      },
      {
        'category': 'Groceries',
        'value': 150
      },
      {
        'category': 'Eating Out',
        'value': 50
      },
      {
        'category': 'Gas',
        'value': 40
      },
      {
        'category': 'Shopping',
        'value': 120
      }
    ],
    itemsList: []
  }
  $scope.createCategory = function (category, item) {
    category = category.toLowerCase()
    $scope.data.categories[category].push(item)
    $rootScope.data.selectedcategory = item
    $scope.categoryModal.hide()
  }
  $scope.showCategoryModal = function (title) {
    $scope.data.itemsTitle = title
    $scope.categoryModal.show()
  }
  $ionicModal.fromTemplateUrl('templates/categoryModal.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.categoryModal = modal
  })
  $scope.$on('$destroy', function () {
    $scope.categoryModal.remove()
    console.log('Category modal destroyed')
  })
  $scope.$on('modal.hidden', function () {
    $rootScope.data.modalCategory = ''
    console.log('Category modal hidden')
  })
  $scope.$on('modal.removed', function () {
    console.log('Category modal removed')
  })
}])
