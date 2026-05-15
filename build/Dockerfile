FROM debian:12-slim

ARG WASI_SDK_VERSION=24
ARG WASI_SDK_FULL=24.0

RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    make \
    xz-utils \
  && rm -rf /var/lib/apt/lists/*

RUN curl -sSL -o /tmp/wasi-sdk.tar.gz \
    "https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-${WASI_SDK_VERSION}/wasi-sdk-${WASI_SDK_FULL}-x86_64-linux.tar.gz" \
 && mkdir -p /opt/wasi-sdk \
 && tar -xzf /tmp/wasi-sdk.tar.gz -C /opt/wasi-sdk --strip-components=1 \
 && rm /tmp/wasi-sdk.tar.gz

ENV WASI_SDK_PATH=/opt/wasi-sdk
ENV PATH=/opt/wasi-sdk/bin:$PATH

WORKDIR /work
