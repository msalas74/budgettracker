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

myApp.factory('Loader', ['$rootScope', '$ionicLoading', function ($rootScope, $ionicLoading) {
  var loaderObj = {
    showLoading: function () {
      $ionicLoading.show({
        templateUrl: 'templates/loader.html'
      }).then(function () {
        console.log('The loading indicator is now showing.')
      })
    },
    hideLoading: function () {
      $ionicLoading.hide().then(function () {
        console.log('The loading indicator is now hidden.')
      })
    }
  }
  return loaderObj
}])

myApp.factory('Authentication', ['$rootScope', 'Loader', '$location', '$firebaseAuth', '$firebaseObject', 'FIREBASE_URL', '$ionicNavBarDelegate', '$ionicHistory', function ($rootScope, Loader, $location, $firebaseAuth, $firebaseObject, FIREBASE_URL, $ionicNavBarDelegate, $ionicHistory) {
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
      var userObj = $firebaseObject(userRef)// expose the data to AngularJS
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
        // show loader
        Loader.showLoading()
        auth.$authWithPassword({
          email: user.email,
          password: user.password
        }).then(function (regUser) {
          //  $ionicNavBarDelegate.showBackButton(false)
          Loader.hideLoading()
          $location.path('/app')
          $rootScope.data.message = 'You are currently logged in.'
          // load all data
          //  Prevent back navigation button to appear in the main application view
          $ionicHistory.nextViewOptions({
            disableBack: true
          })
          return 'You are currently logged in.'
        }).catch(function (error) {
          Loader.hideLoading()
          $rootScope.data.message = error.message
        })
      } else {
        console.log('no user object passed through login method.')
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
      Loader.showLoading()
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
        Loader.hideLoading()
        $rootScope.data.message = error.message
      })
    },
    getCurrentUserId: function () {
      return currentUserId
    }
  }

  return authObj
}])


