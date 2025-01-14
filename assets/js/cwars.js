'use strict';

var __cwars = {};
var intervals = [];

/**
 *  logging
 */
var logs = [];

function log () {

    var msg = Array.from(arguments).map(function (a) {
        if (typeof a === 'object') {
            return JSON.stringify(a);
        }
        return a;
    }).join(' ');

    if (location.hostname === 'localhost') {
        console.log(msg);
    }

    logs.push(msg);
}

/**
 *  form to xhr
 */
function fxhr (form, callback) {

    var method = form.method.toLowerCase();
    var action = form.action.replace(location.origin, '');

    xhr(method, action, $(form).serialize(), callback);
}

/**
 *  ajax request to /api
 */
function xhr (method, route, data, callback) {

    var err_cb = function (err) {

        try {
            err = JSON.parse(err.responseText);
            console.log(err);
        }
        catch (ex) {
            log(err.responseText, ex, err);
            err = {message: 'Something went wrong. Please ask for assistance.'};
        }

        alert(err.message);
    };

    var opts = {
        type: method,
        url: 'api' + route,
        xhrFields: {
            withCredentials: true
        },
        error: err_cb
    };

    if (typeof data === 'function') {
        callback = data;
        data = null;
    }

    else if (data instanceof FormData) {
        opts.processData = false;
        opts.contentType = false;
    }

    opts.success = callback;
    opts.data = data;

    $.ajax(opts);
}

/**
 *  login
 */
function login (f) {

    if (!f.username.value || !f.password.value) {
        alert('Please input username and password before logging in');
        return false;
    }

    fxhr(f, function (data) {
        log('Login successful', data.type);

        __cwars.type = data.type;
        __cwars.username = f.username.value;

        $('#footer').css('visibility', 'visible');
        load_page(data.type);

        $('.data-username').html(__cwars.username);

        get_problems();
        get_submissions();

        if (data.type === 'admin') {
            get_users();
            get_scores();
            intervals.push(setInterval(get_scores, 5000));
        }


        f.reset();
    });

    return false;
}


function get_users () {
    xhr('get', '/users', function (users) {

        users = users.map(function (user) {
            return $('<option>')
                .val(user.username)
                .text(user.username + ' | ' + user.type);
        });

        $('.users_list').each(function (index, list) {
            var $list = $(list);
            $list.html('')
            users.forEach(function (option) {
                $list.append(option.clone());
            });
        });
    });
}


function get_scores () {
    xhr('get', '/scores', function (scores) {

        var $scores = $('#score_table');

        $scores.html('');

        scores.forEach(function (user) {
            $scores.append(
                $('<tr>')
                    .append($('td').text(user.team))
                    .append($('td').text(user.score))
            );
        });
    });
}

/**
 *  gets problems
 */
function get_problems () {
    xhr('get', '/problems', function (problems) {

        var $problems = $('#problems').html('');

        log('problems', problems);

        problems.forEach(function (prob, i) {
            $problems.append('<option value="'+prob.problem_id+'" id="problem_option_'+(i+1)+'">Problem '+(i + 1)+'</option>');
        });
    });
}

/**
 *  gets submissions
 */
function get_submissions () {
    xhr('get', '/submissions', function (submissions) {

        log('submissions', submissions);

        if (__cwars.type === 'team') {

            var $files = $('#files_table tbody').html('');

            submissions.forEach(function (sub, i) {
                $files.append(
                    $('<tr>')
                        .attr('id', 'files_table_row_' + sub.submission_id)
                        .append($('<td>').text(sub.problem_id))
                        .append($('<td class="status">').text(sub.status))
                        .append($('<td class="evaluation">').text(sub.evaluation))
                );
            });
        }

        else if (__cwars.type === 'judge') {

            var $table = $('#stash_body').html('');
            var has_current = false;

            submissions.forEach(function (sub, i) {

                var file = '/' + sub.team + '/' + sub.filename;

                var is_current = sub.status === 'being evaluated' && __cwars.username === sub.judge;
                var is_enabled = sub.status === 'pending evaluation' || is_current;
                var path = '/api/preview' + file;

                if (is_current) {
                    has_current = path;
                    __cwars.submission_id = sub.submission_id;
                }

                $table.append(
                    $('<tr>')
                        .attr('id', 'file_stash_row_' + sub.submission_id)
                        .on('click', show_code.bind(null, path))
                        .append($('<td>').text(sub.problem_id))
                        .append($('<td>').text(sub.team))
                        .append($('<td>').text(sub.status))
                        .append($('<td>').append(
                            $('<button>')
                                .attr(is_enabled
                                    ? 'id'
                                    : 'disabled', ''
                                )
                                .attr('class', is_current
                                    ? 'current'
                                    : 'download_btn'
                                )
                                .text(is_current
                                    ? 'Re-download'
                                    : 'Take over')
                                .on('click', take_over.bind(null, file, sub.submission_id))
                        ))
                );
            });

            if (has_current) {
                update_download_btns();
                show_code(has_current);
            }
        }

    });
}


