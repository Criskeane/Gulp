$(".navmenu li").hover(
    function(){
        $(this).find(".arcording").stop().slideDown();
    },
    function(){
        $(this).find(".arcording").stop().slideUp();
    }
);