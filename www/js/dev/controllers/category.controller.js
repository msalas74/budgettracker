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
