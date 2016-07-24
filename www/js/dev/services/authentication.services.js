myApp.factory('Authentication', ['$rootScope', '$location', '$firebaseAuth', '$firebaseObject', 'FIREBASE_URL', '$ionicNavBarDelegate', '$ionicHistory', function ($rootScope, $location, $firebaseAuth, $firebaseObject, FIREBASE_URL, $ionicNavBarDelegate, $ionicHistory) {
  var ref = new Firebase(FIREBASE_URL)
  var auth = $firebaseAuth(ref)

  $rootScope.data = {
    message: null
  }

  auth.$onAuth(function (authUser) {
    if (authUser) {
      // grab the authenticated user id
      var userRef = new Firebase(FIREBASE_URL + 'users/' + authUser.uid)
      // grab all the data of the current user
      var userObj = $firebaseObject(userRef)
      // expose the data to AngularJS
      $rootScope.currentUser = userObj
      //  console.log($rootScope.currentUser)
    } else {
      $rootScope.currentUser = null
      $rootScope.data.message = null
    }
  })

  var authObj = {
    login: function (user) {
      if (user) {
        auth.$authWithPassword({
          email: user.email,
          password: user.password
        }).then(function (regUser) {
          //  $ionicNavBarDelegate.showBackButton(false)
          $location.path('/app')
          $rootScope.data.message = 'You are currently logged in.'
          // load all data
          //  Prevent back navigation button to appear in the main application view
          $ionicHistory.nextViewOptions({
            disableBack: true
          })
        }).catch(function (error) {
          $rootScope.data.message = error.message
        })
      } else {
        console.log('login failed')
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
        $rootScope.data.message = error.message
      })
    },
    showGraph: function () {
      $ionicNavBarDelegate.showBackButton(true)
      $location.path('/infographic')
    },
    showAddIncome: function () {
      $ionicNavBarDelegate.showBackButton(true)
      $location.path('/income')
    },
    showAddExpense: function () {
      $ionicNavBarDelegate.showBackButton(true)
      $location.path('/expense')
    }
  }

  return authObj
}])

