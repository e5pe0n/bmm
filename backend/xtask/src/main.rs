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
        Some("drop") => {
            println!("dropping tables...");
            sqlx::query_file_unchecked!("../sqls/drop.sql")
                .execute(&db)
                .await
                .context("failed to drop bookmarks table.")?;
            println!("tables dropped successfully.");
        }
        Some("seed") => {
            println!("Seeding database...");
            let mut trx = db.begin().await?;
            sqlx::query_file_unchecked!("../sqls/seeds/bookmarks.sql")
                .execute(&mut *trx)
                .await
                .context("failed to seed bookmarks table.")?;
            sqlx::query_file_unchecked!("../sqls/seeds/tags.sql")
                .execute(&mut *trx)
                .await
                .context("failed to seed bookmarks table.")?;
            sqlx::query_file_unchecked!("../sqls/seeds/bookmarks__tags.sql")
                .execute(&mut *trx)
                .await
                .context("failed to seed bookmarks table.")?;
            trx.commit().await?;
            println!("tables seeded successfully.");
        }
        _ => {
            println!("No valid task specified. Use 'drop' or 'seed'.");
        }
    }

    Ok(())
}
