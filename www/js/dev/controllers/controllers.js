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
