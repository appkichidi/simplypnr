'use strict';

/* Controllers */

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-44068589-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

function trackPNRSearch(eleId,tag) {
	//console.log('Tracking-'+eleId+tag);
    _gaq.push(['_trackEvent', eleId, tag]);
 };

 function trackNewUser(){
	chrome.storage.local.get('installed',function(data){
		if(!data.installed){
			trackPNRSearch('new-user','install');
			chrome.storage.local.set({'installed':'1'},function(data){
				//console.log('After set-'+data);
			});
		}
	});
	chrome.storage.local.get('installedv2',function(data){
		if(!data.installedv2){
			trackPNRSearch('new-user-v2','install');
			chrome.storage.local.set({'installedv2':'1'},function(data){
				//console.log('After set-'+data);
			});
		}
	});

	if(chrome.runtime){
		var ver=chrome.runtime.getManifest().version;
		chrome.storage.local.get('vnum',function(data){
			if(!data.vnum){
				trackPNRSearch('vnum',ver);
				chrome.storage.local.set({'vnum':ver},function(data){
					//console.log('After set-'+data);
				});
			}
		});
	}

}

function toPNRJson(data,pnrNum,dangerArr){
	var pnrJson={'train':{},'pnr':{}};
	var html = $(data);
	var trndtls = $(data).find('.table_border_both');
	if(trndtls){
		var train={};
		var tr = $('<tr/>');
		var trnNumber = trndtls[0].innerHTML;
		trnNumber = trnNumber.replace('*','');
		train.number=trnNumber;
		train.name=$.trim(trndtls[1].innerHTML);
		train.boardingDate=$.trim(trndtls[2].innerHTML);
		train.class=$.trim(trndtls[7].innerHTML);
		train.from=$.trim(trndtls[3].innerHTML);
		train.to=$.trim(trndtls[4].innerHTML);
		train.upto=$.trim(trndtls[5].innerHTML);
		train.boardFrom=$.trim(trndtls[6].innerHTML);
		pnrJson.train=train;
	}
	var passengers=[];
	var rowpsngrdata = $(data).find('#center_table').find('tr');
	var isLastRow=false;
	$.each(rowpsngrdata,function(idx,val){
		if(isLastRow){
			return;
		}
		var row=$(val).find('td');
		var firstCol=$.trim($(row[0]).text());
		if(firstCol.indexOf('Charting') != -1){
			isLastRow=true;
		}
		//if(idx >0 && idx < (rowpsngrdata.length-2)){
		  if(idx >0 && !isLastRow){ 	
			var passenger={};
			row=$(val).find('td');
			passenger.name=$(row[0]).text();
			var bookingStatus=$(row[1]).text();
			var bookingQuota='';
			bookingStatus=bookingStatus.substr(0,bookingStatus.lastIndexOf(','));
			passenger.bookingStatus=bookingStatus;
			passenger.currentStatus=$(row[2]).text();
			passenger.isConfirmedTkt=true;
			$.each(dangerArr,function(idx,val){
				if(passenger.currentStatus.toLowerCase().indexOf(val.toLowerCase()) != -1){
					passenger.isConfirmedTkt=false;
				}
			});
			if(row.length > 3){
				passenger.coachPosition=$(row[3]).text();
				pnrJson.pnr.hasCoachPosition=true;
			}
			passengers.push(passenger);
		}else {//if(idx == (rowpsngrdata.length-2)){
			var row=$(val).find('td');
			var chartStr=$(row[1]).html();
			if(chartStr.toLowerCase().indexOf('not') == -1){
				pnrJson.pnr.charting='Y';
			}else{
				pnrJson.pnr.charting='N';
			}
		}
	});
	pnrJson.pnr.number=pnrNum;
	pnrJson.pnr.passengers=passengers;
	return pnrJson;
}

function inArray(ele,arr){
	var flag=-1;
	if(arr){
		$.each(arr,function(idx,val){
			if(ele === val.num){
				flag=idx;
			}
		});
	}
	return flag;
}

function storePNRData(pnrdata,scope){
	var train=pnrdata.train;
	chrome.storage.local.get('pnr',function(data){
		 if(inArray(pnrdata.pnr.number,data.pnr) == -1){
		 	
		 	if(!data.pnr){data.pnr=[];}
		 	if(data.pnr.length > 3){
		 		data.pnr.splice(0,1);
		 	}
		 	var pnrobj={num:pnrdata.pnr.number,train:train.name,jdate:train.boardingDate};
		 	data.pnr.push(pnrobj);
		 	chrome.storage.local.set({pnr:data.pnr},function(data){scope.loadRecentPNR()});
		 }
	});
}

