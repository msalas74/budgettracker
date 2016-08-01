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
