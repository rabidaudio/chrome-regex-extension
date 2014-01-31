var exprs = [];
var banned_tags = ["script", "style"];
var whitelisted = false;

$(document).ready(function(){
    get_data();
});

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
        set_whitelist(whitelisted);
        if(exprs.length>0){
            for(var i=0; i<exprs.length; i++){
                console.log("adding with data");
                var n=btn_add();
                $('#in-'+n).val( exprs[i].s || "" );
                $('#out-'+n).val( exprs[i].r || "" );
                if(exprs[i].i) $('#case-'+n).attr('checked', true);
            }
        }else{
            console.log("adding blank");
            btn_add();
        }
        console.log("adding last blank");
        btn_add();
    });
}

function btn_save(){
    var count = parseInt($("#fields").attr("count"));
    exprs=[];
    for(var i=0; i<=count;i++){
        var input = $("#fields input[name='in-"+i+"']").val();
        if (input != ""){
            exprs.push({
                s: input,
                r: $("#fields input[name='out-"+i+"']").val(),
                i: ($("#fields input[name='case-"+i+"']:checked").length>0)
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

function btn_add(){
    var count = parseInt($("#fields").attr("count"));
    count++;
    var input_code = ('<br/>'+
            '<input type="text" '    + 'name="in-'   +count+ '" id="in-'  +count+ '" placeholder="Input"/>'+
            '<input type="text" '    + 'name="out-'  +count+ '" id="out-' +count+ '" placeholder="Replacement"/>'+
            '<input type="checkbox" '+ 'name="case-' +count+ '" id="case-'+count+ '"/>');
    $("#fields").append(input_code);
    $("#fields").attr("count",count);
    return count-1;
}

function btn_remove(){
    var count = parseInt($("#fields").attr("count"));
    if (count>1){
        $("#fields input[name$='"+count+"']").remove();
        $("#out"+count).remove();
        $("#fields br").filter(":last").remove();
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
