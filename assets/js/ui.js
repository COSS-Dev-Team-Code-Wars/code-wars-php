'use strict';

load_page();
function load_page (type) {

    var divs = [];

    switch (type) {
        case 'team':
            divs.push('ads_div');
            divs.push('file_sender_div');
            break;
        case 'judge':
            divs.push('ads_div');
            divs.push('file_stash_div');
            break;
        case 'admin':
            divs.push('ads_div');
            divs.push('account_manager_div');
            break;
    }

    if (typeof type === 'undefined') {
        divs.push('login_div');
    }

    show_divs(divs);
}


function show_divs (to_show) {

    var pos = ['top', 'left'];
    var divs = $('.window');

    // random(5, 10) -> random from 5 to 9
    // `~~` is like Math.floor, removes decimals
    function random (from, to) {
        return from + ~~(Math.random() * (to - from));
    }

    function show_div (idx) {

        if (idx === divs.length) {
            return;
        }

        var div = divs[idx];
        var $div = $(div);

        if (~to_show.indexOf(div.id)) {

            log('showing', div.id);
            $div.animate({opacity: 1}, {duration: random(1000, 2000)});
            $div.css({'z-index': 1});
        }
        else if (parseInt($div.css('opacity')) > 0) {

            log('hiding', div.id);
            $div.css({'z-index': -9999});
            $div.animate({opacity: 0}, {duration: random(500, 1500)});
        }

        setTimeout(function () {
            show_div(idx + 1);
        }, random(0, 200));
    }

    show_div(0);
}


// call once
drag_resize();
function drag_resize () {

    $('.window').draggable({
        cancel: '.window_content',
        containment: 'body',
        scroll: false,
        stack: {
            group: '.window',
            min: 1
        }
    });

    $('.window').resizable({
        handles: 'n,e,s,w,ne,se,sw,nw',
        containment: 'body',
        minHeight: 80,
        minWidth: 138,
        maxHeight: $(window).height(),
        maxWidth: $(window).width()
    });

    $('.window_title button').html('------');
    $('.window_title button').click(function (e) {
        var id = $(e.toElement).parent().parent()[0].id;
        if (id == 'login_div') return;

        function add_thumb () {
            $('#list').append(
                $('<div class="opened tunggal winNail">')
                    .attr('id', 'thumb_' + id)
            );
        }

        $(e.toElement)
            .parent()
            .parent()
            .effect(
                'transfer',
                {
                    to: '#thumb_' + $(e.toElement).parent().parent()[0].id,
                    className: 'ui-effects-transfer'
                },
                1000,
                add_thumb
            )
            .hide();
    });

    $('.winNail').click(function (e) {
        var id = e.srcElement.id.replace('thumb_', '');
        $('#' + id).show();
        $(this).remove();
    });
}



// TODO: get time from server
var date = new Date();
var time = {
    hour:date.getHours(),
    min:date.getMinutes(),
    sec:date.getSeconds(),
    meridian:date.getHours() >= 12 ? 'PM' : 'AM'
};
setInterval(update_time, 1000);

function update_time () {

    var m = $('#time');

    if (time.sec < 59) {
        time.sec++;
    }
    else {

        time.sec = 0;

        if (time.min < 59) {
            time.min++;
        }
        else {

            time.min = 0;

            if (time.hour < 12) {

                time.hour++;

                if (time.hour == 12) {
                    time.meridian = (time.meridian == 'am') ? 'pm' : 'am';
                }
            }
            else {
                time.hour = 1;
            }
        }
    }

    var sec = (time.sec < 10) ? '0' + time.sec : '' + time.sec;
    var min = (time.min < 10) ? '0' + time.min : '' + time.min;
    var hr = (time.hour < 10) ? '0' + time.hour : '' + time.hour;

    m.html('<span id="hour">'
        + hr + '</span>:<span id="min">'
        + min + '</span>:<span id="sec">'
        + sec + '</span> <span id="meri">'
        + time.meridian + '</span>');
}