angular.module('myApp.controllers', []).
  controller('MyCtrl1', [function() {

  }])
  .controller('MyCtrl2', [function() {

  }])
  .controller('PNRCtrl',['$scope','$http','PNRService',function($scope,$http,pnrService){
  		trackNewUser();
  	    $scope.online=navigator.onLine;
  		$scope.pnrform='';
  		$scope.lccp_pnrno1='';
  		$scope.startFlag=false;
  		$scope.inProgress=false;
  		$scope.validpnrresponse=true;
  		$scope.train={};
  		$scope.recentpnr=[];
  		$scope.dangerArr = ['Can/Mod','CAN/MOD','CAN / MOD','RAC','WL','W/L',
  							'RLWL','GNWL','PQWL','REGRET/WL','RELEASED'];

  		$scope.loadRecentPNR=function(){
  			if(chrome && chrome.storage){
	  			var recentpnr=[];
	  			chrome.storage.local.get('pnr',function(data){
	  				$.each(data.pnr,function(idx,val){
	  					var jdate = val.jdate.replace(/\s+/g, '');//jrny date
	  					var tooltip={};
	  					tooltip.pnr=val.num;
	  					tooltip.train=val.train;
	  					tooltip.jdate=jdate;
	  					recentpnr.push(tooltip);
	  				});
	  				$scope.recentpnr=recentpnr;
	  				$scope.$apply();
	  				pnrService.recentpnr=recentpnr;
	  			});
	  		}
  		}					
  		$scope.loadRecentPNR();

  		$scope.autoLoadRecentPNR=function(){
  			chrome.storage.local.get('allpnr',function(data){
  				if(data.allpnr && data.allpnr==1){
  					$scope.allPnrFlag=true;
  					$scope.$apply();
  					$scope.onAllRecentPNR();
  				}
  			});
  		}
  		$scope.autoLoadRecentPNR();
  
  		$scope.$root.$broadcast('progress',true);
  		$scope.getPNRStatus=function(){
  			$scope.startFlag=true;
  			$scope.validpnrresponse=true;
  			var data = $scope.lccp_pnrno1;
  			var form = $scope.pnrForm;
  			if(data && data.length > 0){
  				var pnr = $scope.lccp_pnrno1;
	  		}
  			if(form.$valid){
  				if(data){
  					data=data.replace(/-/g,'');
  				}
  				$scope.fetchPNRStatus(data);
  			}else{
  				trackPNRSearch('click-pnr-err',data);
  				$scope.$root.$broadcast('shouldshow',false);
  			}
  		}

  		$scope.fetchPNRStatus=function(pnrnum){
  			trackPNRSearch('click-enter','start');
  			$scope.inProgress=true;
  			$scope.$root.$broadcast('progress',true);
  			$scope.validpnrresponse=true;
  			var data='lccp_pnrno1='+pnrnum;
  			pnrService.getStatus(pnrnum,function(status,data){
  				$scope.$root.$broadcast('progress',false);
  				if(status){
  					var data = toPNRJson(data,$scope.lccp_pnrno1,$scope.dangerArr);
					$scope.train=data.train;
					$scope.$root.$broadcast('data',data);
					storePNRData(data,$scope);
					trackPNRSearch('click-done','done');
  				}else{
  					$scope.validpnrresponse=false;
  					trackPNRSearch('click-fail','fail');
  				}
  			},function(){
  				$scope.$root.$broadcast('progress',false);
  				$scope.validpnrresponse=false;
  				trackPNRSearch('click-fail','fail');
  			});
  		}

  		$scope.onRecentPNR=function(pnr){
  			$scope.fetchPNRStatus(pnr);
  			$scope.lccp_pnrno1=pnr;
  		}

  		$scope.onAllRecentPNR=function(){
  			if($scope.allPnrFlag){
  				chrome.storage.local.set({allpnr:'1'},function(data){});
  				$scope.$root.$broadcast('progress',true);
	  			$scope.$root.$broadcast('allpnr',$scope.recentpnr);
	  			//$scope.$root.$broadcast('progress',false);
  			}else{
  				chrome.storage.local.set({allpnr:'0'},function(data){});
  			}
  		}


  		$scope.onRemoveRecentPNR=function(pnr){
  			chrome.storage.local.get('pnr',function(data){
				var idx = inArray(pnr,data.pnr);
				data.pnr.splice(idx,1);
				chrome.storage.local.set({pnr:data.pnr},function(data){$scope.loadRecentPNR();});
			});
  		}
  }])
  .controller('PNRDtlCtrl',['$scope','PNRService',function($scope,pnrService){
  		$scope.oneAtATime=true;
  		$scope.shouldShow=false;
  		$scope.validpnrresponse=true;
  		//$scope.train={};
  		//$scope.pnr={};
  		$scope.chartingDone=false;
  		$scope.recentpnr=[];
  		$scope.allpnrdata=[];


  		$scope.fetchPNRStatus=function(pnrnum){
  			
  		}


  		$scope.$on('data',function(ascope,data){
  			if(data){
  				$scope.allpnrdata=[];
  				//$scope.train=data.train;
  				//$scope.pnr=data.pnr;
  				var charting=data.pnr.charting;
  				if(charting == 'N'){
  					$scope.chartingDone=false;
  				}else if(charting == 'Y'){
  					$scope.chartingDone=true;
  				}
  				$scope.shouldShow=true;
  				data.charting=$scope.charting;
  				$scope.allpnrdata.push(data);
  			}
  		});

  		$scope.$on('shouldshow',function(ascope,flag){
 				$scope.shouldShow=flag;
 		});
  		$scope.$on('progress',function(ascope,flag){
 			if(flag){
 				$scope.shouldShow=false;
 			}
 		});
 		$scope.$on('allpnr',function(ascope,allpnr){
 			$scope.allpnrdata=[];
 			$.each(allpnr,function(idx,val){
 				pnrService.getStatus(val.pnr,function(status,data){
 					$scope.$root.$broadcast('progress',false);
 					if(status){
	  					$scope.shouldShow=true;
	  					var data = toPNRJson(data,val.pnr,$scope.dangerArr);
	  					var charting=data.pnr.charting;
		  				if(charting == 'N'){
		  					data.chartingDone=false;
		  				}else if(charting == 'Y'){
		  					data.chartingDone=true;
		  				}
						$scope.allpnrdata.push(data);
	  				}else{
	  					
	  				}
	  			});
 			});
 			//$scope.$root.$broadcast('progress',false);
 		});
  }]);