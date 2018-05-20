
$(function(){  
    $(".ac_title").click(function(){
        $(this).toggleClass("open").next(".ac_con").slideToggle(); 
    });
});
