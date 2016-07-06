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
    categories: [
      'Groceries',
      'Eating Out',
      'Gas',
      'Shopping'
    ],
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
  $scope.showModal = function (title) {
    $scope.data.listTitle = title
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
    categories: [
      'Groceries',
      'Eating Out',
      'Gas',
      'Shopping'
    ],
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
    ]
  }
  $scope.createCategory = function (category) {
    $scope.data.categories.push(category)
    $rootScope.data.selectedcategory = category
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
    console.log('modal destroyed')
  })
  $scope.$on('modal.hidden', function () {
    $rootScope.data.modalCategory = ''
    console.log('modal hidden')
  })
  $scope.$on('modal.removed', function () {
    console.log('modal removed')
  })
}])
