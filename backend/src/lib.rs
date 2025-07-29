use crate::controller::bookmarks::list_bookmarks;
use axum::{Router, routing::get};
use sqlx::PgPool;
use std::sync::Arc;

mod app_state;
mod controller;
mod domain;
mod errors;
mod repository;

// Re-export AppState for use in main.rs
pub use app_state::AppState;

pub fn app(db: PgPool) -> Router {
    let shared_state = Arc::new(AppState {
        bookmark_repository: Box::new(repository::bookmark::BookmarkRepository::new(db)),
    });

    Router::new()
        .route("/", get(list_bookmarks))
        .with_state(shared_state)
}
