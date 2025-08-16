use crate::domain::{
    bookmark::{Bookmark, BookmarkId},
    tag::{Color, Tag, TagId},
};
use anyhow::Context;
use async_trait::async_trait;
use sqlx::{Pool, Postgres, QueryBuilder};

#[async_trait]
pub trait BookmarkRepositoryTrait: Send + Sync {
    async fn get_bookmarks(&self) -> anyhow::Result<Vec<Bookmark>>;
    async fn create_bookmark(
        &self,
        title: &str,
        url: &str,
        tag_ids: &Vec<TagId>,
    ) -> anyhow::Result<()>;
    async fn update_bookmark(
        &self,
        id: BookmarkId,
        title: &str,
        url: &str,
        tag_ids: &Vec<TagId>,
    ) -> anyhow::Result<()>;
    async fn delete_bookmarks(&self, ids: &Vec<BookmarkId>) -> anyhow::Result<()>;
}

pub struct BookmarkRepository {
    db: Pool<Postgres>,
}

impl BookmarkRepository {
    pub fn new(db: Pool<Postgres>) -> Self {
        BookmarkRepository { db }
    }
}

#[async_trait]
impl BookmarkRepositoryTrait for BookmarkRepository {
    async fn get_bookmarks(&self) -> anyhow::Result<Vec<Bookmark>> {
        let rs = sqlx::query!(
            r#"
            select
                bs.id as bs_id, title, url, bs.created_at as bs_created_at, bs.updated_at as bs_updated_at,
                tags.id as "tags_id?", name as "name?", color as "color?",
                tags.created_at as "tags_created_at?", tags.updated_at as "tags_updated_at?"
            from bookmarks bs
            left join bookmark_tags bts on bs.id = bts.bookmark_id
            left join tags on bts.tag_id = tags.id
            order by bs.created_at desc
            "#
        )
        .fetch_all(&self.db)
        .await
        .context("failed to fetch bookmarks from the database.")?;

        let mut v = Vec::<Bookmark>::new();
        for r in rs.iter() {
            match v.last_mut() {
                Some(last) if last.id.0 == r.bs_id => {
                    // Only add tag if it exists (tags_id is Some)
                    if let Some(tag_id) = r.tags_id {
                        let tag = Tag {
                            id: TagId(tag_id),
                            name: r.name.clone().unwrap(),
                            color: Color(r.color.clone().unwrap()),
                            created_at: r.tags_created_at.unwrap(),
                            updated_at: r.tags_updated_at.unwrap(),
                        };
                        last.tags.push(tag);
                    }
                }
                _ => {
                    let mut tags = Vec::new();
                    // Only add tag if it exists (tags_id is Some)
                    if let Some(tag_id) = r.tags_id {
                        let tag = Tag {
                            id: TagId(tag_id),
                            name: r.name.clone().unwrap(),
                            color: Color(r.color.clone().unwrap()),
                            created_at: r.tags_created_at.unwrap(),
                            updated_at: r.tags_updated_at.unwrap(),
                        };
                        tags.push(tag);
                    }
                    v.push(Bookmark {
                        id: BookmarkId(r.bs_id.clone()),
                        title: r.title.clone(),
                        url: r.url.clone(),
                        tags,
                        created_at: r.bs_created_at.clone(),
                        updated_at: r.bs_updated_at.clone(),
                    });
                }
            }
        }
        Ok(v)
    }

    async fn create_bookmark(
        &self,
        title: &str,
        url: &str,
        tag_ids: &Vec<TagId>,
    ) -> anyhow::Result<()> {
        let r = sqlx::query!(
            r#"
            insert into bookmarks (title, url) values ($1, $2)
            returning id, title, url, created_at, updated_at
            "#,
            title,
            url
        )
        .fetch_one(&self.db)
        .await
        .context("failed to insert a new bookmark into the database.")?;
        if tag_ids.len() > 0 {
            let mut qb: QueryBuilder<Postgres> = QueryBuilder::new(
                r#"
                insert into bookmark_tags (bookmark_id, tag_id)
            "#,
            );
            qb.push_values(tag_ids.iter(), |mut b, tag_id| {
                b.push_bind(r.id).push_bind(tag_id);
            });
            qb.build()
                .execute(&self.db)
                .await
                .context("failed to insert a new bookmark tags into the database.")?;
        }
        Ok(())
    }

    async fn update_bookmark(
        &self,
        id: BookmarkId,
        title: &str,
        url: &str,
        tag_ids: &Vec<TagId>,
    ) -> anyhow::Result<()> {
        let r = sqlx::query!(
            r#"
            update bookmarks set title = $1, url = $2 where id = $3
            returning id, title, url, created_at, updated_at
            "#,
            title,
            url,
            id.0
        )
        .fetch_one(&self.db)
        .await
        .context("failed to update the bookmark in the database.")?;

        sqlx::query!(
            r#"
            delete from bookmark_tags where bookmark_id = $1
            "#,
            id.0,
        )
        .execute(&self.db)
        .await
        .context("failed to delete bookmark tags from the database.")?;

        if tag_ids.len() > 0 {
            let mut qb: QueryBuilder<Postgres> = QueryBuilder::new(
                r#"
            insert into bookmark_tags (bookmark_id, tag_id)
            "#,
            );
            qb.push_values(tag_ids.iter(), |mut b, tag_id| {
                b.push_bind(r.id).push_bind(tag_id);
            });
            qb.build()
                .execute(&self.db)
                .await
                .context("failed to insert a new bookmark tags into the database.")?;
        }

        Ok(())
    }

    async fn delete_bookmarks(&self, ids: &Vec<BookmarkId>) -> anyhow::Result<()> {
        sqlx::query!(
            r#"delete from bookmarks where id = any($1) returning id as "id!: BookmarkId""#,
            &ids.iter().map(|id| id.0).collect::<Vec<i32>>()
        )
        .fetch_all(&self.db)
        .await
        .context("failed to delete bookmarks from the database.")?;

        Ok(())
    }
}
