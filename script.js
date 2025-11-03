// script.js — Online Bookstore Website frontend logic
// This file handles fetching books, login/register, and cart operations using RESTful APIs.

const apiBaseUrl = "http://localhost:5000/api";

// -------------------- LOGIN FUNCTION --------------------
async function loginUser(email, password) {
  try {
    const response = await fetch(`${apiBaseUrl}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      alert("Login successful!");
      if (data.role === "admin") {
        window.location.href = "/admin-dashboard.html";
      } else {
        window.location.href = "/user-dashboard.html";
      }
    } else {
      alert(data.message || "Invalid login credentials!");
    }
  } catch (err) {
    console.error(err);
    alert("Error logging in. Please try again.");
  }
}

// -------------------- REGISTER FUNCTION --------------------
async function registerUser(name, email, password) {
  try {
    const response = await fetch(`${apiBaseUrl}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      alert("Registration successful! Please login.");
      window.location.href = "/login.html";
    } else {
      alert(data.message || "Registration failed!");
    }
  } catch (err) {
    console.error(err);
    alert("Error registering user.");
  }
}

// -------------------- FETCH ALL BOOKS --------------------
async function fetchBooks() {
  try {
    const response = await fetch(`${apiBaseUrl}/books`);
    const books = await response.json();

    const container = document.getElementById("book-list");
    container.innerHTML = "";

    books.forEach((book) => {
      const bookCard = document.createElement("div");
      bookCard.className = "book-card";
      bookCard.innerHTML = `
        <img src="${book.image}" alt="${book.title}">
        <h3>${book.title}</h3>
        <p>by ${book.author}</p>
        <p>₹${book.price}</p>
        <button onclick="addToCart('${book._id}')">Add to Cart</button>
      `;
      container.appendChild(bookCard);
    });
  } catch (err) {
    console.error(err);
    alert("Error loading books!");
  }
}

// -------------------- ADD TO CART --------------------
async function addToCart(bookId) {
  const token = localStorage.getItem("token");
  if (!token) return alert("Please login to add items to cart!");

  try {
    const response = await fetch(`${apiBaseUrl}/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bookId }),
    });

    const data = await response.json();
    if (response.ok) {
      alert("Book added to cart!");
    } else {
      alert(data.message || "Failed to add book to cart.");
    }
  } catch (err) {
    console.error(err);
  }
}

// -------------------- FETCH CART ITEMS --------------------
async function fetchCart() {
  const token = localStorage.getItem("token");
  if (!token) return alert("Please login to view your cart!");

  try {
    const response = await fetch(`${apiBaseUrl}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const cartItems = await response.json();

    const cartContainer = document.getElementById("cart-list");
    cartContainer.innerHTML = "";

    cartItems.forEach((item) => {
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <h4>${item.book.title}</h4>
        <p>₹${item.book.price}</p>
        <button onclick="removeFromCart('${item.book._id}')">Remove</button>
      `;
      cartContainer.appendChild(row);
    });
  } catch (err) {
    console.error(err);
  }
}

// -------------------- REMOVE FROM CART --------------------
async function removeFromCart(bookId) {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`${apiBaseUrl}/cart/remove/${bookId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (response.ok) {
      alert("Item removed from cart.");
      fetchCart();
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
  }
}

// -------------------- LOGOUT --------------------
function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  alert("Logged out successfully.");
  window.location.href = "/login.html";
}

// Call `fetchBooks()` automatically if book-list container exists
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("book-list")) fetchBooks();
});
