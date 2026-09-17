// Sample data. Swap this file for a fetch() against your real API —
// app.js only reads window.DASHBOARD_DATA.
window.DASHBOARD_DATA = {
  metrics: {
    revenue: { value: 428500, format: 'currency' },
    users: { value: 12904, format: 'number' },
    orders: { value: 1284, format: 'number' },
    churn: { value: 2.1, format: 'percent' }
  },

  revenueByMonth: [
    { month: 'Oct', value: 268000 },
    { month: 'Nov', value: 291000 },
    { month: 'Dec', value: 344000 },
    { month: 'Jan', value: 302000 },
    { month: 'Feb', value: 318000 },
    { month: 'Mar', value: 356000 },
    { month: 'Apr', value: 341000 },
    { month: 'May', value: 372000 },
    { month: 'Jun', value: 389000 },
    { month: 'Jul', value: 364000 },
    { month: 'Aug', value: 402000 },
    { month: 'Sep', value: 428500 }
  ],

  activity: [
    { customer: 'Northwind Trading', event: 'Subscription renewed', amount: 4800, status: 'paid' },
    { customer: 'Acme Logistics', event: 'Plan upgraded', amount: 1250, status: 'paid' },
    { customer: 'Bluebird Media', event: 'Invoice issued', amount: 960, status: 'pending' },
    { customer: 'Harbor Analytics', event: 'Payment retried', amount: 2400, status: 'failed' },
    { customer: 'Stellar Foods', event: 'New signup', amount: 480, status: 'paid' },
    { customer: 'Vertex Labs', event: 'Seats added', amount: 720, status: 'pending' }
  ]
};
