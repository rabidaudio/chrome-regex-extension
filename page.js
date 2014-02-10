var exprs = [];
var banned_tags = ["script", "style"];
var whitelisted = false;
var default_css = "color:red; background:black; font-weight: bolder;";

var color_names= {aliceblue: "#f0f8ff", antiquewhite: "#faebd7", aqua: "#00ffff", aquamarine: "#7fffd4", azure: "#f0ffff", beige: "#f5f5dc", bisque: "#ffe4c4", black: "#000000", blanchedalmond: "#ffebcd", blue: "#0000ff", blueviolet: "#8a2be2", brown: "#a52a2a", burlywood: "#deb887", cadetblue: "#5f9ea0", chartreuse: "#7fff00", chocolate: "#d2691e", coral: "#ff7f50", cornflowerblue: "#6495ed", cornsilk: "#fff8dc", crimson: "#dc143c", cyan: "#00ffff", darkblue: "#00008b", darkcyan: "#008b8b", darkgoldenrod: "#b8860b", darkgray: "#a9a9a9", darkgrey: "#a9a9a9", darkgreen: "#006400", darkkhaki: "#bdb76b", darkmagenta: "#8b008b", darkolivegreen: "#556b2f", darkorange: "#ff8c00", darkorchid: "#9932cc", darkred: "#8b0000", darksalmon: "#e9967a", darkseagreen: "#8fbc8f", darkslateblue: "#483d8b", darkslategray: "#2f4f4f", darkslategrey: "#2f4f4f", darkturquoise: "#00ced1", darkviolet: "#9400d3", deeppink: "#ff1493", deepskyblue: "#00bfff", dimgray: "#696969", dimgrey: "#696969", dodgerblue: "#1e90ff", firebrick: "#b22222", floralwhite: "#fffaf0", forestgreen: "#228b22", fuchsia: "#ff00ff", gainsboro: "#dcdcdc", ghostwhite: "#f8f8ff", gold: "#ffd700", goldenrod: "#daa520", gray: "#808080", grey: "#808080", green: "#008000", greenyellow: "#adff2f", honeydew: "#f0fff0", hotpink: "#ff69b4", indianred: "#cd5c5c", indigo: "#4b0082", ivory: "#fffff0", khaki: "#f0e68c", lavender: "#e6e6fa", lavenderblush: "#fff0f5", lawngreen: "#7cfc00", lemonchiffon: "#fffacd", lightblue: "#add8e6", lightcoral: "#f08080", lightcyan: "#e0ffff", lightgoldenrodyellow: "#fafad2", lightgray: "#d3d3d3", lightgrey: "#d3d3d3", lightgreen: "#90ee90", lightpink: "#ffb6c1", lightsalmon: "#ffa07a", lightseagreen: "#20b2aa", lightskyblue: "#87cefa", lightslategray: "#778899", lightslategrey: "#778899", lightsteelblue: "#b0c4de", lightyellow: "#ffffe0", lime: "#00ff00", limegreen: "#32cd32", linen: "#faf0e6", magenta: "#ff00ff", maroon: "#800000", mediumaquamarine: "#66cdaa", mediumblue: "#0000cd", mediumorchid: "#ba55d3", mediumpurple: "#9370d8", mediumseagreen: "#3cb371", mediumslateblue: "#7b68ee", mediumspringgreen: "#00fa9a", mediumturquoise: "#48d1cc", mediumvioletred: "#c71585", midnightblue: "#191970", mintcream: "#f5fffa", mistyrose: "#ffe4e1", moccasin: "#ffe4b5", navajowhite: "#ffdead", navy: "#000080", oldlace: "#fdf5e6", olive: "#808000", olivedrab: "#6b8e23", orange: "#ffa500", orangered: "#ff4500", orchid: "#da70d6", palegoldenrod: "#eee8aa", palegreen: "#98fb98", paleturquoise: "#afeeee", palevioletred: "#d87093", papayawhip: "#ffefd5", peachpuff: "#ffdab9", peru: "#cd853f", pink: "#ffc0cb", plum: "#dda0dd", powderblue: "#b0e0e6", purple: "#800080", red: "#ff0000", rosybrown: "#bc8f8f", royalblue: "#4169e1", saddlebrown: "#8b4513", salmon: "#fa8072", sandybrown: "#f4a460", seagreen: "#2e8b57", seashell: "#fff5ee", sienna: "#a0522d", silver: "#c0c0c0", skyblue: "#87ceeb", slateblue: "#6a5acd", slategray: "#708090", slategrey: "#708090", snow: "#fffafa", springgreen: "#00ff7f", steelblue: "#4682b4", tan: "#d2b48c", teal: "#008080", thistle: "#d8bfd8", tomato: "#ff6347", turquoise: "#40e0d0", violet: "#ee82ee", wheat: "#f5deb3", white: "#ffffff", whitesmoke: "#f5f5f5", yellow: "#ffff00", yellowgreen: "#9acd32"};

