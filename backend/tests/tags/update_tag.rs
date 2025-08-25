use axum::{body::Body, http::Request};
use http_body_util::BodyExt;
use serde_json::{Value, json};
use sqlx::PgPool;
use tower::ServiceExt;

#[sqlx::test(fixtures("tags"))]
async fn test_update_tag(db: PgPool) {
    let app = backend::app(db);
    let updating_tag = json!({
        "id": 1,
        "name": "linux",
        "color": "#ff0000"
    });

    let resp = app
        .oneshot(
            Request::put("/v1/tags")
                .header("Content-Type", "application/json")
                .body(Body::from(updating_tag.to_string()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(resp.status(), 200);
    let body = resp.into_body().collect().await.unwrap().to_bytes();
    let body: Value = serde_json::from_slice(&body).unwrap();

    assert_eq!(body["name"], "linux");
    assert_eq!(body["color"], "#ff0000");
}
