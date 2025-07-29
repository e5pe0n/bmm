use crate::domain::bookmark::{Bookmark, BookmarkId};
use anyhow::Context;
use async_trait::async_trait;
use sqlx::{Pool, Postgres};
use time::OffsetDateTime;

#[async_trait]
pub trait BookmarkRepositoryTrait: Send + Sync {
    /// Retrieves a list of bookmarks.
    ///
    /// # Returns
    /// A vector of `Bookmark` instances.
    async fn get_bookmarks(&self) -> anyhow::Result<Vec<Bookmark>>;
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
        // Simulate fetching bookmarks from a database or external source
        sqlx::query!("select * from bookmarks")
            .map(|row| Bookmark {
                id: BookmarkId(row.id),
                title: row.title,
                url: row.url,
                created_at: OffsetDateTime::from(row.created_at.unwrap()),
                updated_at: OffsetDateTime::from(row.updated_at.unwrap()),
            })
            .fetch_all(&self.db)
            .await
            .context("failed to fetch bookmarks from the database.")
    }
}
