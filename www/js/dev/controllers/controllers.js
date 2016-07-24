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