function set_whitelist(value){
    $('#ntf_wl').attr('status', value.toString());
    if( value ){
        $('#ntf_wl').text('Allow replacements on this site.');
        whitelisted=true;
    }else{
        $('#ntf_wl').text('Block replacements on this site.');
        whitelisted=false;
    }
}

function toggle_whitelist(){
    set_whitelist( $('#ntf_wl').attr('status') == 'false' );
     chrome.extension.sendMessage({
        command: "whitelist",
        url: document.location,
        whitelisted: whitelisted
    });
}

function get_data(){
    chrome.extension.sendMessage({ command: "data_request"}, function(response){
        console.log(response);
        exprs=response.exprs;
        banned_tags=response.banned_tags;
        whitelisted = response.whitelsited;
        
        $('#txt_banned_tags').val(banned_tags.join(" "));
        $('#btn_more').click(btn_more);
        $('#btn_save').click(btn_save);
        $('#btn_add').click(btn_add);
        $('#btn_remove').click(btn_remove);
        set_whitelist(whitelisted || false);
        if(exprs.length>0){
            for(var i=0; i<exprs.length; i++){
                console.log("adding with data");
                console.log(exprs[i].s);
                var n=btn_add(exprs[i]);
                //$('#in-'+n).val( exprs[i].s || "" );
                //$('#out-'+n).val( exprs[i].r || "" );
                //$('#raw-css-'+n).val( exprs[i].c || default_css );
                manual_color(n);
                if(exprs[i].i) $('#case-'+n).attr('checked', true);
            }
        }else{
            console.log("adding blank");
            btn_add();
        }
        console.log("adding last blank");
        btn_add();
        
        $('*').focus( btn_more);
    });
}

/*********************************HELPERS*************************************/

function parse_css(index){
    //Shitty CSS parser
    var css={};
    ($('#raw-css-'+index).val() || "").split(";").forEach(function(e,i,a){
        d=e.trim().split(':');
        if( d[0] != "" && d[0]!= undefined && d[1] != "" && d[1] != undefined){
            this[d[0].trim()]=d[1].trim();
        }
    }, css);
    return css;
}

function set_color(index, which, color){
    //Shitty CSS parser
    var css=parse_css(index);
    css[which]=color;
    var s="";
    for(x in css){s=s+x+": "+css[x]+"; \r\n";}
    $('#raw-css-'+index).val( s );
}

