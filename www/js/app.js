// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var myApp = angular.module('btApp', ['ionic', 'nvd3', 'firebase', 'ngCordova'])
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
      cache: false,
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

  var currentUserId = null

  auth.$onAuth(function (authUser) {
    if (authUser) {
      // grab the authenticated user id
      var userRef = new Firebase(FIREBASE_URL + 'users/' + authUser.uid)
      // grab all the data of the current user
      var userObj = $firebaseObject(userRef)
      // expose the data to AngularJS
      $rootScope.currentUser = userObj
      currentUserId = $rootScope.currentUser.$id
      //console.log($rootScope.currentUser.$id)
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
          // load all data
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
      $ionicNavBarDelegate.showBackButton(true)
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
        // initialize data
        //  income total
        var budgetTrackerIncomeTotalRef = new Firebase(FIREBASE_URL + 'users/' + regUser.uid + '/budgettracker/incometotal')
        budgetTrackerIncomeTotalRef.set({
          total: 0,
          date: Firebase.ServerValue.TIMESTAMP
        })
        $rootScope.data.incomeTotal = 0
        //  expense total
        var budgetTrackerExpenseTotalRef = new Firebase(FIREBASE_URL + 'users/' + regUser.uid + '/budgettracker/expensetotal')
        budgetTrackerExpenseTotalRef.set({
          total: 0,
          date: Firebase.ServerValue.TIMESTAMP
        })
        $rootScope.data.expenseTotal = 0

        authObj.login(user)
      }).catch(function (error) {
        $rootScope.data.message = error.message
      })
    },
    getCurrentUserId: function () {
      return currentUserId
    }
  }

  return authObj
}])


