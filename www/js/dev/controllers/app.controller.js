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
      $scope.getExpenseItemList = function (item) {
        BudgetTracker.getExpenseItemList(currentUserId, item)
      }
      $scope.deleteItem = function (category, obj, id) {
        BudgetTracker.deleteItem(currentUserId, category, obj, id)
      }
    } // if authUser==========================================================
  })
}])
