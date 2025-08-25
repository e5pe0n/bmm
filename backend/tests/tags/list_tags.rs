use axum::{body::Body, http::Request};
use http_body_util::BodyExt;
use serde_json::Value;
use sqlx::PgPool;
use tower::ServiceExt;

#[sqlx::test(fixtures("tags"))]
async fn test_list_tags(db: PgPool) {
    let app = backend::app(db);
    let resp = app
        .oneshot(Request::get("/v1/tags").body(Body::empty()).unwrap())
        .await
        .unwrap();

    assert_eq!(resp.status(), 200);
    let body = resp.into_body().collect().await.unwrap().to_bytes();
    let body: Value = serde_json::from_slice(&body).unwrap();
    let body = body.as_array().unwrap();
    assert_eq!(body.len(), 3);
    assert_eq!(body[0]["id"], 1);
    assert_eq!(body[0]["name"], "Linux");
    assert_eq!(body[0]["color"], "#0000ff");
    assert_eq!(body[1]["id"], 2);
    assert_eq!(body[1]["name"], "Rust");
    assert_eq!(body[1]["color"], "#00ff00");
    assert_eq!(body[2]["id"], 3);
    assert_eq!(body[2]["name"], "TypeScript");
    assert_eq!(body[2]["color"], "#ff0000");
}
