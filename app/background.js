
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-44068589-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

chrome.runtime.onInstalled.addListener(function(details){
	var thisVersion = chrome.runtime.getManifest().version;
	if(details.reason == 'update'){
		//console.log(thisVersion);
  		//console.log(details);
  		_gaq.push(['_trackEvent', 'update-version', thisVersion]);
	}else{
		//console.log(details);
		_gaq.push(['_trackEvent', 'install-version', thisVersion]);
	}
});
