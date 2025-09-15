FROM rust:1-slim-bullseye as builder
WORKDIR /usr/src/backend
COPY ./backend .
RUN cargo sqlx prepare
RUN cargo install --path .

FROM debian:bullseye-slim
# RUN apt-get update && apt-get install -y extra-runtime-dependencies && rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/local/cargo/bin/backend /usr/local/bin/backend
CMD ["backend"]
