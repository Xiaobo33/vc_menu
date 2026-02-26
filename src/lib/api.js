export async function adminLogin(token) {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });

  if (!res.ok) {
    throw new Error('口令错误');
  }

  return res.json();
}

export async function getAdminOrders(token) {
  const res = await fetch('/api/admin/orders', {
    headers: {
      'x-admin-token': token
    }
  });

  if (!res.ok) {
    throw new Error('读取订单失败');
  }

  return res.json();
}

export async function updateOrderStatus(token, orderId, status) {
  const res = await fetch('/api/admin/update-order-status', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': token
    },
    body: JSON.stringify({ orderId, status })
  });

  if (!res.ok) {
    throw new Error('更新状态失败');
  }

  return res.json();
}
