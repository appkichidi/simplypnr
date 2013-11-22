'use strict';

console.log('App load start-');
// Declare app level module which depends on filters, and services
angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'myApp.controllers','ui.bootstrap']).
  config(['$routeProvider', function($routeProvider) {
  	$routeProvider.when('/pnr', {templateUrl: 'partials/pnr-query.html', controller: 'PNRCtrl'});
    $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'MyCtrl1'});
    $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
    $routeProvider.otherwise({redirectTo: '/pnr'});
  }]);

