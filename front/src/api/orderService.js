import { API_BASE_URL } from '../config';

// ✅ Get user's orders
export async function getMyOrders() {
  try {
    const loggedUser = JSON.parse(localStorage.getItem('loggedInUser')) ||
      JSON.parse(localStorage.getItem('user'));
    const token = loggedUser?.token;
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_BASE_URL}/orders/myorders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to fetch orders');
    const orders = await response.json();
    return orders;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
}

// ✅ Create new order
export async function createOrder(orderData) {
  try {
    const loggedUser = JSON.parse(localStorage.getItem('loggedInUser')) ||
      JSON.parse(localStorage.getItem('user'));
    const token = loggedUser?.token;
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) throw new Error('Failed to create order');
    const order = await response.json();
    return order;
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
}

// ✅ Get order by ID
export async function getOrderById(orderId) {
  try {
    const loggedUser = JSON.parse(localStorage.getItem('loggedInUser')) ||
      JSON.parse(localStorage.getItem('user'));
    const token = loggedUser?.token;
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to fetch order');
    const order = await response.json();
    return order;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

// ✅ Enroll in a free course
export async function enrollInFreeCourse(courseId) {
  try {
    const loggedUser = JSON.parse(localStorage.getItem('loggedInUser')) ||
      JSON.parse(localStorage.getItem('user'));
    const token = loggedUser?.token;
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_BASE_URL}/orders/free-enroll`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ courseId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to enroll in free course');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in free enrollment service:', error);
    throw error;
  }
}
