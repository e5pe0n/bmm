use crate::controller::bookmarks::list_bookmarks;
use anyhow::Context;
use axum::{Router, routing::get};
use dotenvy::dotenv;
use sqlx::postgres::PgPoolOptions;
use std::env;
use std::sync::Arc;

mod controller;
mod domain;
mod errors;
mod repository;

struct AppState {
    bookmark_repository: repository::bookmarks::BookmarkRepository,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().context("failed to load .env file.")?;
    let db_url = env::var("DATABASE_URL").context("DATABASE_URL not set.")?;

    let db = PgPoolOptions::new()
        .max_connections(20)
        .connect(&db_url)
        .await
        .context("failed to connect to the database.")?;

    let shared_state = Arc::new(AppState {
        bookmark_repository: repository::bookmarks::BookmarkRepository::new(db),
    });

    let app = Router::new()
        .route("/", get(list_bookmarks))
        .with_state(shared_state);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .context("failed to bind TcpListener")?;
    axum::serve(listener, app)
        .await
        .context("failed to start server")
}
