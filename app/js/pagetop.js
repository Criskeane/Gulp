(function ($) {
    $(document).ready(function () {
      var f = $('#footer').height();
        var pageup = $('.to_top');
        var pageup_show_yn = 1;
        var pageup_state = 2;
        var d_h;
        $(window).scroll(function () {
            if ($(window).scrollTop() > 300) {
                if (pageup_show_yn != 1) {
                    pageup.clearQueue().stop().animate({ 'opacity': '1' }, 500);
                    pageup_show_yn = 1;
                }
            }
            else {
                if (pageup_show_yn != 0) {
                    pageup.clearQueue().stop().animate({ 'opacity': '0' }, 500);
                    pageup_show_yn = 0;
                }
            }

            var t_d_h = d_h - $(window).height();
            if ($(window).scrollTop() > t_d_h) {
                var t_v = $(window).scrollTop() - t_d_h;
                $('.page_top_cont').css('bottom', t_v + 'px');
                pageup_state = 1;
            }
            else {
                if (pageup_state != 0) {
                    $('.page_top_cont').css('bottom', '20px');
                    pageup_state = 0;
                }
            }
        });

        setTimeout(function () {
            pageup_show_yn = 2;
            d_h = $(document).height() - 320;
            $(window).scroll();
        }, 500);
    });
})(jQuery);
