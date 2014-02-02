var banned_tags = ["script", "style"];
var exprs = []; //Array of replacement data:
/*
{   s: "search",    //The string to search for
    r: "replace",   //The replacement text
    i: "true/false",//If case-sensitive
    c: "x: y; c: z;"//The css for this replacement
*/
var whitelist = ["developer.google.com"];
var default_css = "color:red; background:black; font-weight: bolder;";

/*TO IMPLEMENT:
    Custom CSS
    default css text box
    Custom replacements
    Whitelist
    reset page functionaility
    page replacement count
*/
function execute_replacement(tabId) {
  chrome.tabs.sendRequest(tabId, {
    command: "execute",
    banned_tags: banned_tags,
    exprs: exprs,
    default_css: default_css
  });
}

function dataman(item, variable){
  var a = localStorage.getItem(item);
  if( a === undefined ){
    localStorage.setItem(item, JSON.stringify(variable));
    return variable;
  }
  return JSON.parse(a);
}

function get_data(){
  banned_tags=  dataman('banned_tags', banned_tags);
  exprs=        dataman('exprs', exprs);
  whitelist=    dataman('whitelist', whitelist);
  return {
    exprs: exprs,
    banned_tags: banned_tags
  };
}

function set_data(){
  localStorage.setItem('banned_tags', JSON.stringify(banned_tags));
  localStorage.setItem('exprs', JSON.stringify(exprs));
  localStorage.setItem('whitelist', JSON.stringify(exprs));
}

function checkWhitelist(tabId, change, tab) {
  get_data();
  if( whitelist.indexOf(tab.url.split("/")[2]) > -1 ){//skip
    chrome.pageAction.setIcon({
      tabId: tabId,
      path: 'icons/off.png'
    });
  }else{    //run script
    chrome.pageAction.setIcon({
      tabId: tabId,
      path: 'icons/on.png'
    });
    //chrome.tabs.executeScript(null, {file: "replace.js"}); //TODO only insert on matching pages
    if (change.status == "complete") {
      execute_replacement(tabId);
    }
  }
  chrome.pageAction.show(tabId);
};

chrome.tabs.onUpdated.addListener(checkWhitelist);

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
  console.log(request);
  if(request.command === "data_request"){
    var data = get_data();
    data.whitelisted=false;//TODO
    sendResponse(data);
  }else if(request.command === "data_update"){
    banned_tags=request.banned_tags;
    exprs=request.exprs;
    //TODO whitelisted
    set_data();
  }
});
