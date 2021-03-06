myApp.factory('BudgetTracker', ['$rootScope', '$location', 'Authentication', 'Loader', '$firebaseAuth', '$firebaseArray', '$firebaseObject', 'FIREBASE_URL', '$ionicNavBarDelegate', '$ionicModal', function ($rootScope, $location, Authentication, Loader, $firebaseAuth, $firebaseObject, $firebaseArray, FIREBASE_URL, $ionicNavBarDelegate, $ionicModal) {
  $rootScope.data = {
    message: null
  }

  //  data variable for bulletChart
  $rootScope.bulletChart = {}
  $rootScope.bulletChart.options = {}
  $rootScope.bulletChart.data = {}
  $rootScope.bulletChart.options = {
    chart: {
      type: 'bulletChart',
      duration: 1000,
      height: 50,
      color: '7F0000'
    }
  }

  $rootScope.bulletChart.data = {
    'title': 'Balance',
    'subtitle': 'US$',
    'ranges': [0, 0, $rootScope.bulletChart.data.incomeTotal || 0],
    'measures': [$rootScope.bulletChart.data.expenseTotal || 0],
    'markers': [],
    'rangeLabels': ['Income', '', '']
  }

  //  D3JS
  $rootScope.vm = {}
  $rootScope.vm.options = {}
  $rootScope.vm.data = {}
  $rootScope.vm.options = {
    chart: {
      type: 'pieChart',
      height: 500,
      x: function (d) { return d.key },
      y: function (d) { return d.y },
      showLabels: true,
      duration: 1000,
      labelThreshold: 0.01,
      labelSunbeamLayout: true,
      legend: {
        margin: {
          top: 5,
          right: 35,
          bottom: 5,
          left: 0
        }
      }
    }
  }

  $ionicModal.fromTemplateUrl('templates/itemListModal.html', {
    scope: $rootScope
  }).then(function (modal) {
    $rootScope.modal = modal
  })
  $rootScope.$on('$destroy', function () {
    $rootScope.modal.remove()
    //console.log('modal destroyed')
  })
  $rootScope.$on('modal.hidden', function () {
    $rootScope.data.modalCategory = ''
    //console.log('modal hidden')
  })
  $rootScope.$on('modal.removed', function () {
    //console.log('modal removed')
  })
  $rootScope.$on('$ionicView.enter', function (event, data) {
    //console.log('View: ', data.title)
  })

  //  subcategory modal
  $ionicModal.fromTemplateUrl('templates/subCategoryListModal.html', {
    scope: $rootScope
  }).then(function (modal) {
    $rootScope.subCategoryModal = modal
  })
  $rootScope.$on('$destroy', function () {
    $rootScope.subCategoryModal.remove()
    //console.log('modal destroyed')
  })
  $rootScope.$on('modal.hidden', function () {
    $rootScope.data.modalCategory = ''
    //console.log('modal hidden')
  })
  $rootScope.$on('modal.removed', function () {
    //console.log('modal removed')
  })
  $rootScope.$on('$ionicView.enter', function (event, data) {
    //console.log('View: ', data.title)
  })

  var budgetObj = {
    showGraph: function () {
      $ionicNavBarDelegate.showBackButton(true)
      $location.path('/infographic')
    },
    setUpPieGraph: function (userId) {
      var budgetTrackerCategoryExpenseRef = new Firebase(FIREBASE_URL + 'users/' + userId + '/budgettracker/categories/expense')
      var d3Data = []
      budgetTrackerCategoryExpenseRef.once('value', function (snapshot) {
        var d3Item = {}
        snapshot.forEach(function (childSnapshot) {
          var data = childSnapshot.val()
          d3Item = {
            key: data.name,
            y: data.totalValue
          }
          d3Data.push(d3Item)
        })
      })
      $rootScope.vm.data = d3Data
    },
    showAddIncome: function () {
      $ionicNavBarDelegate.showBackButton(true)
      $location.path('/income')
    },
    showAddExpense: function () {
      $ionicNavBarDelegate.showBackButton(true)
      $location.path('/expense')
    },
    getExpenseList: function (userId) {
      // show loading
      Loader.showLoading()
      //  expense list
      var budgetTrackerExpenseRef = new Firebase(FIREBASE_URL + 'users/' + userId + '/budgettracker/expense')
      var budgetTrackerExpenseList = $firebaseArray(budgetTrackerExpenseRef)
      budgetTrackerExpenseList.$loaded()
      .then(function (fbArray) {
        Loader.hideLoading()
      })
      .catch(function (err) {
        Loader.hideLoading()
      })
      console.log(budgetTrackerExpenseList)
      return budgetTrackerExpenseList
    },
    getExpenseItemList: function (userId, item) {
      var budgetTrackerExpenseItemRef = new Firebase(FIREBASE_URL + 'users/' + userId + '/budgettracker/expense')
      var expenseListArray = []
      // show loading
      Loader.showLoading()
      budgetTrackerExpenseItemRef.orderByChild('category').equalTo(item).once('value', function (snapshot) {
        snapshot.forEach(function (data) {
          console.log(data.key() + ': ' + data.val().category + ': ' + data.val().value)
          expenseListArray.push({
            id: data.key(),
            category: data.val().category,
            value: data.val().value
          })
        })
        //  console.log(expenseListArray)
        $rootScope.data.itemsList = expenseListArray
        $rootScope.data.listTitle = 'expense'
        $rootScope.subCategoryModal.show()
        //  return expenseListArray
      })
      Loader.hideLoading()
    },
    getExpenseCategories: function (userId) {
      var expenseListArray = []
      //  list expense category groups
      var budgetTrackerCategoryExpenseRef = new Firebase(FIREBASE_URL + 'users/' + userId + '/budgettracker/categories/expense')
      //var budgetTrackerCategoryExpense = $firebaseArray(budgetTrackerCategoryExpenseRef)
      //$rootScope.data.expenses = budgetTrackerCategoryExpense

      budgetTrackerCategoryExpenseRef.once('value', function (snapshot) {
        snapshot.forEach(function (data) {
          if (data.val().totalValue > 0) {
            expenseListArray.push({
              id: data.key(),
              name: data.val().name,
              totalValue: data.val().totalValue
            })
          }
        })
      })
      //return budgetTrackerCategoryExpense
      console.log(expenseListArray)
      $rootScope.data.expenses = expenseListArray
      //return expenseListArray
    },
    getExpenseTotal: function () {
      //  expense total
      var budgetTrackerExpenseTotalRef = new Firebase(FIREBASE_URL + 'users/' + $rootScope.currentUser.$id + '/budgettracker/expensetotal')
      if (budgetTrackerExpenseTotalRef) {
        budgetTrackerExpenseTotalRef.once('value', function (snapshot) {
          var data = snapshot.exportVal()
          $rootScope.data.expenseTotal = data.total
          $rootScope.bulletChart.data.expenseTotal = data.total
        })
      }
    },
    getIncomeList: function (userId) {
      //  show loader
      Loader.showLoading()
      //  income list
      var budgetTrackerIncomeRef = new Firebase(FIREBASE_URL + 'users/' + userId + '/budgettracker/income')
      var budgetTrackerIncomeList = $firebaseArray(budgetTrackerIncomeRef)
      budgetTrackerIncomeList.$loaded()
      .then(function (fbArray) {
        Loader.hideLoading()
      })
      .catch(function (err) {
        Loader.hideLoading()
        console.log('Error: ' + err)
        return null
      })
      //console.log(budgetTrackerIncomeList)
      $rootScope.data.incomes = budgetTrackerIncomeList
      return budgetTrackerIncomeList
    },
    getIncomeTotal: function (userId) {
      //  income total
      var budgetTrackerIncomeTotalRef = new Firebase(FIREBASE_URL + 'users/' + userId + '/budgettracker/incometotal')
      if (budgetTrackerIncomeTotalRef) {
        budgetTrackerIncomeTotalRef.once('value', function (snapshot) {
          var data = snapshot.exportVal()
          $rootScope.data.incomeTotal = data.total
          $rootScope.bulletChart.data.incomeTotal = data.total
        })
      }
    },
    getBudgetBalance: function (userId) {
      //  income total
      var budgetTrackerIncomeTotalRef = new Firebase(FIREBASE_URL + 'users/' + userId + '/budgettracker/incometotal')
      if (budgetTrackerIncomeTotalRef) {
        budgetTrackerIncomeTotalRef.once('value', function (snapshot) {
          var data = snapshot.exportVal()
          $rootScope.data.incomeTotal = data.total
          $rootScope.bulletChart.data.incomeTotal = data.total

          //  expense total
          var budgetTrackerExpenseTotalRef = new Firebase(FIREBASE_URL + 'users/' + userId + '/budgettracker/expensetotal')
          if (budgetTrackerExpenseTotalRef) {
            budgetTrackerExpenseTotalRef.once('value', function (snapshot) {
              var data = snapshot.exportVal()
              $rootScope.data.expenseTotal = data.total
              $rootScope.bulletChart.data.expenseTotal = data.total

              $rootScope.bulletChart.data = {
                'title': 'Balance',
                'subtitle': 'US$',
                'ranges': [0, 0, $rootScope.bulletChart.data.incomeTotal || 0],
                'measures': [$rootScope.bulletChart.data.expenseTotal || 0],
                'markers': [],
                'rangeLabels': ['Income', '', ''],
                'measureLabels': ['Expense']
              }
              //  balance
              var balanceValue = $rootScope.data.incomeTotal - $rootScope.data.expenseTotal
              $rootScope.data.balance = balanceValue
            })
          }
        })
      }
    },
    deleteItem: function (userId, category, obj, id) {
      var item = new Firebase(FIREBASE_URL + 'users/' + userId + '/budgettracker/' + category + '/' + id)
      item.remove()
      if (category === 'income') {
        budgetObj.subtractFromIncome(obj, userId)
      } else if (category === 'expense') {
        budgetObj.subtractFromExpense(obj, userId)
      }
      $rootScope.modal.hide()
      $rootScope.subCategoryModal.hide()
      console.log('Deleting item id: ' + id + ' from ' + category)
    },
    subtractFromIncome: function (obj, userId) {
      var budgetTrackerIncomeTotalRef = new Firebase(FIREBASE_URL + 'users/' + userId + '/budgettracker/incometotal')
      // increment the income total
      var newIncomeTotal = $rootScope.currentUser.budgettracker.incometotal.total - obj.value
      budgetTrackerIncomeTotalRef.set({
        total: newIncomeTotal,
        date: Firebase.ServerValue.TIMESTAMP
      })
      $rootScope.data.incomeTotal = newIncomeTotal
      //  update balance
      var balanceValue = $rootScope.data.incomeTotal - $rootScope.data.expenseTotal
      $rootScope.data.balance = balanceValue
      // update bullet chart
      budgetObj.getBudgetBalance(userId)
    },
    subtractFromExpense: function (obj, userId) {
      var budgetTrackerExpenseTotalRef = new Firebase(FIREBASE_URL + 'users/' + userId + '/budgettracker/expensetotal')
      var newExpenseTotal = $rootScope.currentUser.budgettracker.expensetotal.total - obj.value
      budgetTrackerExpenseTotalRef.set({
        total: newExpenseTotal,
        date: Firebase.ServerValue.TIMESTAMP
      })
      $rootScope.data.expenseTotal = newExpenseTotal
      //  update balance
      var balanceValue = $rootScope.data.incomeTotal - $rootScope.data.expenseTotal
      $rootScope.data.balance = balanceValue

      //  update expense group total value
      var budgetTrackerExpenseCategoryRef = new Firebase(FIREBASE_URL + 'users/' + userId + '/budgettracker/categories/expense/' + obj.category)

      budgetTrackerExpenseCategoryRef.once('value', function (snapshot) {
        var data = snapshot.val()
        var sum = null
        sum = data.totalValue - obj.value
        budgetTrackerExpenseCategoryRef.set({
          name: obj.category,
          totalValue: sum,
          date: Firebase.ServerValue.TIMESTAMP
        })
      })

      // update list of subcategory totals
      budgetObj.getExpenseCategories(userId)
      //  update bullet chart
      budgetObj.getBudgetBalance(userId)
    },
    showModal: function (title, userId) {
      title = title.toLowerCase()
      $rootScope.data.listTitle = title
      if (title === 'expense') {
        $rootScope.data.itemsList = this.getExpenseList(userId)
      } else if (title === 'income') {
        $rootScope.data.itemsList = this.getIncomeList(userId)
      } else {
        $rootScope.data.itemsList = null
      }
      $rootScope.modal.show()
    }
  }
  return budgetObj
}])
