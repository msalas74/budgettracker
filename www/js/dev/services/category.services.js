myApp.factory('Category', ['$rootScope', '$location', '$ionicModal', 'Authentication', '$firebaseAuth', '$firebaseObject', '$firebaseArray', 'FIREBASE_URL', function ($rootScope, $location, $ionicModal, Authentication, $firebaseAuth, $firebaseObject, $firebaseArray, FIREBASE_URL) {
  $rootScope.data = {
    message: null,
    categories: {
      income: [],
      expense: []
    }
  }

  var currentUserId = Authentication.getCurrentUserId()

  var budgetTrackerRef = new Firebase(FIREBASE_URL + 'users/' + currentUserId)
  // grab all data for expense category list
  var budgetTracker = $firebaseObject(budgetTrackerRef)
  //  ref link to categories

  $ionicModal.fromTemplateUrl('templates/categoryModal.html', {
    scope: $rootScope
  }).then(function (modal) {
    $rootScope.categoryModal = modal
  })
  $rootScope.$on('$destroy', function () {
    $rootScope.categoryModal.remove()
    console.log('Category modal destroyed')
  })
  $rootScope.$on('modal.hidden', function () {
    $rootScope.data.newCategoryName = ''
    console.log('Category modal hidden')
  })
  $rootScope.$on('modal.removed', function () {
    console.log('Category modal removed')
  })

  var categoryObj = {
    addIncome: function () {
      var budgetTrackerCategoryIncomeRef = new Firebase(FIREBASE_URL + 'users/' + currentUserId + '/budgettracker/categories/income')
      var budgetTrackerCategoryIncome = $firebaseArray(budgetTrackerCategoryIncomeRef)
      //  load existing income categories from database
      if (budgetTrackerCategoryIncome !== undefined) $rootScope.data.categories.income = budgetTrackerCategoryIncome
      $rootScope.data.incomeTotal += $rootScope.data.incomeValue
      var budgetTrackerIncomeRef = new Firebase(FIREBASE_URL + 'users/' + currentUserId + '/budgettracker/income')
      var budgetTrackerIncomeTotalRef = new Firebase(FIREBASE_URL + 'users/' + currentUserId + '/budgettracker/incometotal')

      // grab all data from user
      var budgetTrackerIncome = $firebaseArray(budgetTrackerIncomeRef)

      //  add item to database
      budgetTrackerIncome.$add({
        category: $rootScope.data.selectedCategoryIncome,
        value: $rootScope.data.incomeValue,
        date: Firebase.ServerValue.TIMESTAMP
      })

      // increment the income total
      var newIncomeTotal = $rootScope.currentUser.budgettracker.incometotal.total + $rootScope.data.incomeValue
      budgetTrackerIncomeTotalRef.set({
        total: newIncomeTotal,
        date: Firebase.ServerValue.TIMESTAMP
      })
      $rootScope.data.incomeTotal = newIncomeTotal
      //  update balance
      var balanceValue = $rootScope.data.incomeTotal - $rootScope.data.expenseTotal
      $rootScope.data.balance = balanceValue

      //  increment total value of category
      var selectedCategory = $rootScope.data.selectedCategoryIncome
      var incomeIndex = 0
      budgetTrackerCategoryIncome.forEach(function (e) {
        if (e.name === selectedCategory) {
          $rootScope.data.categories.income[incomeIndex].totalValue += $rootScope.data.incomeValue
          console.log('Found it: ' + e.name)
        }
        incomeIndex++
      })
      //  console.log($rootScope.currentUser.budgettracker)
      $rootScope.data.selectedCategoryIncome = ''
      $rootScope.data.incomeValue = ''
      $location.path('/app')
    },
    addExpense: function () {
      var budgetTrackerExpenseRef = new Firebase(FIREBASE_URL + 'users/' + currentUserId + '/budgettracker/expense')
      var budgetTrackerExpenseTotalRef = new Firebase(FIREBASE_URL + 'users/' + currentUserId + '/budgettracker/expensetotal')
      // grab all data from user
      var budgetTrackerExpense = $firebaseArray(budgetTrackerExpenseRef)
      budgetTrackerExpense.$add({
        category: $rootScope.data.selectedCategoryExpense,
        value: $rootScope.data.expenseValue,
        date: Firebase.ServerValue.TIMESTAMP
      })
      var newExpenseTotal = $rootScope.currentUser.budgettracker.expensetotal.total + $rootScope.data.expenseValue
      budgetTrackerExpenseTotalRef.set({
        total: newExpenseTotal,
        date: Firebase.ServerValue.TIMESTAMP
      })
      $rootScope.data.expenseTotal = newExpenseTotal
      //  update balance
      var balanceValue = $rootScope.data.incomeTotal - $rootScope.data.expenseTotal
      $rootScope.data.balance = balanceValue

      //  update expense group total value
      var budgetTrackerExpenseCategoryRef = new Firebase(FIREBASE_URL + 'users/' + currentUserId + '/budgettracker/categories/expense/' + $rootScope.data.selectedCategoryExpense)

      budgetTrackerExpenseCategoryRef.once('value', function (snapshot) {
        var data = snapshot.val()
        budgetTrackerExpenseCategoryRef.set({
          name: $rootScope.data.selectedCategoryExpense,
          totalValue: data.totalValue + $rootScope.data.expenseValue,
          date: Firebase.ServerValue.TIMESTAMP
        })
      })
      $rootScope.data.selectedCategoryExpense = ''
      $rootScope.data.expenseValue = ''
      $location.path('/app')
    },
    createCategory: function (category, item) {
      var budgetTrackerCategoryIncomeRef = new Firebase(FIREBASE_URL + 'users/' + currentUserId + '/budgettracker/categories/income')
      var budgetTrackerCategoryIncome = $firebaseArray(budgetTrackerCategoryIncomeRef)
      //  load existing income categories from database
      if (budgetTrackerCategoryIncome !== undefined) $rootScope.data.categories.income = budgetTrackerCategoryIncome

      var budgetTrackerCategoryExpenseRef = new Firebase(FIREBASE_URL + 'users/' + currentUserId + '/budgettracker/categories/expense')
      var budgetTrackerCategoryExpense = $firebaseArray(budgetTrackerCategoryExpenseRef)
      //  load existing expense categories from database
      if (budgetTrackerCategoryExpense !== undefined) $rootScope.data.categories.expense = budgetTrackerCategoryExpense

      category = category.toLowerCase()
      //  check to make sure that category does not exist
      var existingCategoryList = $rootScope.data.categories[category]
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
        var budgetTrackerCategoryRef = new Firebase(FIREBASE_URL + 'users/' + currentUserId + '/budgettracker/categories/' + category + '/' + item)
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

        $rootScope.data.categories[category].push(item)
        if (category === 'income') {
          $rootScope.data.selectedCategoryIncome = item.name
        } else if (category === 'expense') {
          $rootScope.data.selectedCategoryExpense = item.name
        }
      }
      $rootScope.categoryModal.hide()
      //$rootScope.data.newCategoryName = ''
    },
    showCategoryModal: function (title) {
      $rootScope.data.itemsTitle = title
      $rootScope.categoryModal.show()
    },
    getCategories: function () {
      var budgetTrackerCategoryIncomeRef = new Firebase(FIREBASE_URL + 'users/' + currentUserId + '/budgettracker/categories/income')
      var budgetTrackerCategoryIncome = $firebaseArray(budgetTrackerCategoryIncomeRef)
      //  load existing income categories from database
      if (budgetTrackerCategoryIncome !== undefined) $rootScope.data.categories.income = budgetTrackerCategoryIncome

      var budgetTrackerCategoryExpenseRef = new Firebase(FIREBASE_URL + 'users/' + currentUserId + '/budgettracker/categories/expense')
      var budgetTrackerCategoryExpense = $firebaseArray(budgetTrackerCategoryExpenseRef)
      //  load existing expense categories from database
      if (budgetTrackerCategoryExpense !== undefined) $rootScope.data.categories.expense = budgetTrackerCategoryExpense
    }
  }
  return categoryObj
}])
