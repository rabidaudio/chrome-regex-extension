//lovely icons http://somerandomdude.com/work/bitcons/
//regex syntax http://w3schools.com/jsref/jsref_obj_regexp.asp

/*good extension stuff

http://developer.chrome.com/extensions/background_pages.html
http://developer.chrome.com/extensions/content_scripts.html
http://developer.chrome.com/extensions/overview.html
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
*/

/* REPLACEMENT PATTERNS
$$	Inserts a "$".
$&	Inserts the matched substring.
$`	Inserts the portion of the string that precedes the matched substring.
$'	Inserts the portion of the string that follows the matched substring.
$n or $nn	
Where n or nn are decimal digits, inserts the nth parenthesized submatch string, provided the first argument was a RegExp object.
*/

jQuery.fn.reverse = [].reverse; //TODO let's drop the jquery requirement for speed, since this will be loaded on every page

//http://stackoverflow.com/questions/298750/how-do-i-select-text-nodes-with-jquery
function run_replacements(){
    find_root(document.body, [{s: /foobar/i, r: "barfoo"}]);
}

function allowed_replace(node){
    for(var i=0; i<banned_tags.length;i++){
        if(node.nodeName.toLowerCase() === banned_tags[i]) return false;
    }
    return true;
}

function find_root(element, searches){ //searches example: [{s: /foobar/, r: "barfoo"}, {s: "dog", r: "doge"}]
    console.log("##############################");
    console.log(element);
    $(element.childNodes)
        .filter( function(){
            if( !allowed_replace(this) ) return false;
            for(var i=0; i<searches.length; i++){
                if( searches[i].s.test( $(this).text() ) )
                    return true;
            }
            return false;
        })
        .reverse()
        .each(function(i,e){
            var matched_searches=[];
            for(var i=0; i<searches.length; i++){
                if( searches[i].s.test( $(this).text() ) )
                    matched_searches.push( searches[i] );
            }
            if( matched_searches.length>0 ){
                if(e.nodeType === e.TEXT_NODE){
                    console.log("Match: "+$(e).text() );
                    var content = e.nodeValue;
                    for(var i=matched_searches.length; i-->0; ){
                        /*content.replace(matched_searches[i].s, function(){
                             '<span class="cre-replace">'+matched_searches[i].r+'</span>'
                         });*/
                         var re = matched_searches[i].s;
                         if( (result = re.exec(content)) !== null ){
                            var p = e.parentNode;
                            console.log(result);
                            var f = e.splitText(result.index);                  //split text node into two nodes
                            console.log(p);
                            /*e.remove();                                         //temporarily remove first half
                            f.remove();                                         //temporarily remove second half
                            var other_nodes =[];
                            for (var j=0; j<p.childNodes.length; j++){          //make a copy of the rest of parent
                                other_nodes.push(p.childNodes[j]);
                                p.childNodes[j].remove();
                            }*/
                            console.log("\t"+f.nodeValue);
                            f.nodeValue = f.nodeValue.substr(result[0].length); //remove original
                            console.log("Became ->"+f.nodeValue);
                            var span = document.createElement('span');          //create a new span node
                            span.setAttribute('class','cre-replace');           //      and set it up
                            console.log("Rebuilding...");
                            //p.appendChild(e);                                   //put the first text node back
                            p.insertBefore(span,f);                                //stick it in after the first text
                            //p.appendChild(f);                                   //put the second text node back
                            /*for(var j=0; j<other_nodes.length;j++){             //put the rest of parent back together
                                p.appendChid(other_nodes[j]);
                            }*/
                            span.innerText = result[0].replace(result[0], matched_searches[i].r);
                            console.log( p );
                            //console.log("next is "+re.lastIndex);
                            //if(!re.global){ break;}
                         }
                    }
                }else{
                    find_root(e,matched_searches);
                }
            }
        });
}

function saveTabData(tab, data) {
  if (tab.incognito) {
    chrome.runtime.getBackgroundPage(function(bgPage) {
      bgPage[tab.url] = data;      // Persist data ONLY in memory
    });
  } else {
    localStorage[tab.url] = data;  // OK to store data
  }
}
