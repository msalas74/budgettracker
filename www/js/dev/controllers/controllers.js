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

myApp.controller('AppController', ['$scope', 'Authentication', '$http', '$rootScope', '$firebaseAuth', '$firebaseArray', 'FIREBASE_URL', function ($scope, Authentication, $http, $rootScope, $firebaseAuth, $firebaseArray, FIREBASE_URL) {
  $rootScope.data = {
    budget: 0,
    expense: 0,
    message: null,
    balance: 100,
    items: [
      {
        'category': 'Groceries',
        'cost': 250
      },
      {
        'category': 'Eating Out',
        'cost': 50
      },
      {
        'category': 'Gas',
        'cost': 40
      },
      {
        'category': 'Shopping',
        'cost': 120
      }
    ]
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
}])
