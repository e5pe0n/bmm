use crate::controller::bookmarks::{
    create_bookmark, delete_bookmarks, list_bookmarks, update_bookmark,
};
use axum::{
    Router,
    http::{HeaderValue, Method},
    routing::get,
};
use sqlx::PgPool;
use std::sync::Arc;
use tower_http::cors::CorsLayer;

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
        .route(
            "/v1/bookmarks",
            get(list_bookmarks)
                .post(create_bookmark)
                .put(update_bookmark)
                .delete(delete_bookmarks),
        )
        .with_state(shared_state)
        .layer(
            CorsLayer::new()
                .allow_origin("http://localhost:5173".parse::<HeaderValue>().unwrap())
                .allow_methods([
                    Method::GET,
                    Method::DELETE,
                    Method::POST,
                    Method::PUT,
                    Method::OPTIONS,
                ])
                .allow_headers([
                    axum::http::header::CONTENT_TYPE,
                    axum::http::header::AUTHORIZATION,
                ])
                .allow_credentials(true),
        )
}
