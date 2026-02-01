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
  const isBundle = order.isBundle;
  const courses = order.bundleCourses || [];

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
    
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; }
    .badge-bundle { background-color: rgba(255,255,255,0.2); color: #ffffff; border: 1px solid rgba(255,255,255,0.4); }

    /* Course Card Styling */
    .course-card { background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e5e7eb; margin-bottom: 32px; text-align: left; }
    .course-details { padding: 20px; }
    .course-title { font-weight: 800; color: #111827; font-size: 18px; margin-bottom: 8px; line-height: 1.4; }
    .course-meta { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; padding-top: 12px; border-top: 1px dashed #e5e7eb; }
    .price-tag { background-color: #ecfdf5; color: #059669; font-weight: 700; padding: 4px 12px; border-radius: 9999px; font-size: 14px; }
    .order-id { font-size: 12px; color: #9ca3af; font-family: monospace; }
    
    /* Bundle List Styling */
    .bundle-list { text-align: left; background-color: #f9fafb; border-radius: 16px; padding: 20px; border: 1px solid #f3f4f6; margin-bottom: 32px; }
    .bundle-item { display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #eeeff1; }
    .bundle-item:last-child { border-bottom: none; }
    .bundle-item-icon { color: #10b981; margin-right: 12px; font-size: 18px; }
    .bundle-item-content { font-size: 14px; font-weight: 600; color: #1f2937; }

    .btn { display: inline-block; background-color: #059669; color: #ffffff !important; padding: 16px 32px; border-radius: 14px; text-decoration: none; font-weight: 700; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); font-size: 16px; }
    .btn:hover { background-color: #047857; transform: translateY(-1px); }
    
    .footer { background-color: #f9fafb; padding: 24px; text-align: center; font-size: 13px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
    .success-icon { background: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 40px; border: 2px solid rgba(255,255,255,0.3); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
        ${isBundle ? '<div class="badge badge-bundle">Bundle Package</div>' : ''}
        <div class="success-icon">🎉</div>
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">You're In!</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 16px;">Order successfully approved</p>
    </div>
    <div class="content">
      <div class="greeting">Hello, ${order.userDetails?.firstName || 'Student'}!</div>
      <div class="message">
        We're excited to have you on board. Your payment for <strong>${order.courseTitle || order.courseDetails?.title}</strong> has been verified successfully.
      </div>
      
      ${isBundle && courses.length > 0 ? `
      <div style="text-align: left; margin-bottom: 12px;">
        <span style="font-size: 12px; font-weight: 800; color: #0891b2; text-transform: uppercase; letter-spacing: 0.05em;">Included Courses (${courses.length})</span>
      </div>
      <div class="bundle-list">
        ${courses.map(c => `
          <div class="bundle-item">
            <span class="bundle-item-icon">✓</span>
            <span class="bundle-item-content">${c.title}</span>
          </div>
        `).join('')}
      </div>
      ` : `
      <div class="course-card">
        <div class="course-details">
            <div class="course-title">${order.courseDetails?.title}</div>
            <div class="course-meta">
                <span class="order-id">ID: #${order._id.toString().slice(-6).toUpperCase()}</span>
                <span class="price-tag">$${order.finalPrice}</span>
            </div>
        </div>
      </div>
      `}
      
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

export const bundleAnnouncementTemplate = (bundle, courses, studentName) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0fdf4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15); border: 1px solid #dcfce7; }
    .header { background: linear-gradient(135deg, #064e3b 0%, #059669 100%); padding: 50px 30px; text-align: center; position: relative; }
    .header-icon { font-size: 50px; margin-bottom: 15px; display: block; }
    .content { padding: 40px 35px; color: #1f2937; }
    .badge { display: inline-block; background-color: #fef3c7; color: #92400e; padding: 6px 16px; border-radius: 9999px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px; }
    .greeting { font-size: 24px; font-weight: 800; color: #064e3b; margin-bottom: 15px; }
    .intro { font-size: 17px; line-height: 1.7; color: #4b5563; margin-bottom: 30px; }
    
    .bundle-box { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 20px; padding: 25px; margin-bottom: 35px; position: relative; }
    .bundle-title { font-size: 20px; font-weight: 800; color: #111827; margin-bottom: 20px; border-bottom: 2px solid #ecfdf5; padding-bottom: 10px; }
    
    .course-list { list-style: none; padding: 0; margin: 0; }
    .course-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
    .course-item:last-child { border-bottom: none; }
    .check-icon { color: #10b981; font-weight: bold; font-size: 18px; }
    
    .price-section { margin-top: 25px; display: flex; align-items: center; justify-content: space-between; background: white; padding: 15px 20px; border-radius: 12px; border: 1px solid #ecfdf5; }
    .price-label { font-size: 14px; font-weight: 600; color: #6b7280; }
    .price-value { font-size: 28px; font-weight: 900; color: #059669; }
    
    .cta-container { text-align: center; margin-top: 40px; }
    .btn { display: inline-block; background: #059669; color: #ffffff !important; padding: 18px 40px; border-radius: 16px; text-decoration: none; font-weight: 800; font-size: 18px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3); }
    .btn:hover { background: #047857; transform: translateY(-3px); box-shadow: 0 20px 25px -5px rgba(16, 185, 129, 0.4); }
    
    .footer { background-color: #f9fafb; padding: 30px; text-align: center; color: #9ca3af; border-top: 1px solid #f1f5f9; }
    .footer p { margin: 5px 0; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="header-icon">🎁</span>
      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -0.02em;">New Bundle Alert!</h1>
      <p style="color: #d1fae5; margin: 10px 0 0; font-size: 18px; font-weight: 500;">Exclusive value package of multiple courses</p>
    </div>
    
    <div class="content">
      <div class="badge">Bundle Discount</div>
      <div class="greeting">Hello, ${studentName}!</div>
      <div class="intro">
        We're excited to announce a new course bundle! This is a great opportunity to learn multiple skills at a significantly discounted price compared to buying them individually.
      </div>
      
      <div class="bundle-box">
        <div class="bundle-title">${bundle.title}</div>
        <ul class="course-list">
          ${courses.map(c => `
            <li class="course-item">
              <span class="check-icon">✓</span>
              <span style="font-weight: 600; color: #374151;">${c.title}</span>
            </li>
          `).join('')}
        </ul>
        
        <div class="price-section">
          <span class="price-label">Bundle Price:</span>
          <span class="price-value">$${bundle.price}</span>
        </div>
      </div>
      
      <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 35px; border-radius: 8px;">
        <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.5;">
          <strong>Why this bundle?</strong> By purchasing this bundle, you get all the courses listed above for more than 50% less than if you bought them individually.
        </p>
      </div>

      <div class="cta-container">
        <a href="${clientUrl}/courses" class="btn">Enrol Now →</a>
      </div>
    </div>
    
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Xirfadbare Academy.</p>
      <p>Learn quality skills, master your future.</p>
      <p style="margin-top: 15px; font-size: 11px;">Mogadishu, Somalia</p>
    </div>
  </div>
</body>
</html>
  `;
};