function update_download_btns () {
    $('#submitButton').removeAttr('disabled');
    $('.download_btn').attr('disabled', 'disabled');
}


function show_code (path) {
    $('#code_iframe').attr('src', path);
}


function take_over (file, id, event) {

    __cwars.submission_id = id;
    update_download_btns();

    var link = document.createElement('a');
    link.href = file;
    link.setAttribute('download', '');
    link.click();

    if (event.srcElement.textContent === 'Re-download') {
        return;
    }

    xhr('GET', '/take_over/' + id, function (response) {
        event.srcElement.removeAttribute('disabled');
        event.srcElement.textContent = 'Re-download';
        alert('Please evaluate the downloaded file and let us know the result');
    });
}



/**
 *  sets filename
 */
function set_filename (b) {
    var $b = $(b);
    var file;

    if (b.files && b.files.length) {
        file = b.files[0];
    }

    $('#sudo-file').val(file
        ? file.name
        : 'SELECT A FILE'
    );
}

/**
 *  uploads file
 */
function upload_file () {

    var $problem = $('#problems option:selected');
    var $file = $('#file');

    if ($file.val() === '') {
        alert('Please select a file first.');
    }
    else if (confirm('Are you sure this is your solution for ' + $problem.html() + '?')) {

        $('#result').html('<img src="images/loader.gif" />');


        var data = new FormData();

        data.append('file', $file[0].files[0]);

        xhr('POST', '/submit/' + $problem.val(), data, function (data) {

            var sub = data.submission;

            set_filename($file[0]);

            $('#files_table tbody').append(
                $('<tr>')
                    .attr('id', 'files_table_row_' + sub.submission_id)
                    .append($('<td>').text(sub.problem_id))
                    .append($('<td class="status">').text(sub.status))
                    .append($('<td class="evaluation">').text(sub.evaluation || ''))
            );

            $('#result').html('<span class="msg">' + data.message + '</span>');
            setTimeout(function () {
                $('#result').fadeOut(5000);
            }, 3000);
        });
    }

    return false;
}


$('#logoutButton').on('click', function () {
    xhr('post', '/logout', function () {

        while (intervals.length) {
            clearInterval(intervals.pop());
        }

        __cwars = {};
        $('.winNail').remove();
        $('#footer').css({visibility: 'hidden'});
        load_page();
    });
});






function validate (f) {

    for (var i = 0; i < f.elements.length; i++) {
        var element = f.elements[i];
        if (element.value === '') {
            element.focus();
            alert('Please fill up the form before submitting');
            return false;
        }
    }

    if (f.password.value !== f.cpassword.value) {
        alert('Passwords did not match.');
    }
    else {

        $.post($(f).attr('action'), $(f).serialize(), function (data) {

            $('.users_list').each(function (index, list) {
                $(list).append(
                    $('<option>')
                        .val(f.username.value)
                        .text(f.username.value + ' | ' + f.type.value)
                );
            });

            alert('Account successfully created!');
            f.reset();
        });
    }

    return false;
}

function validate2 (f) {
    $.post($(f).attr('action'), $(f).serialize(), function (data) {
        $('option[value="' + f.username.value + '"]').remove();
        alert('Account successfully deleted!');
    });
    return false;
}

function validate3(f) {
    $.post($(f).attr('action'), $(f).serialize(), function (data) {
        alert('Password successfully changed!');
        f.reset();
    });
    return false;
}

function evaluateFile () {

    var evaluation = $('#file_eval').val();

    if (!confirm('Are you sure you want to judge this solution as ' + evaluation + '?')) {
        return;
    }

    xhr(
        'POST',
        '/evaluate/' + __cwars.submission_id,
        {evaluation: evaluation},
        function () {

            $('#file_stash_row_' + __cwars.submission_id).remove();
            $('.download_btn').removeAttr('disabled');
            $('#submitButton').attr('disabled', 'disabled');

            show_code('');
            __cwars.submission_id = null;

            alert('Submission successfully evaluated!');
        }
    );
}
