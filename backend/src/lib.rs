use crate::controller::{
    bookmarks::{create_bookmark, delete_bookmarks, list_bookmarks, update_bookmark},
    tags::{create_tag, delete_tags, list_tags, update_tag},
};
use axum::{Extension, Router, http::Method, routing::get};
use sqlx::PgPool;
use std::sync::Arc;
use tower_http::{
    cors::CorsLayer,
    trace::{DefaultMakeSpan, TraceLayer},
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod app_state;
mod controller;
mod domain;
mod errors;
mod repository;

// Re-export AppState for use in main.rs
pub use app_state::AppState;

pub fn app(db: PgPool) -> Router {
    let shared_state = Arc::new(AppState {
        bookmark_repository: Box::new(repository::bookmark::BookmarkRepository::new(db.clone())),
        tag_repository: Box::new(repository::tag::TagRepository::new(db.clone())),
    });

    Router::new()
        .route(
            "/v1/bookmarks",
            get(list_bookmarks)
                .post(create_bookmark)
                .put(update_bookmark)
                .delete(delete_bookmarks),
        )
        .route(
            "/v1/tags",
            get(list_tags)
                .post(create_tag)
                .put(update_tag)
                .delete(delete_tags),
        )
        .with_state(shared_state)
}
