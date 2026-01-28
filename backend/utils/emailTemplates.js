export const verificationEmailTemplate = (otp, expirationMinutes) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
    .container { max-width: 500px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .content { padding: 40px 30px; text-align: center; color: #1f2937; }
    .greeting { font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 16px; }
    .message { font-size: 16px; color: #4b5563; line-height: 1.6; margin-bottom: 32px; }
    .otp-container { background-color: #ecfdf5; border-radius: 12px; padding: 24px; margin-bottom: 32px; border: 1px dashed #34d399; display: inline-block; min-width: 200px; }
    .otp-code { font-size: 32px; font-weight: 800; color: #059669; letter-spacing: 0.25em; font-family: monospace; display: block; margin-bottom: 8px; }
    .otp-label { font-size: 12px; font-weight: 600; text-transform: uppercase; color: #059669; letter-spacing: 0.05em; opacity: 0.8; }
    .expiry { font-size: 14px; color: #ef4444; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 6px; }
    .footer { background-color: #f9fafb; padding: 24px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
    .footer p { margin: 4px 0; }
    .highlight { color: #10b981; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Xirfadbare</h1>
    </div>
    <div class="content">
      <div class="greeting">Asalaamu Alaykum 👋</div>
      <div class="message">
        We received a request to access your <span class="highlight">Xirfadbare</span> account. 
        Use the verification code below to complete your login securely.
      </div>
      
      <div class="otp-container">
        <span class="otp-code">${otp}</span>
        <span class="otp-label">Verification Code</span>
      </div>
      
      <div class="expiry">
        <span>⏰</span> This code expires in ${expirationMinutes} minutes.
      </div>
      
      <div style="margin-top: 32px; padding-top: 32px; border-top: 1px solid #f3f4f6;">
        <p style="font-size: 13px; color: #6b7280; margin: 0;">
          If you didn't request this code, simply ignore this email. Your account remains secure.
        </p>
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Xirfadbare Academy.</p>
      <p>Mogadishu, Somalia • <a href="#" style="color: #6b7280; text-decoration: underline;">Privacy Policy</a></p>
    </div>
  </div>
</body>
</html>
  `;
};

export const orderApprovedTemplate = (order) => {


  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); border: 1px solid #e5e7eb; }
    .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 40px 20px; text-align: center; position: relative; }
    .content { padding: 40px 30px; text-align: center; color: #374151; }
    .greeting { font-size: 22px; font-weight: 700; color: #111827; margin-bottom: 12px; }
    .message { font-size: 16px; color: #4b5563; line-height: 1.6; margin-bottom: 32px; }
    
    /* Course Card Styling */
    .course-card { background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e5e7eb; margin-bottom: 32px; text-align: left; }
    .course-image { width: 100%; height: 200px; object-fit: cover; display: block; border-bottom: 1px solid #e5e7eb; }
    .course-details { padding: 20px; }
    .course-title { font-weight: 800; color: #111827; font-size: 18px; margin-bottom: 8px; line-height: 1.4; }
    .course-meta { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e5e7eb; }
    .price-tag { background-color: #ecfdf5; color: #059669; font-weight: 700; padding: 4px 12px; border-radius: 9999px; font-size: 14px; }
    .order-id { font-size: 12px; color: #9ca3af; font-family: monospace; }
    
    .btn { display: inline-block; background-color: #059669; color: #ffffff !important; padding: 16px 32px; border-radius: 14px; text-decoration: none; font-weight: 700; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.2); font-size: 16px; }
    .btn:hover { background-color: #047857; transform: translateY(-1px); box-shadow: 0 6px 8px -1px rgba(5, 150, 105, 0.3); color: #ffffff !important; }
    
    .footer { background-color: #f9fafb; padding: 24px; text-align: center; font-size: 13px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
    .success-icon { background: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 40px; border: 2px solid rgba(255,255,255,0.3); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
        <div class="success-icon">🎉</div>
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">You're In!</h1>
        <p style="color: #ecfdf5; margin: 8px 0 0; font-size: 16px;">Order successfully approved</p>
    </div>
    <div class="content">
      <div class="greeting">Hello, ${order.userDetails?.firstName || 'Student'}!</div>
      <div class="message">
        We're excited to have you on board. Your payment for <strong>${order.courseDetails?.title}</strong> has been verified successfully.
      </div>
      
      <div class="course-card">

        <div class="course-details">
            <div class="course-title">${order.courseDetails?.title}</div>
            <div class="course-meta">
                <span class="order-id">ID: #${order._id.toString().slice(-6).toUpperCase()}</span>
                <span class="price-tag">$${order.finalPrice}</span>
            </div>
        </div>
      </div>
      
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard/my-courses" class="btn" style="color: #ffffff !important;">Start Learning Now</a>
      
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Xirfadbare Academy.</p>
      <p style="margin-top: 8px;">Mogadishu, Somalia</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const orderRejectedTemplate = (order) => {


  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); border: 1px solid #e5e7eb; }
    .header { background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); padding: 40px 20px; text-align: center; }
    .content { padding: 40px 30px; text-align: center; color: #374151; }
    .greeting { font-size: 22px; font-weight: 700; color: #111827; margin-bottom: 12px; }
    .message { font-size: 16px; color: #4b5563; line-height: 1.6; margin-bottom: 32px; }
    
    /* Course Card Styling */
    .course-card { background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #fee2e2; margin-bottom: 32px; text-align: left; opacity: 0.8; }
    .course-image { width: 100%; height: 200px; object-fit: cover; display: block; filter: grayscale(100%); border-bottom: 1px solid #e5e7eb; }
    .course-details { padding: 20px; }
    .course-title { font-weight: 800; color: #111827; font-size: 18px; margin-bottom: 8px; line-height: 1.4; }
    .course-meta { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e5e7eb; }
    .price-tag { background-color: #fee2e2; color: #b91c1c; font-weight: 700; padding: 4px 12px; border-radius: 9999px; font-size: 14px; text-decoration: line-through; }
    .order-id { font-size: 12px; color: #9ca3af; font-family: monospace; }
    
    .btn { display: inline-block; background-color: #ef4444; color: #ffffff !important; padding: 16px 32px; border-radius: 14px; text-decoration: none; font-weight: 700; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2); font-size: 16px; }
    .btn:hover { background-color: #dc2626; transform: translateY(-1px); box-shadow: 0 6px 8px -1px rgba(239, 68, 68, 0.3); color: #ffffff !important; }
    
    .footer { background-color: #f9fafb; padding: 24px; text-align: center; font-size: 13px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
    .error-icon { background: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 40px; border: 2px solid rgba(255,255,255,0.3); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
        <div class="error-icon">⚠️</div>
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Payment Issue</h1>
        <p style="color: #fee2e2; margin: 8px 0 0; font-size: 16px;">Action required for your order</p>
    </div>
    <div class="content">
      <div class="greeting">Hi ${order.userDetails?.firstName || 'Student'},</div>
      <div class="message">
        We reviewed your order for <strong>${order.courseDetails?.title}</strong> but couldn't verify the payment at this time.
      </div>
      
      <div class="course-card">

        <div class="course-details">
            <div class="course-title">${order.courseDetails?.title}</div>
            <div class="course-meta">
                <span class="order-id">ID: #${order._id.toString().slice(-6).toUpperCase()}</span>
                <span class="price-tag">$${order.finalPrice}</span>
            </div>
        </div>
      </div>
      
      <div style="background-color: #fff1f2; border: 1px dashed #ef4444; border-radius: 12px; padding: 16px; margin-bottom: 32px; text-align: left;">
        <strong style="color: #991b1b; display: block; margin-bottom: 4px;">Common reasons:</strong>
        <ul style="margin: 0; padding-left: 20px; color: #7f1d1d; font-size: 14px;">
            <li>Screenshot is blurry or unclear</li>
            <li>Transaction ID doesn't match</li>
            <li>Payment amount is incorrect</li>
        </ul>
      </div>
      
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/contact" class="btn" style="color: #ffffff !important;">Contact Support</a>
      
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Xirfadbare Academy.</p>
      <p style="margin-top: 8px;">Mogadishu, Somalia</p>
    </div>
  </div>
</body>
</html>
  `;
};