function manual_color(index){
    var css=parse_css(index);
    if( css.background === undefined) css.background = "#ffffff";
    if( css.color      === undefined) css.color      = "#ffffff";
    if( color_names[css.background] !== undefined ) css.background = color_names[css.background];
    if( color_names[css.color]      !== undefined ) css.color      = color_names[css.color];
    if( /\#[0-9a-fA-F]{6}/.test(css.background ||"") )      
        $('#colorH-'+index)
            .val( css.background )
            .change();
    if( /\#[0-9a-fA-F]{6}/.test(css.color ||"") )
        $('#colorT-'+index)
            .val( css.color )
            .change();
}

function unfocus_css(n){
    //$('form *').filter(function(){  return ( parseInt(($(this).attr('id') || "").split("-").reverse()[0]) === n ); })
    
}

function show_css(n){
    
    $('div[id|="css"]').hide();
    $('#css-'+n).show();
}

function make_space_for_picker(index){
    var min_width = $('#colorH-'+index+' + div').position().top + 170;
    var window_height = $(window).height();
    if( window_height < min_width )
        $(document.body).append('<div id="temp" style="height: '+(min_width-window_height)+'px;"></div>');
}

/***********************************BUTTONS***********************************/

function btn_save(){
    var count = parseInt($("#fields").attr("count"));
    exprs=[];
    for(var i=0; i<=count;i++){
        var input = $('#in-'+i).val();
        if (input !== undefined && input !== ""){
            exprs.push({
                s: input,
                r: $('#out-'+i).val(),
                i: ($("#case-"+i+":checked").length>0),
                c: $("#raw-css-"+i).val()
            });
        }

    }
    banned_tags = $('#txt_banned_tags').val().split(" ");
    var data = {
        command: "data_update",
        banned_tags: banned_tags,
        exprs: exprs,
        whitelisted: whitelisted
    };
    console.log(data);
    chrome.extension.sendMessage(data);
    $('#ntf_saved').fadeIn(100).fadeOut(1000);
    console.log(exprs);
}

function btn_add(data){
    if(data  ===undefined) data  ={};
    if(data.s===undefined) data.s="";
    if(data.r===undefined) data.r="";
    if(data.i===undefined) data.i=false;
    if(data.c===undefined) data.c=default_css;
    var count = parseInt($("#fields").attr("count"));
    count++;
    var input_code = ('<br/>'+
            '<span id="group-'+count+'">'+
            '<input type="text" '    + 'name="in-'   +count+ '" id="in-'   +count+ '" placeholder="Input"/>'+
            '<input type="text" '    + 'name="out-'  +count+ '" id="out-'  +count+ '" placeholder="Replacement"/>'+
            '<input type="checkbox" '+ 'name="case-' +count+ '" id="case-' +count+ '"/>'+
            //'<img id="btn-css-'  +count+'" src="icons/equalizer.png">'+
            '</span>');
    $("#fields").append(input_code);
    $('#css_block').append(
        '<div id="css-'     +count+'" style="display: none;">'+
            '<table><tr><td>'+
            //'<label for="colorT-'+count+'">Text</label>'+
            '<input type="text" name="colorT-'+count+ '" id="colorT-'+count+ '" data-text="txt"/>'+
            //'Text color'+
            //'<label for="colorH-'+count+'">Highlight</label>'+
            '<input type="text" name="colorH-'+count+ '" id="colorH-'+count+ '" data-text="bg"/>'+
            //'Highlight color'+
            '</td><td>'+
            '<textarea id="raw-css-'+count+'" rows="4" cols="20"></textarea>'+
            '</td></tr></table>'+
        '</div>'
    );
    $("#fields").attr("count",count);
    $('#in-'+count).val(data.s);
    $('#out-'+count).val(data.r);
    $('#case-'+count).attr('checked', data.i);
    $('#raw-css-'+count).val( data.c );
    manual_color(count);
    $('#colorH-'+count).colorPicker({
        onColorChange : function(id, newValue) {
            console.log("ID: " + id + " has been changed to " + newValue);
            set_color( id.split("-").reverse()[0], "background", newValue);
        }
    });
    $('#colorT-'+count).colorPicker({
        onColorChange : function(id, newValue) {
            console.log("ID: " + id + " has been changed to " + newValue);
            set_color( id.split("-").reverse()[0], "color", newValue);
        }
    });
    $('#colorT-'+count+' + div').click( function(){ make_space_for_picker(count); });
    $('#colorH-'+count+' + div').click( function(){ make_space_for_picker(count); });
    
    $('#css-'+count).hide();
    //$('#btn-css-'+count).click(function(){ $('#css-'+count).toggle(); });
    //$('#in-'+count).focusin( function(){ show_css(count); });
    //$('#out-'+count).focusin(function(){ show_css(
    
    //TODO fix the focus business
    //$('form *').filter(function(){  return ( parseInt(($(this).attr('id') || "").split("-").reverse()[0]) === count ); })
    //    .focusin( btn_more);//function(){ $('css-'+count).show(); } );
    
    $('#raw-css-'+count).focusout(function(){ manual_color(count); });
    return count-1;
}

function btn_remove(){
    var count = parseInt($("#fields").attr("count"));
    if (count>1){
        //$("#fields input[name$='"+count+"']").remove();
        /*$("#in-"+count).remove();
        $("#out-"+count).remove();
        $('#btn-css-'+count).remove();
        $('#css-'+count).remove();*/
        $("#fields br").filter(":last").remove();
        $('#group-'+count).remove();
        count--;
        $("#fields").attr("count",count);
    }
}
function btn_more(){
    if($('#more').css('display') === "none"){
        $('#more').show();
        $('#btn_more').val('Hide');
    }else{
        $('#more').hide();
        $('#btn_more').val('More');
    }
}


/*$(document).ready(function(){
    get_data();
});*/
get_data();