myApp.factory('BudgetTracker', ['$rootScope', '$location', 'Authentication', 'Loader', '$firebaseAuth', '$firebaseArray', '$firebaseObject', 'FIREBASE_URL', '$ionicNavBarDelegate', '$ionicModal', function ($rootScope, $location, Authentication, Loader, $firebaseAuth, $firebaseObject, $firebaseArray, FIREBASE_URL, $ionicNavBarDelegate, $ionicModal) {
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

  //  subcategory modal
  $ionicModal.fromTemplateUrl('templates/subCategoryListModal.html', {
    scope: $rootScope
  }).then(function (modal) {
    $rootScope.subCategoryModal = modal
  })
  $rootScope.$on('$destroy', function () {
    $rootScope.subCategoryModal.remove()
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
      // show loading
      Loader.showLoading()
      //  expense list
      var budgetTrackerExpenseRef = new Firebase(FIREBASE_URL + 'users/' + userId + '/budgettracker/expense')
      var budgetTrackerExpenseList = $firebaseArray(budgetTrackerExpenseRef)
      budgetTrackerExpenseList.$loaded()
      .then(function (fbArray) {
        Loader.hideLoading()
      })
      .catch(function (err) {
        Loader.hideLoading()
      })
      console.log(budgetTrackerExpenseList)
      return budgetTrackerExpenseList
    },
    getExpenseItemList: function (userId, item) {
      var budgetTrackerExpenseItemRef = new Firebase(FIREBASE_URL + 'users/' + userId + '/budgettracker/expense')
      var expenseListArray = []
      // show loading
      Loader.showLoading()
      budgetTrackerExpenseItemRef.orderByChild('category').equalTo(item).once('value', function (snapshot) {
        snapshot.forEach(function (data) {
          console.log(data.key() + ': ' + data.val().category + ': ' + data.val().value)
          expenseListArray.push({
            id: data.key(),
            category: data.val().category,
            value: data.val().value
          })
        })
        //  console.log(expenseListArray)
        $rootScope.data.itemsList = expenseListArray
        $rootScope.data.listTitle = 'expense'
        $rootScope.subCategoryModal.show()
        //  return expenseListArray
      })
      Loader.hideLoading()
    },
    getExpenseCategories: function (userId) {
      var expenseListArray = []
      //  list expense category groups
      var budgetTrackerCategoryExpenseRef = new Firebase(FIREBASE_URL + 'users/' + userId + '/budgettracker/categories/expense')
      //var budgetTrackerCategoryExpense = $firebaseArray(budgetTrackerCategoryExpenseRef)
      //$rootScope.data.expenses = budgetTrackerCategoryExpense

      budgetTrackerCategoryExpenseRef.once('value', function (snapshot) {
        snapshot.forEach(function (data) {
          if (data.val().totalValue > 0) {
            expenseListArray.push({
              id: data.key(),
              name: data.val().name,
              totalValue: data.val().totalValue
            })
          }
        })
      })
      //return budgetTrackerCategoryExpense
      console.log(expenseListArray)
      $rootScope.data.expenses = expenseListArray
      //return expenseListArray
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
      //  show loader
      Loader.showLoading()
      //  income list
      var budgetTrackerIncomeRef = new Firebase(FIREBASE_URL + 'users/' + userId + '/budgettracker/income')
      var budgetTrackerIncomeList = $firebaseArray(budgetTrackerIncomeRef)
      budgetTrackerIncomeList.$loaded()
      .then(function (fbArray) {
        Loader.hideLoading()
      })
      .catch(function (err) {
        Loader.hideLoading()
        console.log('Error: ' + err)
        return null
      })
      //console.log(budgetTrackerIncomeList)
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
    deleteItem: function (userId, category, obj, id) {
      var item = new Firebase(FIREBASE_URL + 'users/' + userId + '/budgettracker/' + category + '/' + id)
      item.remove()
      if (category === 'income') {
        budgetObj.subtractFromIncome(obj, userId)
      } else if (category === 'expense') {
        budgetObj.subtractFromExpense(obj, userId)
      }
      $rootScope.modal.hide()
      $rootScope.subCategoryModal.hide()
      console.log('Deleting item id: ' + id + ' from ' + category)
    },
    subtractFromIncome: function (obj, userId) {
      var budgetTrackerIncomeTotalRef = new Firebase(FIREBASE_URL + 'users/' + userId + '/budgettracker/incometotal')
      // increment the income total
      var newIncomeTotal = $rootScope.currentUser.budgettracker.incometotal.total - obj.value
      budgetTrackerIncomeTotalRef.set({
        total: newIncomeTotal,
        date: Firebase.ServerValue.TIMESTAMP
      })
      $rootScope.data.incomeTotal = newIncomeTotal
      //  update balance
      var balanceValue = $rootScope.data.incomeTotal - $rootScope.data.expenseTotal
      $rootScope.data.balance = balanceValue
      // update bullet chart
      budgetObj.getBudgetBalance(userId)
    },
    subtractFromExpense: function (obj, userId) {
      var budgetTrackerExpenseTotalRef = new Firebase(FIREBASE_URL + 'users/' + userId + '/budgettracker/expensetotal')
      var newExpenseTotal = $rootScope.currentUser.budgettracker.expensetotal.total - obj.value
      budgetTrackerExpenseTotalRef.set({
        total: newExpenseTotal,
        date: Firebase.ServerValue.TIMESTAMP
      })
      $rootScope.data.expenseTotal = newExpenseTotal
      //  update balance
      var balanceValue = $rootScope.data.incomeTotal - $rootScope.data.expenseTotal
      $rootScope.data.balance = balanceValue

      //  update expense group total value
      var budgetTrackerExpenseCategoryRef = new Firebase(FIREBASE_URL + 'users/' + userId + '/budgettracker/categories/expense/' + obj.category)

      budgetTrackerExpenseCategoryRef.once('value', function (snapshot) {
        var data = snapshot.val()
        var sum = null
        sum = data.totalValue - obj.value
        budgetTrackerExpenseCategoryRef.set({
          name: obj.category,
          totalValue: sum,
          date: Firebase.ServerValue.TIMESTAMP
        })
      })

      // update list of subcategory totals
      budgetObj.getExpenseCategories(userId)
      //  update bullet chart
      budgetObj.getBudgetBalance(userId)
    },
    showModal: function (title, userId) {
      title = title.toLowerCase()
      $rootScope.data.listTitle = title
      if (title === 'expense') {
        $rootScope.data.itemsList = this.getExpenseList(userId)
      } else if (title === 'income') {
        $rootScope.data.itemsList = this.getIncomeList(userId)
      } else {
        $rootScope.data.itemsList = null
      }
      $rootScope.modal.show()
    }
  }
  return budgetObj
}])

myApp.factory('Category', ['$rootScope', '$location', '$ionicModal', 'Authentication', '$firebaseAuth', '$firebaseObject', '$firebaseArray', 'FIREBASE_URL', function ($rootScope, $location, $ionicModal, Authentication, $firebaseAuth, $firebaseObject, $firebaseArray, FIREBASE_URL) {
  $rootScope.data = {
    message: null,
    categories: {
      income: [],
      expense: []
    }
  }

  var currentUserId = Authentication.getCurrentUserId()

  var budgetTrackerRef = new Firebase(FIREBASE_URL + 'users/' + currentUserId)
  // grab all data for expense category list
  var budgetTracker = $firebaseObject(budgetTrackerRef)
  //  ref link to categories

  $ionicModal.fromTemplateUrl('templates/categoryModal.html', {
    scope: $rootScope
  }).then(function (modal) {
    $rootScope.categoryModal = modal
  })
  $rootScope.$on('$destroy', function () {
    $rootScope.categoryModal.remove()
    console.log('Category modal destroyed')
  })
  $rootScope.$on('modal.hidden', function () {
    $rootScope.data.newCategoryName = ''
    console.log('Category modal hidden')
  })
  $rootScope.$on('modal.removed', function () {
    console.log('Category modal removed')
  })

  var categoryObj = {
    addIncome: function () {
      var budgetTrackerCategoryIncomeRef = new Firebase(FIREBASE_URL + 'users/' + currentUserId + '/budgettracker/categories/income')
      var budgetTrackerCategoryIncome = $firebaseArray(budgetTrackerCategoryIncomeRef)
      //  load existing income categories from database
      if (budgetTrackerCategoryIncome !== undefined) $rootScope.data.categories.income = budgetTrackerCategoryIncome
      $rootScope.data.incomeTotal += $rootScope.data.incomeValue
      var budgetTrackerIncomeRef = new Firebase(FIREBASE_URL + 'users/' + currentUserId + '/budgettracker/income')
      var budgetTrackerIncomeTotalRef = new Firebase(FIREBASE_URL + 'users/' + currentUserId + '/budgettracker/incometotal')

      // grab all data from user
      var budgetTrackerIncome = $firebaseArray(budgetTrackerIncomeRef)

      //  add item to database
      budgetTrackerIncome.$add({
        category: $rootScope.data.selectedCategoryIncome,
        value: $rootScope.data.incomeValue,
        date: Firebase.ServerValue.TIMESTAMP
      })

      // increment the income total
      var newIncomeTotal = $rootScope.currentUser.budgettracker.incometotal.total + $rootScope.data.incomeValue
      budgetTrackerIncomeTotalRef.set({
        total: newIncomeTotal,
        date: Firebase.ServerValue.TIMESTAMP
      })
      $rootScope.data.incomeTotal = newIncomeTotal
      //  update balance
      var balanceValue = $rootScope.data.incomeTotal - $rootScope.data.expenseTotal
      $rootScope.data.balance = balanceValue

      //  increment total value of category
      var selectedCategory = $rootScope.data.selectedCategoryIncome
      var incomeIndex = 0
      budgetTrackerCategoryIncome.forEach(function (e) {
        if (e.name === selectedCategory) {
          $rootScope.data.categories.income[incomeIndex].totalValue += $rootScope.data.incomeValue
          console.log('Found it: ' + e.name)
        }
        incomeIndex++
      })
      //  console.log($rootScope.currentUser.budgettracker)
      $rootScope.data.selectedCategoryIncome = ''
      $rootScope.data.incomeValue = ''
      $location.path('/app')
    },
    addExpense: function () {
      var budgetTrackerExpenseRef = new Firebase(FIREBASE_URL + 'users/' + currentUserId + '/budgettracker/expense')
      var budgetTrackerExpenseTotalRef = new Firebase(FIREBASE_URL + 'users/' + currentUserId + '/budgettracker/expensetotal')
      // grab all data from user
      var budgetTrackerExpense = $firebaseArray(budgetTrackerExpenseRef)
      budgetTrackerExpense.$add({
        category: $rootScope.data.selectedCategoryExpense,
        value: $rootScope.data.expenseValue,
        date: Firebase.ServerValue.TIMESTAMP
      })
      var newExpenseTotal = $rootScope.currentUser.budgettracker.expensetotal.total + $rootScope.data.expenseValue
      budgetTrackerExpenseTotalRef.set({
        total: newExpenseTotal,
        date: Firebase.ServerValue.TIMESTAMP
      })
      $rootScope.data.expenseTotal = newExpenseTotal
      //  update balance
      var balanceValue = $rootScope.data.incomeTotal - $rootScope.data.expenseTotal
      $rootScope.data.balance = balanceValue

      //  update expense group total value
      var budgetTrackerExpenseCategoryRef = new Firebase(FIREBASE_URL + 'users/' + currentUserId + '/budgettracker/categories/expense/' + $rootScope.data.selectedCategoryExpense)

      budgetTrackerExpenseCategoryRef.once('value', function (snapshot) {
        var data = snapshot.val()
        budgetTrackerExpenseCategoryRef.set({
          name: $rootScope.data.selectedCategoryExpense,
          totalValue: data.totalValue + $rootScope.data.expenseValue,
          date: Firebase.ServerValue.TIMESTAMP
        })
      })
      $rootScope.data.selectedCategoryExpense = ''
      $rootScope.data.expenseValue = ''
      $location.path('/app')
    },
    createCategory: function (category, item) {
      var budgetTrackerCategoryIncomeRef = new Firebase(FIREBASE_URL + 'users/' + currentUserId + '/budgettracker/categories/income')
      var budgetTrackerCategoryIncome = $firebaseArray(budgetTrackerCategoryIncomeRef)
      //  load existing income categories from database
      if (budgetTrackerCategoryIncome !== undefined) $rootScope.data.categories.income = budgetTrackerCategoryIncome

      var budgetTrackerCategoryExpenseRef = new Firebase(FIREBASE_URL + 'users/' + currentUserId + '/budgettracker/categories/expense')
      var budgetTrackerCategoryExpense = $firebaseArray(budgetTrackerCategoryExpenseRef)
      //  load existing expense categories from database
      if (budgetTrackerCategoryExpense !== undefined) $rootScope.data.categories.expense = budgetTrackerCategoryExpense

      category = category.toLowerCase()
      //  check to make sure that category does not exist
      var existingCategoryList = $rootScope.data.categories[category]
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
        var budgetTrackerCategoryRef = new Firebase(FIREBASE_URL + 'users/' + currentUserId + '/budgettracker/categories/' + category + '/' + item)
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

        $rootScope.data.categories[category].push(item)
        if (category === 'income') {
          $rootScope.data.selectedCategoryIncome = item.name
        } else if (category === 'expense') {
          $rootScope.data.selectedCategoryExpense = item.name
        }
      }
      $rootScope.categoryModal.hide()
      //$rootScope.data.newCategoryName = ''
    },
    showCategoryModal: function (title) {
      $rootScope.data.itemsTitle = title
      $rootScope.categoryModal.show()
    },
    getCategories: function () {
      var budgetTrackerCategoryIncomeRef = new Firebase(FIREBASE_URL + 'users/' + currentUserId + '/budgettracker/categories/income')
      var budgetTrackerCategoryIncome = $firebaseArray(budgetTrackerCategoryIncomeRef)
      //  load existing income categories from database
      if (budgetTrackerCategoryIncome !== undefined) $rootScope.data.categories.income = budgetTrackerCategoryIncome

      var budgetTrackerCategoryExpenseRef = new Firebase(FIREBASE_URL + 'users/' + currentUserId + '/budgettracker/categories/expense')
      var budgetTrackerCategoryExpense = $firebaseArray(budgetTrackerCategoryExpenseRef)
      //  load existing expense categories from database
      if (budgetTrackerCategoryExpense !== undefined) $rootScope.data.categories.expense = budgetTrackerCategoryExpense
    }
  }
  return categoryObj
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
      BudgetTracker.getExpenseCategories(currentUserId)
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
      $scope.getExpenseItemList = function (item) {
        BudgetTracker.getExpenseItemList(currentUserId, item)
      }
      $scope.deleteItem = function (category, obj, id) {
        BudgetTracker.deleteItem(currentUserId, category, obj, id)
      }
    } // if authUser==========================================================
  })
}])

myApp.controller('CategoryController', ['$scope', 'Authentication', 'Category', '$firebaseAuth', 'FIREBASE_URL', function ($scope, Authentication, Category, $firebaseAuth, FIREBASE_URL) {
  // create ref to Firebase data
  var ref = new Firebase(FIREBASE_URL)
  // create authentication Firebase object with the ref to the database location
  var auth = $firebaseAuth(ref)

  auth.$onAuth(function (authUser) {
    if (authUser) {
      Category.getCategories()

      $scope.addIncome = function () {
        Category.addIncome()
      }
      $scope.addExpense = function () {
        Category.addExpense()
      }
      $scope.createCategory = function (category, item) {
        Category.createCategory(category, item)
      }
      $scope.showCategoryModal = function (title) {
        Category.showCategoryModal(title)
      }
    } // if authUser
  })
}])
