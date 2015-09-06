var phonecatApp = angular.module('phonecatApp', []);

phonecatApp.controller('PhoneListCtrl', function ($scope, $http) {
	$http.get('phones-angular/phones.json').success(function(data) {
		$scope.phones = data.splice(0,3);
	});
  	$scope.orderProp = 'age';
  	$scope.name = "World";
});