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

myApp.controller('AppController', ['$scope', '$ionicModal', 'Authentication', '$http', '$rootScope', '$firebaseAuth', '$firebaseArray', '$firebaseObject', 'FIREBASE_URL', function ($scope, $ionicModal, Authentication, $http, $rootScope, $firebaseAuth, $firebaseObject, $firebaseArray, FIREBASE_URL) {
  $rootScope.data = {
    message: null
  }

  // create ref to Firebase data
  var ref = new Firebase(FIREBASE_URL)
  // create authentication Firebase object with the ref to the database location
  var auth = $firebaseAuth(ref)

  auth.$onAuth(function (authUser) {
    if (authUser) {
      //  expense total
      var budgetTrackerExpenseTotalRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/budgettracker/expensetotal')
      if (budgetTrackerExpenseTotalRef) {
        budgetTrackerExpenseTotalRef.once('value', function (snapshot) {
          var data = snapshot.val()
          $rootScope.data.expenseTotal = data.total
        })
      }

      //  income total
      var budgetTrackerIncomeTotalRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/budgettracker/incometotal')
      if (budgetTrackerIncomeTotalRef) {
        budgetTrackerIncomeTotalRef.once('value', function (snapshot) {
          var data = snapshot.val()
          $rootScope.data.incomeTotal = data.total
        })
      }
      //  balance
      var balanceValue = $rootScope.data.incomeTotal - $rootScope.data.expenseTotal
      $rootScope.data.balance = balanceValue

      //  expense list
      var budgetTrackerExpenseRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/budgettracker/expense')
      var budgetTrackerExpenseList = $firebaseArray(budgetTrackerExpenseRef)
      //  TODO
      $rootScope.data.expenses = budgetTrackerExpenseList

      //  income list
      var budgetTrackerIncomeRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/budgettracker/income')
      var budgetTrackerIncomeList = $firebaseArray(budgetTrackerIncomeRef)
      $rootScope.data.incomes = budgetTrackerIncomeList

      //  get category list for income and expense
      var budgetTrackerCategoryIncomeRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/budgettracker/categories/income')
      var budgetTrackerCategoryIncomeList = $firebaseArray(budgetTrackerCategoryIncomeRef)
      $rootScope.data.incomesCategory = budgetTrackerCategoryIncomeList

      $scope.logout = function () {
        Authentication.logout()
      }
      $scope.showGraph = function () {
        Authentication.showGraph()
      }
      $scope.showAddIncome = function () {
        Authentication.showAddIncome()
      }
      $scope.showAddExpense = function () {
        Authentication.showAddExpense()
      }
      $scope.showModal = function (title) {
        title = title.toLowerCase()
        $scope.data.listTitle = title
        if (title === 'expense') {
          $rootScope.data.itemsList = budgetTrackerExpenseList
        } else if (title === 'income') {
          $rootScope.data.itemsList = budgetTrackerIncomeList
        }
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
    } // if authUser
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

        //  add new category if required

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

        $location.path('/app')
      }
      $scope.createCategory = function (category, item) {
        category = category.toLowerCase()
        var budgetTrackerCategoryRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/budgettracker/categories/' + category)
        var budgetTrackerCategory = $firebaseArray(budgetTrackerCategoryRef)
        //  add new category
        budgetTrackerCategory.$add({
          name: item,
          date: Firebase.ServerValue.TIMESTAMP
        })
        $scope.data.categories[category].push(item)
        if (category === 'income') {
          $rootScope.data.selectedCategoryIncome = item
        } else if (category === 'expense') {
          $rootScope.data.selectedCategoryExpense = item
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
