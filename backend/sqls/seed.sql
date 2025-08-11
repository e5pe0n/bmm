with tags as (
    insert into tags (name, color) values
        ('Linux', 0xffffff),
        ('Rust', 0x000000),
        ('TypeScript', 0xff0000)
    returning *
),
bookmarks as (
    insert into bookmarks (title, url) values
        ('Example Bookmark', 'https://example.com'),
        ('Another Bookmark', 'https://another-example.com')
    returning *
)
insert into bookmarks_tags (bookmark_id, tag_id) values
(1, 1),
(1, 2),
(2, 1),
(2, 3);
