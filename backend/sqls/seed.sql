with tags as (
    insert into tags (name, color) values
        ('Linux', '#0000ff'),
        ('Rust', '#00ff00'),
        ('TypeScript', '#ff0000')
    returning *
),
bookmarks as (
    insert into bookmarks (title, url) values
        ('Example Bookmark', 'https://example.com'),
        ('Another Bookmark', 'https://another-example.com')
    returning *
)
insert into bookmarks__tags (bookmark_id, tag_id) values
(1, 1),
(1, 2),
(2, 1),
(2, 3);
