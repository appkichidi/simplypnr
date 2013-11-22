'use strict';

/* Directives */


angular.module('myApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]).
  directive('queryBar',function(){
  	 return {
  	 	restrict: 'A',
  	 	replace: false,
  	 	transclude: true,
  	 	templateUrl: 'partials/pnr-query.html',
  	 	controller: function($scope){
  	 		$scope.pnr='';
  			$scope.getPNRStatus=function(){
  				//console.log('PNR Val is:'+$scope.pnr);
  			}
  	 	}
  	 }	
  }).
  directive('loader',function(){
  	 return{
  	 	restrict: 'A',
  	 	replace: false,
  	 	transclude: true,
  	 	templateUrl: 'partials/loading.html',
  	 	scope: {inProgress:'='},
  	 	link: function(scope,element){
  	 		if(!scope.inProgress){
  	 			element.addClass('hide');
  	 		}
  	 		scope.$on('progress',function(ascope,flag){
  	 			if(flag){
  	 				element.removeClass('hide');
  	 			}else{
  	 				element.addClass('hide');
  	 			}
  	 		})
  	 	}
  	 }
  }).
  directive('trainSchedule',['PNRService',function(pnrService){
  	  return {
  	  	restrict: 'A',
        replace:false,
        transclude:true,
        templateUrl:'partials/train-schedule.html',
        scope:{trainData:'@trainDetail'},
        link:function(scope,element,attrs){
            scope.trainSchdl={};
            scope.$watch('trainData', function (newVal) {
                var trainDtl = JSON.parse(newVal);
                pnrService.getTrainSchedule(trainDtl,function(status,data){
                    scope.trainSchdl=data;
                });
            });
        }
  	  }	
  }]).
  directive('pnrfocus',[function(){
      return {
        restrict: 'A',
        replace:false,
        link:function(scope,element,attrs){
          console.log(element);
          element.focus();
        }
      } 
  }]);
