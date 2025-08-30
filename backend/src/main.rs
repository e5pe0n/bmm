use anyhow::Context;
use axum::http::{HeaderName, Method};
use backend::app;
use dotenvy::dotenv;
use sqlx::postgres::PgPoolOptions;
use std::env;
use tower_http::{
    cors::CorsLayer,
    request_id::{MakeRequestUuid, PropagateRequestIdLayer, SetRequestIdLayer},
    trace::{DefaultMakeSpan, TraceLayer},
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

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

    let app = app(db);

    let x_request_id = HeaderName::from_static("x-request-id");

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| {
                format!(
                    "{}=debug,tower_http=debug,axum::rejection=trace",
                    env!("CARGO_CRATE_NAME")
                )
                .into()
            }),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let origins = [
        "http://localhost:5173".parse().unwrap(),
        ("chrome-extension://".to_string() + &ext_id)
            .parse()
            .unwrap(),
    ];

    let app = app
        .layer(
            CorsLayer::new()
                .allow_origin(origins)
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
        .layer(
            TraceLayer::new_for_http().make_span_with(DefaultMakeSpan::new().include_headers(true)),
        )
        .layer(SetRequestIdLayer::new(
            x_request_id.clone(),
            MakeRequestUuid::default(),
        ))
        .layer(PropagateRequestIdLayer::new(x_request_id));

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .context("failed to bind TcpListener")?;
    axum::serve(listener, app)
        .await
        .context("failed to start server")
}
