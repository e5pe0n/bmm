use crate::domain::tag::{Color, Tag, TagId};
use anyhow::Context;
use async_trait::async_trait;
use sqlx::{Pool, Postgres};

#[async_trait]
pub trait TagRepositoryTrait: Send + Sync {
    async fn get_tags(&self) -> anyhow::Result<Vec<Tag>>;
    async fn create_tag(&self, name: &str, color: &Color) -> anyhow::Result<Tag>;
    async fn update_tag(&self, id: TagId, name: &str, color: &Color) -> anyhow::Result<Tag>;
    async fn delete_tags(&self, ids: Vec<TagId>) -> anyhow::Result<Vec<TagId>>;
}

pub struct TagRepository {
    db: Pool<Postgres>,
}

impl TagRepository {
    pub fn new(db: Pool<Postgres>) -> Self {
        TagRepository { db }
    }
}

#[async_trait]
impl TagRepositoryTrait for TagRepository {
    async fn get_tags(&self) -> anyhow::Result<Vec<Tag>> {
        sqlx::query_as!(
            Tag,
            r#"select id as "id: _", name, color as "color: _", created_at, updated_at from tags"#
        )
        .fetch_all(&self.db)
        .await
        .context("failed to fetch tags from the database.")
    }

    async fn create_tag(&self, name: &str, color: &Color) -> anyhow::Result<Tag> {
        sqlx::query_as!(
            Tag,
            r#"insert into tags (name, color) values ($1, $2) returning id as "id: _", name, color as "color: _", created_at, updated_at"#,
            name,
            color.0
        )
        .fetch_one(&self.db)
        .await
        .context("failed to insert a new tag into the database.")
    }

    async fn update_tag(&self, id: TagId, name: &str, color: &Color) -> anyhow::Result<Tag> {
        sqlx::query_as!(
            Tag,
            r#"update tags set name = $1, color = $2 where id = $3 returning id as "id: _", name, color as "color: _", created_at, updated_at"#,
            name,
            color.0,
            id.0
        )
        .fetch_one(&self.db)
        .await
        .context("failed to update the tag in the database.")
    }

    async fn delete_tags(&self, ids: Vec<TagId>) -> anyhow::Result<Vec<TagId>> {
        let records = sqlx::query!(
            r#"delete from tags where id = any($1) returning id as "id!: TagId""#,
            &ids.iter().map(|id| id.0).collect::<Vec<i32>>()
        )
        .fetch_all(&self.db)
        .await
        .context("failed to delete tags from the database.")?;

        Ok(records.into_iter().map(|record| record.id).collect())
    }
}