myApp.factory('BudgetTracker', ['$rootScope', '$location', 'Authentication', '$firebaseAuth', '$firebaseArray', '$firebaseObject', 'FIREBASE_URL', '$ionicNavBarDelegate', '$ionicModal', function ($rootScope, $location, Authentication, $firebaseAuth, $firebaseObject, $firebaseArray, FIREBASE_URL, $ionicNavBarDelegate, $ionicModal) {
  $rootScope.data = {
    message: null
  }

  //  data variable for bulletChart
  $rootScope.bulletChart = {}
  $rootScope.bulletChart.options = {}
  $rootScope.bulletChart.data = {}
  $rootScope.bulletChart.options = {
    chart: {
      type: 'bulletChart',
      duration: 1000,
      height: 50,
      color: '7F0000'
    }
  }

  $rootScope.bulletChart.data = {
    'title': 'Balance',
    'subtitle': 'US$',
    'ranges': [0, 0, $rootScope.bulletChart.data.incomeTotal || 0],
    'measures': [$rootScope.bulletChart.data.expenseTotal || 0],
    'markers': [],
    'rangeLabels': ['Income', '', '']
  }

  //  D3JS
  $rootScope.vm = {}
  $rootScope.vm.options = {}
  $rootScope.vm.data = {}
  $rootScope.vm.options = {
    chart: {
      type: 'pieChart',
      height: 500,
      x: function (d) { return d.key },
      y: function (d) { return d.y },
      showLabels: true,
      duration: 1000,
      labelThreshold: 0.01,
      labelSunbeamLayout: true,
      legend: {
        margin: {
          top: 5,
          right: 35,
          bottom: 5,
          left: 0
        }
      }
    }
  }

  $ionicModal.fromTemplateUrl('templates/itemListModal.html', {
    scope: $rootScope
  }).then(function (modal) {
    $rootScope.modal = modal
  })
  $rootScope.$on('$destroy', function () {
    $rootScope.modal.remove()
    //console.log('modal destroyed')
  })
  $rootScope.$on('modal.hidden', function () {
    $rootScope.data.modalCategory = ''
    //console.log('modal hidden')
  })
  $rootScope.$on('modal.removed', function () {
    //console.log('modal removed')
  })
  $rootScope.$on('$ionicView.enter', function (event, data) {
    //console.log('View: ', data.title)
  })

  var budgetObj = {
    showGraph: function () {
      $ionicNavBarDelegate.showBackButton(true)
      $location.path('/infographic')
    },
    setUpPieGraph: function (userId) {
      var budgetTrackerCategoryExpenseRef = new Firebase(FIREBASE_URL + 'users/' + userId + '/budgettracker/categories/expense')
      var d3Data = []
      budgetTrackerCategoryExpenseRef.once('value', function (snapshot) {
        var d3Item = {}
        snapshot.forEach(function (childSnapshot) {
          var data = childSnapshot.val()
          d3Item = {
            key: data.name,
            y: data.totalValue
          }
          d3Data.push(d3Item)
        })
      })
      $rootScope.vm.data = d3Data
    },
    showAddIncome: function () {
      $ionicNavBarDelegate.showBackButton(true)
      $location.path('/income')
    },
    showAddExpense: function () {
      $ionicNavBarDelegate.showBackButton(true)
      $location.path('/expense')
    },
    getExpenseList: function (userId) {
      //  expense list
      var budgetTrackerExpenseRef = new Firebase(FIREBASE_URL + 'users/' + userId + '/budgettracker/expense')
      var budgetTrackerExpenseList = $firebaseArray(budgetTrackerExpenseRef)
      return budgetTrackerExpenseList
    },
    getExpenseCategories: function (userId) {
      //  list expense category groups
      var budgetTrackerCategoryExpenseRef = new Firebase(FIREBASE_URL + 'users/' + userId + '/budgettracker/categories/expense')
      var budgetTrackerCategoryExpense = $firebaseArray(budgetTrackerCategoryExpenseRef)
      $rootScope.data.expenses = budgetTrackerCategoryExpense
      return budgetTrackerCategoryExpense
    },
    getExpenseTotal: function () {
      //  expense total
      var budgetTrackerExpenseTotalRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/budgettracker/expensetotal')
      if (budgetTrackerExpenseTotalRef) {
        budgetTrackerExpenseTotalRef.once('value', function (snapshot) {
          var data = snapshot.exportVal()
          $rootScope.data.expenseTotal = data.total
          $rootScope.bulletChart.data.expenseTotal = data.total
        })
      }
    },
    getIncomeList: function (userId) {
      //  income list
      var budgetTrackerIncomeRef = new Firebase(FIREBASE_URL + 'users/' + userId + '/budgettracker/income')
      var budgetTrackerIncomeList = $firebaseArray(budgetTrackerIncomeRef)
      $rootScope.data.incomes = budgetTrackerIncomeList
      return budgetTrackerIncomeList
    },
    getIncomeTotal: function (userId) {
      //  income total
      var budgetTrackerIncomeTotalRef = new Firebase(FIREBASE_URL + 'users/' + userId + '/budgettracker/incometotal')
      if (budgetTrackerIncomeTotalRef) {
        budgetTrackerIncomeTotalRef.once('value', function (snapshot) {
          var data = snapshot.exportVal()
          $rootScope.data.incomeTotal = data.total
          $rootScope.bulletChart.data.incomeTotal = data.total
        })
      }
    },
    getBudgetBalance: function (userId) {
      //  income total
      var budgetTrackerIncomeTotalRef = new Firebase(FIREBASE_URL + 'users/' + userId + '/budgettracker/incometotal')
      if (budgetTrackerIncomeTotalRef) {
        budgetTrackerIncomeTotalRef.once('value', function (snapshot) {
          var data = snapshot.exportVal()
          $rootScope.data.incomeTotal = data.total
          $rootScope.bulletChart.data.incomeTotal = data.total

          //  expense total
          var budgetTrackerExpenseTotalRef = new Firebase(FIREBASE_URL + 'users/' + userId + '/budgettracker/expensetotal')
          if (budgetTrackerExpenseTotalRef) {
            budgetTrackerExpenseTotalRef.once('value', function (snapshot) {
              var data = snapshot.exportVal()
              $rootScope.data.expenseTotal = data.total
              $rootScope.bulletChart.data.expenseTotal = data.total

              $rootScope.bulletChart.data = {
                'title': 'Balance',
                'subtitle': 'US$',
                'ranges': [0, 0, $rootScope.bulletChart.data.incomeTotal || 0],
                'measures': [$rootScope.bulletChart.data.expenseTotal || 0],
                'markers': [],
                'rangeLabels': ['Income', '', ''],
                'measureLabels': ['Expense']
              }
              //  balance
              var balanceValue = $rootScope.data.incomeTotal - $rootScope.data.expenseTotal
              $rootScope.data.balance = balanceValue
            })
          }
        })
      }
    },
    showModal: function (title, userId) {
      title = title.toLowerCase()
      $rootScope.data.listTitle = title
      if (title === 'expense') {
        $rootScope.data.itemsList = this.getExpenseList(userId)
      } else if (title === 'income') {
        $rootScope.data.itemsList = this.getIncomeList(userId)
      }
      $rootScope.modal.show()
    }
  }
  return budgetObj
}])

