use crate::domain::bookmark::{Bookmark, BookmarkId};
use anyhow::Context;
use async_trait::async_trait;
use sqlx::{FromRow, Pool, Postgres, postgres::PgRow};
use time::OffsetDateTime;

#[async_trait]
pub trait BookmarkRepositoryTrait: Send + Sync {
    /// Retrieves a list of bookmarks.
    ///
    /// # Returns
    /// A vector of `Bookmark` instances.
    async fn get_bookmarks(&self) -> anyhow::Result<Vec<Bookmark>>;
    async fn create_bookmark(&self, title: &str, url: &str) -> anyhow::Result<Bookmark>;
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
    /// Retrieves a list of bookmarks.
    ///
    /// # Returns
    /// A vector of `Bookmark` instances.
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
}
