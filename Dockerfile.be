FROM rust:1-slim-bullseye AS builder
WORKDIR /usr/src/backend
COPY ./backend .
RUN cargo install --path .

FROM debian:bullseye-slim AS backend
# RUN apt-get update && apt-get install -y extra-runtime-dependencies && rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/local/cargo/bin/backend /usr/local/bin/backend
CMD ["backend"]

FROM rust:1-slim-bullseye AS db_migration
WORKDIR /usr/src/backend
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*
COPY ./backend .
RUN cargo install sqlx-cli --no-default-features --features native-tls,postgres
CMD ["sqlx", "migrate", "run"]
