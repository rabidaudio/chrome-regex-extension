var banned_tags = ["script", "style"];
var exprs = [];
var whitelist = ["developer.google.com"];


function execute_replacement(tabId) {
  chrome.tabs.sendRequest(tabId, {
    command: "execute",
    banned_tags: banned_tags,
    exprs: exprs
  });
}

function dataman(item, variable){
  var a = localStorage.getItem(item);
  if( a === undefined ){
    localStorage.setItem(item, JSON.stringify(variable));
  }else{
    variable = JSON.parse(a);
  }
}

function get_data(){
  dataman('banned_tags', banned_tags);
  dataman('exprs', exprs);
  dataman('whitelist', whitelist);
}

function set_data(){
  localStorage.setItem('banned_tags', JSON.stringify(banned_tags));
  localStorage.setItem('exprs', JSON.stringify(exprs));
  localStorage.setItem('whitelist', JSON.stringify(exprs));
}

function checkWhitelist(tabId, change, tab) {
  get_data();
  if( whitelist.indexOf(tab.url.split("/")[2]) < 0 ){
    chrome.pageAction.setIcon({
      tabId: tabId,
      path: 'icons/on.png'
    });
    chrome.tabs.executeScript(null, {file: "replace.js"});
    if (change.status == "complete") {
      execute_replacement(tabId);
    }
  }else{
    chrome.pageAction.setIcon({
      tabId: tabId,
      path: 'icons/off.png'
    });
  }
  chrome.pageAction.show(tabId);
};

chrome.tabs.onUpdated.addListener(checkWhitelist);
