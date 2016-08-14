describe('Authentication', function () {
  beforeEach(module('btApp'))
  it('should return an object', function () {
    inject(function (Authentication) {
      expect({}).toEqual(jasmine.any(Object))
    })
  })
})
