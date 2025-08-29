use anyhow::Context;
use backend::app;
use dotenvy::dotenv;
use sqlx::postgres::PgPoolOptions;
use std::env;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().context("failed to load .env file.")?;
    let db_url = env::var("DATABASE_URL").context("DATABASE_URL not set.")?;
    let ext_id = env::var("CHROME_EXT_ID").context("CHROME_EXT_ID not set.")?;

    let db = PgPoolOptions::new()
        .max_connections(20)
        .connect(&db_url)
        .await
        .context("failed to connect to the database.")?;

    let app = app(db, &ext_id);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .context("failed to bind TcpListener")?;
    axum::serve(listener, app)
        .await
        .context("failed to start server")
}