myApp.controller('LoginController', ['$scope', 'Authentication', function ($scope, Authentication) {
  $scope.login = function () {
    Authentication.login($scope.user)
  }

  $scope.logout = function () {
    Authentication.logout()
  }
}])

myApp.controller('RegisterController', ['$scope', 'Authentication', function ($scope, Authentication) {

  $scope.register = function () {
    if ($scope.user.username !== '' && $scope.user.email !== '' && $scope.user.password !== '') {
      Authentication.register($scope.user)
    } else {
      $scope.message = 'Invalid registration information.'
    }
  }
}])

myApp.controller('AppController', ['$scope', 'Authentication', 'BudgetTracker', '$firebaseAuth', 'FIREBASE_URL', function ($scope, Authentication, BudgetTracker, $firebaseAuth, FIREBASE_URL) {

  // create ref to Firebase data
  var ref = new Firebase(FIREBASE_URL)
  // create authentication Firebase object with the ref to the database location
  var auth = $firebaseAuth(ref)

  auth.$onAuth(function (authUser) {
    if (authUser) {
      var currentUserId = Authentication.getCurrentUserId()

      BudgetTracker.getBudgetBalance(currentUserId)
      BudgetTracker.getIncomeTotal(currentUserId)
      $scope.data.expenses = BudgetTracker.getExpenseCategories(currentUserId)
      BudgetTracker.setUpPieGraph(currentUserId)
      
      $scope.logout = function () {
        Authentication.logout()
      }
      $scope.showGraph = function () {
        BudgetTracker.showGraph()
      }
      $scope.showAddIncome = function () {
        BudgetTracker.showAddIncome()
      }
      $scope.showAddExpense = function () {
        BudgetTracker.showAddExpense()
      }
      $scope.showModal = function (title) {
        BudgetTracker.showModal(title, currentUserId)
      }
    } // if authUser===========================================================
  })
}])

