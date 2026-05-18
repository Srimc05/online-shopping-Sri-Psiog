# PSIZOM – Premium Handcrafted Shirts E-Commerce Application

PSIZOM is a Firebase-powered e-commerce web application developed for showcasing and selling premium handcrafted shirts. The application includes separate modules for customers and administrators, providing a complete online shopping experience with product management, cart functionality, order processing, and invoice generation.

## Features

### Customer Module
1. User registration and login using email and password
2. Google Sign-In with Firebase Authentication
3. Browse products with search and category filtering
4. View detailed product information
5. Add products to cart
6. Update quantities and remove items from cart
7. Real-time cart item count in the navigation bar
8. Checkout with cash or credit payment options
9. View order history
10. Download and print invoices

### Admin Module
1. Secure admin login based on authorized email addresses
2. Dashboard with summary statistics
3. Category management
4. Product management
5. Image upload to Firebase Storage
6. Customer management
7. Reports for sales and orders

## Technology Stack
1. HTML5
2. CSS3
3. JavaScript (ES Modules)
4. Firebase Authentication
5. Cloud Firestore
6. Firebase Storage

## Project Structure

```text
online-shopping/
├── admin/
│   ├── dashboard.html
│   ├── categories.html
│   ├── products.html
│   ├── customers.html
│   └── reports.html
│
├── customer/
│   ├── home.html
│   ├── product-details.html
│   ├── cart.html
│   ├── checkout.html
│   ├── orders.html
│   └── invoice.html
│
├── assets/
│   ├── css/
│   │   ├── style.css
│   │   ├── admin.css
│   │   ├── customer.css
│   │   └── auth.css
│   │
│   └── js/
│       ├── admin/
│       ├── customer/
│       ├── services/
│       ├── auth.js
│       ├── firebase-config.js
│       ├── guards.js
│       ├── constants.js
│       └── utils.js
│
├── index.html
├── login.html
├── signup.html
└── forgot-password.html
```

## Firebase Collections

### users
1. Stores user profile information, roles, and credit limits.

### categories
1. Stores product categories such as Formal Shirts, Casual Shirts, and Linen Shirts.

### products
1. Stores product title, description, price, quantity, category, and image URL.

### carts
1. Stores shopping cart items for each customer.

### orders
1. Stores completed orders, payment details, and invoice information.

## Setup Instructions

1. Clone the repository.

```bash
git clone https://github.com/Srimc05/online-shopping-Sri-Psiog
```

2. Create a Firebase project.

3. Enable the following Firebase services:
   1. Authentication (Email/Password and Google Sign-In)
   2. Cloud Firestore
   3. Firebase Storage

4. Update `assets/js/firebase-config.js` with your Firebase configuration.

5. Add your admin email address to the `ADMIN_EMAILS` array in `assets/js/constants.js`.

6. Run the project using a local development server such as Live Server.

## Admin Access

1. Any email listed in `ADMIN_EMAILS` is automatically assigned the Admin role.
2. Admin users are redirected to the admin dashboard after login.

## Product Data

Products can be added through the admin panel with the following details:

1. Product Title
2. Description
3. Category
4. Price
5. Quantity
6. Product Image

## Author

Developed by Sri Sudhan M C as part of an academic project to build a complete e-commerce application using Firebase.

