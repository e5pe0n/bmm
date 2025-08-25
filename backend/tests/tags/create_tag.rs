use axum::{body::Body, http::Request};
use http_body_util::BodyExt;
use serde_json::{Value, json};
use sqlx::PgPool;
use tower::ServiceExt;

#[sqlx::test()]
async fn test_create_tag(db: PgPool) {
    let app = backend::app(db);
    let new_tag = json!({
        "name": "Linux",
        "color": "#0000ff"
    });

    let resp = app
        .oneshot(
            Request::post("/v1/tags")
                .header("Content-Type", "application/json")
                .body(Body::from(new_tag.to_string()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(resp.status(), 201);
    let body = resp.into_body().collect().await.unwrap().to_bytes();
    let body: Value = serde_json::from_slice(&body).unwrap();

    assert_eq!(body["name"], "Linux");
    assert_eq!(body["color"], "#0000ff");
}