myApp.controller('CategoryController', ['$scope', '$location', '$ionicModal', 'Authentication', '$http', '$rootScope', '$firebaseAuth', '$firebaseObject', '$firebaseArray', 'FIREBASE_URL', function ($scope, $location, $ionicModal, Authentication, $http, $rootScope, $firebaseAuth, $firebaseObject, $firebaseArray, FIREBASE_URL) {
  $rootScope.data = {
    message: null,
    categories: {
      income: [],
      expense: []
    }
  }
  // create ref to Firebase data
  var ref = new Firebase(FIREBASE_URL)
  // create authentication Firebase object with the ref to the database location
  var auth = $firebaseAuth(ref)

  auth.$onAuth(function (authUser) {
    if (authUser) {
      var budgetTrackerRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id)
      // grab all data for expense category list
      var budgetTracker = $firebaseObject(budgetTrackerRef)
      //  ref link to categories
      var budgetTrackerCategoryIncomeRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/budgettracker/categories/income')
      var budgetTrackerCategoryIncome = $firebaseArray(budgetTrackerCategoryIncomeRef)
      //  load existing income categories from database
      if (budgetTrackerCategoryIncome !== undefined) $rootScope.data.categories.income = budgetTrackerCategoryIncome

      var budgetTrackerCategoryExpenseRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/budgettracker/categories/expense')
      var budgetTrackerCategoryExpense = $firebaseArray(budgetTrackerCategoryExpenseRef)
      //  load existing expense categories from database
      if (budgetTrackerCategoryExpense !== undefined) $rootScope.data.categories.expense = budgetTrackerCategoryExpense

      $scope.addIncome = function () {
        $scope.data.incomeTotal += $scope.data.incomeValue
        var budgetTrackerIncomeRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/budgettracker/income')
        var budgetTrackerIncomeTotalRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/budgettracker/incometotal')

        // grab all data from user
        var budgetTrackerIncome = $firebaseArray(budgetTrackerIncomeRef)

        //  add item to database
        budgetTrackerIncome.$add({
          category: $scope.data.selectedCategoryIncome,
          value: $scope.data.incomeValue,
          date: Firebase.ServerValue.TIMESTAMP
        })

        // increment the income total
        var newIncomeTotal = $rootScope.currentUser.budgettracker.incometotal.total + $scope.data.incomeValue
        budgetTrackerIncomeTotalRef.set({
          total: newIncomeTotal,
          date: Firebase.ServerValue.TIMESTAMP
        })
        $rootScope.data.incomeTotal = newIncomeTotal
        //  update balance
        var balanceValue = $rootScope.data.incomeTotal - $rootScope.data.expenseTotal
        $rootScope.data.balance = balanceValue

        //  increment total value of category
        var selectedCategory = $scope.data.selectedCategoryIncome
        var incomeIndex = 0
        budgetTrackerCategoryIncome.forEach(function (e) {
          if (e.name === selectedCategory) {
            $scope.data.categories.income[incomeIndex].totalValue += $scope.data.incomeValue
            console.log('Found it: ' + e.name)
          }
          incomeIndex++
        })
        //  console.log($scope.currentUser.budgettracker)
        $location.path('/app')
      }
      $scope.addExpense = function () {
        var budgetTrackerExpenseRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/budgettracker/expense')
        var budgetTrackerExpenseTotalRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/budgettracker/expensetotal')
        // grab all data from user
        var budgetTrackerExpense = $firebaseArray(budgetTrackerExpenseRef)
        budgetTrackerExpense.$add({
          category: $scope.data.selectedCategoryExpense,
          value: $scope.data.expenseValue,
          date: Firebase.ServerValue.TIMESTAMP
        })
        var newExpenseTotal = $rootScope.currentUser.budgettracker.expensetotal.total + $scope.data.expenseValue
        budgetTrackerExpenseTotalRef.set({
          total: newExpenseTotal,
          date: Firebase.ServerValue.TIMESTAMP
        })
        $rootScope.data.expenseTotal = newExpenseTotal
        //  update balance
        var balanceValue = $rootScope.data.incomeTotal - $rootScope.data.expenseTotal
        $rootScope.data.balance = balanceValue

        //  update expense group total value
        var budgetTrackerExpenseCategoryRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/budgettracker/categories/expense/' + $scope.data.selectedCategoryExpense)

        budgetTrackerExpenseCategoryRef.once('value', function (snapshot) {
          var data = snapshot.val()
          budgetTrackerExpenseCategoryRef.set({
            name: $scope.data.selectedCategoryExpense,
            totalValue: data.totalValue + $scope.data.expenseValue,
            date: Firebase.ServerValue.TIMESTAMP
          })
        })
        $location.path('/app')
      }
      $scope.createCategory = function (category, item) {
        category = category.toLowerCase()
        //  check to make sure that category does not exist
        var existingCategoryList = $scope.data.categories[category]
        var categoryExist = false
        if (existingCategoryList) {
          existingCategoryList.forEach(function (e) {
            // check to see if item exist
            console.log(e.name)
            if (item === e.name) {
              console.log('Found it: ' + e.name)
              $rootScope.data.message = 'Category already exist.'
              $rootScope.data.selectedCategoryIncome = item
              categoryExist = true
              return
            }
          })
        }
        if (!categoryExist) {
          var budgetTrackerCategoryRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/budgettracker/categories/' + category + '/' + item)
          //  add new category
          budgetTrackerCategoryRef.set({
            name: item,
            totalValue: 0,
            date: Firebase.ServerValue.TIMESTAMP
          })

          item = {
            name: item,
            totalValue: 0
          }

          $scope.data.categories[category].push(item)
          if (category === 'income') {
            $rootScope.data.selectedCategoryIncome = item.name
          } else if (category === 'expense') {
            $rootScope.data.selectedCategoryExpense = item.name
          }
        }
        $scope.categoryModal.hide()
        //$scope.data.newCategoryName = ''
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
        $rootScope.data.newCategoryName = ''
        console.log('Category modal hidden')
      })
      $scope.$on('modal.removed', function () {
        console.log('Category modal removed')
      })
    } // if authUser
  })
}])
