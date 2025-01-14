
INSERT INTO users (username, password, type) VALUES
    ('team',        SHA2('team', 512),          'team'),
    ('judge',       SHA2('judge', 512),         'judge'),
    ('admin',       SHA2('admin', 512),         'admin'),
    ('superadmin',  SHA2('superadmin', 512),    'superadmin');


INSERT INTO problems (body) VALUES
    ('Create a website that represents <insert CS Week theme here>. <br /><br /> Limits: Maximum of 30 files (htmls, css, js, images) and a 10 mb max size per file.');

    INSERT INTO problems (body) VALUES
    ('Recursive shifting');
