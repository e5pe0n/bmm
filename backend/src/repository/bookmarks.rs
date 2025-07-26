use crate::domain::bookmark::Bookmark;
use anyhow::Context;
use sqlx::{Pool, Postgres, Row, postgres::PgRow};

pub struct BookmarkRepository {
    db: Pool<Postgres>,
}

impl BookmarkRepository {
    pub fn new(db: Pool<Postgres>) -> Self {
        BookmarkRepository { db }
    }

    /// Retrieves a list of bookmarks.
    ///
    /// # Returns
    /// A vector of `Bookmark` instances.
    pub async fn get_bookmarks(&self) -> anyhow::Result<Vec<Bookmark>> {
        // Simulate fetching bookmarks from a database or external source
        sqlx::query("select * from bookmarks")
            .map(|row: PgRow| Bookmark::new(row.get("title"), row.get("url")))
            .fetch_all(&self.db)
            .await
            .context("failed to fetch bookmarks from the database.")
    }
}
