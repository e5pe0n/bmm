use crate::domain::bookmark::{Bookmark, BookmarkId};
use anyhow::Context;
use async_trait::async_trait;
use sqlx::{Pool, Postgres};

#[async_trait]
pub trait BookmarkRepositoryTrait: Send + Sync {
    async fn get_bookmarks(&self) -> anyhow::Result<Vec<Bookmark>>;
    async fn create_bookmark(&self, title: &str, url: &str) -> anyhow::Result<Bookmark>;
    async fn update_bookmark(
        &self,
        id: BookmarkId,
        title: &str,
        url: &str,
    ) -> anyhow::Result<Bookmark>;
    async fn delete_bookmarks(&self, ids: Vec<BookmarkId>) -> anyhow::Result<Vec<BookmarkId>>;
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
        sqlx::query_as!(
            Bookmark,
            r#"select id as "id: _", title, url, created_at, updated_at from bookmarks"#
        )
        .fetch_all(&self.db)
        .await
        .context("failed to fetch bookmarks from the database.")
    }

    async fn create_bookmark(&self, title: &str, url: &str) -> anyhow::Result<Bookmark> {
        sqlx::query_as!(
            Bookmark,
            r#"insert into bookmarks (title, url) values ($1, $2) returning id as "id: _", title, url, created_at, updated_at"#,
            title,
            url
        )
        .fetch_one(&self.db)
        .await
        .context("failed to insert a new bookmark into the database.")
    }

    async fn update_bookmark(
        &self,
        id: BookmarkId,
        title: &str,
        url: &str,
    ) -> anyhow::Result<Bookmark> {
        sqlx::query_as!(
            Bookmark,
            r#"update bookmarks set title = $1, url = $2 where id = $3 returning id as "id: _", title, url, created_at, updated_at"#,
            title,
            url,
            id.0
        )
        .fetch_one(&self.db)
        .await
        .context("failed to update the bookmark in the database.")
    }

    async fn delete_bookmarks(&self, ids: Vec<BookmarkId>) -> anyhow::Result<Vec<BookmarkId>> {
        let records = sqlx::query!(
            r#"delete from bookmarks where id = any($1) returning id as "id!: BookmarkId""#,
            &ids.iter().map(|id| id.0).collect::<Vec<i32>>()
        )
        .fetch_all(&self.db)
        .await
        .context("failed to delete bookmarks from the database.")?;

        Ok(records.into_iter().map(|record| record.id).collect())
    }
}
