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
var default_css = "color:red; background:black; font-weight: bolder;";
var replacement_count = 0;

function run_replacements(exprs){
    find_root(document.body, exprs); //[{s: "foobar", r: "barfoo", i: false}]);
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
        if( matched_searches.length>0 ){    //TODO this mess can be cleaned up a little bit
            if(e.nodeType === e.TEXT_NODE){
                    var content = e.nodeValue;
                    var m = matched_searches.pop();
                    var re = new RegExp(m.s, (m.i ? "":"i"));
                    var result = re.exec(content);
                    if( result !== null ){
                        var p = e.parentNode;
                        var f = e.splitText(result.index);                  //split text node into two nodes
                        f.nodeValue = f.nodeValue.substr(result[0].length); //remove original
                        var span = document.createElement('span');          //create a new span node
                        span.setAttribute('style', m.c || "");              //      and set it up
                        span.setAttribute('title', result[0])
                        p.insertBefore(span,f);                             //stick it in after the first text
                        span.innerText = result[0].replace(re, m.r);
                        replacement_count++;
                    }
                    if( matched_searches.length>0 )                 //The node has changed at this point, so
                        find_root(p, matched_searches);             //run again from the parent
            }else{
                find_root(e, matched_searches);
            }
        }
    }
}

if (window == top) {
  chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
    //console.log( req );
    if( req.command === "execute" ){
      banned_tags = req.banned_tags;
      default_css = req.default_css;
      sendResponse(run_replacements(req.exprs));
    }
  });
}
