import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "http://localhost:5000";

const loginSuccessRate = new Rate("login_success_rate");
const apiErrorRate = new Rate("api_error_rate");
const loginDuration = new Trend("login_duration");
const browseDuration = new Trend("browse_duration");
const productDuration = new Trend("product_duration");
const totalRequests = new Counter("total_requests");

export const options = {
  stages: [
    { duration: "30s", target: 100 },
    { duration: "1m", target: 300 },
    { duration: "1m", target: 500 },
    { duration: "1m", target: 500 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<3000"],
    api_error_rate: ["rate<0.15"],
  },
};

const PRODUCT_IDS = [];

function getRandomProductId() {
  if (PRODUCT_IDS.length > 0) {
    return PRODUCT_IDS[Math.floor(Math.random() * PRODUCTS.length)];
  }
  return null;
}

export default function () {
  const userIndex = __VU % 100;
  const rand = Math.random();

  if (rand < 0.4) {
    /* 40% — Browse products (public, no auth) */
    const res = http.get(`${BASE_URL}/api/products`, {
      tags: { endpoint: "products_list" },
    });
    browseDuration.add(res.timings.duration);
    totalRequests.add(1);

    check(res, {
      "products status 200": (r) => r.status === 200,
    });

    sleep(Math.random() * 2 + 0.5);

    /* Randomly fetch a product detail */
    try {
      const products = JSON.parse(res.body);
      const list = Array.isArray(products) ? products : products.products || [];
      if (list.length > 0) {
        const pid = list[Math.floor(Math.random() * list.length)]._id;
        const detailRes = http.get(`${BASE_URL}/api/products/${pid}`, {
          tags: { endpoint: "product_detail" },
        });
        productDuration.add(detailRes.timings.duration);
        totalRequests.add(1);
        check(detailRes, {
          "product detail status 200": (r) => r.status === 200,
        });
        sleep(Math.random() * 1.5 + 0.5);
      }
    } catch {}

  } else if (rand < 0.65) {
    /* 25% — Search products */
    const queries = ["ashwagandha", "turmeric", "tulsi", "brahmi", "triphala"];
    const q = queries[Math.floor(Math.random() * queries.length)];
    const res = http.get(`${BASE_URL}/api/products/search?search=${q}`, {
      tags: { endpoint: "search" },
    });
    browseDuration.add(res.timings.duration);
    totalRequests.add(1);
    check(res, {
      "search status 200": (r) => r.status === 200,
    });
    sleep(Math.random() * 2 + 0.5);

  } else if (rand < 0.85) {
    /* 20% — Login (shared IP, will hit 100/15min rate limit) */
    const email = `testuser${userIndex}@test.com`;
    const payload = JSON.stringify({ email, password: "Test@12345" });
    const params = { headers: { "Content-Type": "application/json" } };

    const res = http.post(`${BASE_URL}/api/auth/login`, payload, params, {
      tags: { endpoint: "login" },
    });
    loginDuration.add(res.timings.duration);
    totalRequests.add(1);

    const success = check(res, {
      "login status 200": (r) => r.status === 200,
      "has token": (r) => {
        try {
          return JSON.parse(r.body).token !== undefined;
        } catch {
          return false;
        }
      },
    });
    loginSuccessRate.add(success);
    sleep(Math.random() * 1 + 0.5);

    /* If logged in, try browsing orders */
    if (success) {
      try {
        const token = JSON.parse(res.body).token;
        const orderRes = http.get(`${BASE_URL}/api/orders/myorders`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          tags: { endpoint: "my_orders" },
        });
        totalRequests.add(1);
        check(orderRes, {
          "orders status 200 or 401": (r) => r.status === 200 || r.status === 401,
        });
        sleep(Math.random() * 1 + 0.5);
      } catch {}
    }

  } else {
    /* 15% — Get goals (public) */
    const res = http.get(`${BASE_URL}/api/goals/active`, {
      tags: { endpoint: "goals" },
    });
    browseDuration.add(res.timings.duration);
    totalRequests.add(1);
    check(res, {
      "goals status 200": (r) => r.status === 200,
    });
    sleep(Math.random() * 1 + 0.5);
  }

  /* Small sleep to simulate user think time */
  sleep(Math.random() * 0.5);
}

export function handleSummary(data) {
  const summary = {
    totalRequests: data.metrics.http_reqs?.values?.count || 0,
    avgDuration: data.metrics.http_req_duration?.values?.avg || 0,
    p95Duration: data.metrics.http_req_duration?.values?.["p(95)"] || 0,
    p99Duration: data.metrics.http_req_duration?.values?.["p(99)"] || 0,
    maxDuration: data.metrics.http_req_duration?.values?.max || 0,
    httpErrors: data.metrics.http_req_failed?.values?.rate || 0,
    loginSuccessRate: data.metrics.login_success_rate?.values?.rate || 0,
    apiErrorRate: data.metrics.api_error_rate?.values?.rate || 0,
    vusMax: data.metrics.vus_max?.values?.value || 0,
  };

  console.log("\n============================================");
  console.log("     HERB-ERA LOAD TEST RESULTS");
  console.log("============================================");
  console.log(`Total Requests:        ${summary.totalRequests}`);
  console.log(`Max VUs:               ${summary.vusMax}`);
  console.log(`Avg Response Time:     ${summary.avgDuration.toFixed(2)}ms`);
  console.log(`P95 Response Time:     ${summary.p95Duration.toFixed(2)}ms`);
  console.log(`P99 Response Time:     ${summary.p99Duration.toFixed(2)}ms`);
  console.log(`Max Response Time:     ${summary.maxDuration.toFixed(2)}ms`);
  console.log(`HTTP Error Rate:       ${(summary.httpErrors * 100).toFixed(2)}%`);
  console.log(`Login Success Rate:    ${(summary.loginSuccessRate * 100).toFixed(2)}%`);
  console.log(`API Error Rate:        ${(summary.apiErrorRate * 100).toFixed(2)}%`);
  console.log("============================================\n");

  return {
    "loadtest-results.json": JSON.stringify(summary, null, 2),
  };
}
