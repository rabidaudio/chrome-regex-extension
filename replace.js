//lovely icons http://somerandomdude.com/work/bitcons/

/*
http://developer.chrome.com/extensions/background_pages.html
http://developer.chrome.com/extensions/content_scripts.html
http://developer.chrome.com/extensions/overview.html
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
http://stackoverflow.com/questions/298750/how-do-i-select-text-nodes-with-jquery
*/

/* REPLACEMENT PATTERNS
$$	Inserts a "$".
$&	Inserts the matched substring.
$`	Inserts the portion of the string that precedes the matched substring.
$'	Inserts the portion of the string that follows the matched substring.
$n or $nn	
Where n or nn are decimal digits, inserts the nth parenthesized submatch string, provided the first argument was a RegExp object.
*/

var banned_tags = ["script", "style"];

function run_replacements(exprs){
    find_root(document.body, [{s: "foobar", r: "barfoo", i: false}]);
    return true;
}

function find_root(element, searches){
    //searches example: [{s: /foobar/, r: "barfoo"}, {s: "dog", r: "doge"}]
    for(var c=element.childNodes.length; c-->0;){
        var e=element.childNodes[c];
        if( banned_tags.indexOf( e.nodeName.toLowerCase() ) > -1 ) continue;

        var matched_searches=[];
        for(var i=0; i<searches.length; i++){
            var s = new RegExp(searches[i].s, (searches[i].i ? "":"i"));
            if( s.test((e.nodeValue || e.innerText || "")) )
                matched_searches.push( searches[i] );
        }
        if( matched_searches.length>0 ){
            if(e.nodeType === e.TEXT_NODE){
                var content = e.nodeValue;
                for(var i=matched_searches.length; i-->0; ){
                     var re = new RegExp(matched_searches[i].s, (searches[i].i ? "":"i"));//matched_searches[i].s;
                     var result = re.exec(content);
                     if( result !== null ){
                        var p = e.parentNode;
                        var f = e.splitText(result.index);                  //split text node into two nodes
                        f.nodeValue = f.nodeValue.substr(result[0].length); //remove original
                        var span = document.createElement('span');          //create a new span node
                        span.setAttribute('class','cre-replace');           //      and set it up
                        span.setAttribute('title', result[0])
                        p.insertBefore(span,f);                             //stick it in after the first text
                        span.innerText = result[0].replace(result[0], matched_searches[i].r);
                     }
                }
            }else{
                find_root(e, matched_searches);
            }
        }
    }
}

if (window == top) {
  chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
    console.log( req );
    if( req.command === "execute" ){
      banned_tags = req.banned_tags;
      sendResponse(run_replacements(req.exprs));
    }
  });
}
