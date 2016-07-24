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
