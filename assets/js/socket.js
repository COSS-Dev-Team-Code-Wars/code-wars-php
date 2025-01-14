'use strict';

var socket = io.connect();

socket.on('notification', function (data) {

    if (data.type !== __cwars.type && data.type !== 'all') {
        return;
    }

    console.log(data);

    switch (data.type) {
        case 'team':
            process_team_notif(data.data);
            break;

        case 'judge':
            process_judge_notif(data.event, data.data);
            break;
    }

});


function process_team_notif (data) {

    var $row = $('#files_table_row_' + data.submission_id)

    if (!$row.length) {
        return;
    }

    $row.find('.evaluation').text(data.evaluation);
    $row.find('.status').text(data.status);
}


function process_judge_notif (event, data) {

    console.log(data);

    if (event === 'take_over' && data.judge !== __cwars.username) {
        var $row = $('#file_stash_row_' + data.submission_id);

        if (!$row.length) {
            return;
        }

        $row.remove();
    }

    else if (event === 'submit') {

        var sub = data;
        var $table = $('#stash_body');
        var file = '/' + sub.team + '/' + sub.filename;
        var path = '/api/preview' + file;


        $table.append(
            $('<tr>')
                .attr('id', 'file_stash_row_' + data.submission_id)
                .on('click', show_code.bind(null, path))
                .append($('<td>').text(sub.problem_id))
                .append($('<td>').text(sub.team))
                .append($('<td>').text(sub.status))
                .append($('<td>').append(
                    $('<button>')
                        .attr(!__cwars.submission_id
                            ? 'id'
                            : 'disabled', ''
                        )
                        .attr('class', 'download_btn')
                        .text('Take over')
                        .on('click', take_over.bind(null, file, sub.submission_id))
                ))
        );
    }
}
