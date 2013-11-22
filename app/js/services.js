'use strict';

/* Services */


Date.prototype.addDays = function(days)
{
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
}


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
  value('version', '0.1').
  service('PNRService',['$http',function($http){
  	var formatTime=function(inTime){
  		var outStr="";
  	 		if(inTime && inTime.length >0){
  	 			var inTimeStr=inTime;
  	 			inTimeStr=inTimeStr.replace(":","");
  	 			var inTimeNum=parseInt(inTimeStr);
  	 			if(inTimeNum > 1200){
  	 				inTimeNum=inTimeNum-1200;
            if(inTimeNum < 100){
              inTimeNum=inTimeNum+1200;
            }
            inTimeNum=inTimeNum+'';
  	 				if(inTimeNum.length == 3){
  	 					inTimeNum=inTimeNum.substr(0,1)+':'+inTimeNum.substr(1);
  	 				}else{
  	 					inTimeNum=inTimeNum.substr(0,2)+':'+inTimeNum.substr(2);
  	 				}
  	 				outStr=inTimeNum+' PM';
  	 			}else{
            if(inTime.indexOf('00') != -1){
              inTime=inTime.replace('00','12');
            }else if(inTime.indexOf('0') == 0){
  	 					inTime=inTime.replace('0','');
  	 				}
  	 				outStr=inTime+' AM';
  	 			}
  	 			return outStr;
  	 		}
  	 		return inTimeStr;
  	 	}

  	 var getTravelTime = function(startTime,endTime){
  	 	var diffInMillis = endTime.getTime() - startTime.getTime();
  	 	var diffInMins = diffInMillis/60000;
  	 	var diffInHrs = diffInMins/60;
  	 	var leftMins = diffInMins%60; // mins in jrny after hrs calc
  	 	var travelTime = parseInt(diffInHrs);
  	 	if(travelTime > 1){
  	 		travelTime = travelTime+ ' hours ';
  	 	}else{
  	 		travelTime = travelTime+ ' hour ';
  	 	}
  	 	if(leftMins > 1){
  	 		travelTime = travelTime + leftMins+' mins';
  	 	}else{
  	 		travelTime = travelTime + leftMins+' min';
  	 	}
  	 	
  	 	return travelTime;
  	 }	
  	 return{
  	 	recentpnr:[],
  	 	getStatus:function(pnr,callback,failcallback){
  	 		var data='lccp_pnrno1='+pnr;
  	 		$http.post('http://www.indianrail.gov.in/cgi_bin/inet_pnrstat_cgi.cgi',data).success(function(data){
				var trndtls = $(data).find('.table_border_both');
				if(trndtls && trndtls.length > 0){
					callback(true,data);
				}else{
					callback(false);
				}
			}).error(function(){
				failcallback();
			});
  	 	},
  	 	
  	 	getTrainSchedule:function(trainData,callback,failcallback){
  	 		var trainSchdl={};
  	 		var date=trainData.boardingDate;
  	 		var fromstn=$.trim(trainData.boardFrom);
  	 		var tostn=$.trim(trainData.to);
  	 		var trainNum=trainData.number;
 		    date=date.split('-');
 		    var jsdateStr = date[1]+"-"+date[0]+"-"+date[2];
 		    var jsdate=Date.parse(jsdateStr);
 		    trainSchdl.boardingDate=jsdate;
        	var data="lccp_month="+date[1]+"&lccp_day="+date[0]+
                  "&lccp_trn_no="+trainNum+"&lccp_daycnt=0&lccp_submitpath=Get Schedule";
            $http.post('http://www.indianrail.gov.in/cgi_bin/inet_trnpath_cgi.cgi',data).success(function(data){
            	var rowschldata = $(data).find('.table_border_both');
				if(rowschldata && rowschldata.length > 1){
					var schldata = $(rowschldata[1]).find('tr');
					$.each(schldata,function(i,v){
						var stndata = $(v).find('td');
						var srcstn=$(stndata[1]).html();
						srcstn=$.trim(srcstn);
						if(fromstn == srcstn){
							//console.log('Scheduled at '+$(stndata[5]).html()+' from '+$(stndata[2]).html()+srcstn);
							trainSchdl.from=$.trim($(stndata[2]).html())+'('+fromstn+')';
							trainSchdl.fromTime=formatTime($.trim($(stndata[5]).html()));
							trainSchdl.fromDay=$.trim($(stndata[8]).html());
							trainSchdl.startDistance=$.trim($(stndata[7]).html());
							trainSchdl.startDateStr = new Date(Date.parse(jsdateStr+' '+$.trim($(stndata[5]).html())));
						}
						if(tostn == srcstn){
							trainSchdl.to=$.trim($(stndata[2]).html())+'('+tostn+')';
							var toTimeStr=$.trim($(stndata[4]).html());
							trainSchdl.toTime=formatTime(toTimeStr);
							trainSchdl.endDistance=$.trim($(stndata[7]).html());
							trainSchdl.toDay=$.trim($(stndata[8]).html());
							var totalDays=trainSchdl.toDay-trainSchdl.fromDay;
							var jsDestDate=Date.parse(new Date(jsdate).addDays(totalDays));
							toTimeStr = toTimeStr.split(':');
							trainSchdl.destinationDate=jsDestDate;
							var jsdestdateobj = new Date(jsDestDate);
							jsdestdateobj.setHours(parseInt(toTimeStr[0]),parseInt(toTimeStr[1]));
							trainSchdl.endDateStr = jsdestdateobj;
						}
					});
					trainSchdl.travelTime = getTravelTime(trainSchdl.startDateStr,trainSchdl.endDateStr);
					trainSchdl.totalDist=trainSchdl.endDistance-trainSchdl.startDistance
					callback(true,trainSchdl);
				}	
            });
  	 	}
  	 }
  }]);
