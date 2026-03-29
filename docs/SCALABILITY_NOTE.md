# Scalability & Architecture Notes

## Current Architecture
Single-server Node.js + MongoDB deployment, suitable for development and small-scale production.

## Horizontal Scaling Strategy

### 1. Stateless API Layer (Ready Now)
JWT tokens are self-contained — no server-side session storage means any API instance can serve any request. Run multiple API containers behind a load balancer with zero config changes.

```
[Client] → [Nginx / AWS ALB] → [API Pod 1]
                             → [API Pod 2]
                             → [API Pod N]
```

### 2. Database Scaling
- **Read replicas**: Route GET requests to MongoDB secondaries; writes to primary.
- **Sharding**: Shard the `tasks` collection by `owner` field for even distribution.
- **Connection pooling**: Mongoose pools are already configured; tune `poolSize` per instance.

### 3. Caching Layer (Redis — pluggable)
Add Redis for:
- **Task list cache**: Cache paginated task queries with key `tasks:{userId}:{page}:{filters}`, TTL 60s. Invalidate on write.
- **Rate limit counters**: Replace in-memory rate limiter with Redis-backed `rate-limit-redis` for multi-instance accuracy.
- **Session blacklist**: Store invalidated JWT IDs for immediate logout across all instances.

```js
// Example cache wrapper pattern (drop into taskController.js)
const cacheKey = `tasks:${userId}:${JSON.stringify(filters)}`;
const cached = await redis.get(cacheKey);
if (cached) return ApiResponse.success(res, JSON.parse(cached));
const result = await Task.find(filter)...;
await redis.setex(cacheKey, 60, JSON.stringify(result));
```

### 4. Microservices Decomposition (Future)
Current modules map naturally to services:

| Module | Service | Protocol |
|---|---|---|
| Auth | auth-service | REST / gRPC |
| Tasks | task-service | REST |
| Notifications | notification-service | Event (NATS/Kafka) |
| Admin | admin-service | REST (internal) |

Use an API Gateway (Kong, AWS API GW) to route and enforce auth at the edge.

### 5. Message Queue for Async Jobs
Heavy operations (email notifications, report generation, bulk imports) should be offloaded to a queue:
- **Bull + Redis**: Already compatible with the stack.
- Pattern: controller enqueues job → worker processes → webhook/WS notifies client.

### 6. Kubernetes Deployment
```yaml
# Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  minReplicas: 2
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          averageUtilization: 60
```

### 7. Observability
- **Logging**: Winston → Fluentd → Elasticsearch / CloudWatch
- **Metrics**: Prometheus + Grafana (expose `/metrics` via `prom-client`)
- **Tracing**: OpenTelemetry → Jaeger for request tracing across services
- **Alerting**: PagerDuty / Opsgenie for P1 incidents

## Estimated Capacity (single instance)
| Load | Concurrent Users | RPS |
|---|---|---|
| Current | ~200 | ~500 |
| + Redis cache | ~1,000 | ~2,000 |
| + 4 instances + LB | ~4,000 | ~8,000 |
| + Microservices | 100,000+ | 50,000+ |
