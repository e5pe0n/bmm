use anyhow::Context;
use dotenvy::dotenv;
use sqlx::postgres::PgPoolOptions;
use std::env;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().context("failed to load .env file.")?;
    let db_url = env::var("DATABASE_URL").context("DATABASE_URL not set.")?;
    let db = PgPoolOptions::new()
        .max_connections(20)
        .connect(&db_url)
        .await
        .context("failed to connect to the database.")?;

    let task = env::args().nth(1);
    match task.as_deref() {
        Some("reset") => {
            println!("deleting data from tables...");
            sqlx::query!(r#"delete from bookmarks cascade;"#)
                .execute(&db)
                .await
                .context("failed to delete bookmarks table.")?;
            println!("data deleted successfully.");
        }
        Some("drop") => {
            println!("dropping tables...");
            sqlx::query!(r#"drop table if exists bookmarks cascade;"#)
                .execute(&db)
                .await
                .context("failed to drop bookmarks table.")?;
            sqlx::query!(r#"drop table if exists _sqlx_migrations cascade;"#)
                .execute(&db)
                .await
                .context("failed to drop bookmarks table.")?;
            println!("tables dropped successfully.");
        }
        Some("seed") => {
            println!("Seeding database...");
            sqlx::query!(
                r#"
insert into bookmarks (title, url) values
('Example Bookmark', 'https://example.com'),
('Another Bookmark', 'https://another-example.com')
"#,
            )
            .execute(&db)
            .await
            .context("failed to seed bookmarks table.")?;
            println!("tables seeded successfully.");
        }
        _ => {
            println!("No valid task specified. Use 'drop' or 'seed'.");
        }
    }

    Ok(())
}
