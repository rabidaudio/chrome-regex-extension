var my_reg_exprs = new Array();
var my_reg_repls = new Array();
var banned_tags = ["script", "style"];

$(document).ready(function(){
    //TODO get data from background page
    $('#txt_banned_tags').val(banned_tags.join(" "));
    $('#btn_more').click(btn_more);
    $('#btn_save').click(btn_save);
    $('#btn_add').click(btn_add);
    $('#btn_remove').click(btn_remove);
    btn_add();
    btn_add();
//chrome.extension.onRequest.addListener(function(update_exprs, sender, sendResponse){
    //do stuff
//    chrome.pageAction.show(sender.tab.id);
//    sendResponse({exprs: my_reg_exprs, repls: my_reg_repls});
});


function btn_save(){
    var count = parseInt($("#fields").attr("count"));
    my_reg_exprs= new Array();
    my_reg_repls= new Array();
    for(var i=0; i<count;i++){
        var input = $("#fields input[name='in-"+(i+1)+"']").val();
        if (input !== ""){
            my_reg_exprs[i]= new RegExp( input, ($("#fields input[name='case-"+(i+1)+"']:checked").length ? "" : "i") );
            my_reg_repls[i] = $("#fields input[name='out-"+(i+1)+"']").val();
        }

    }
    banned_tags = $('#txt_banned_tags').val().split(" ");
    //TODO send data to background page
    $('#ntf_saved').fadeIn(100).fadeOut(1000);
    console.log(my_reg_exprs);
    console.log(my_reg_repls);
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
