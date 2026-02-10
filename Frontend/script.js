// 📦 Select DOM Elements
const postsContainer = document.getElementById("postsContainer");
const formContainer = document.getElementById("formContainer");
const itemForm = document.getElementById("itemForm");
const imagePreview = document.getElementById("imagePreview");

let currentType = "";
let base64Image = "";
let formVisible = false;

// 🧭 Toggle Between Lost & Found Form
function toggleForm(type) {
  const title = document.getElementById("formTitle");

  // If same type clicked again, hide form
  if (formVisible && currentType === type) {
    formContainer.classList.add("hidden");
    postsContainer.classList.remove("hidden");
    formVisible = false;
    currentType = "";
    return;
  }

  // Otherwise, open form for the selected type
  currentType = type;
  title.textContent = type === "lost" ? "Report Lost Item" : "Report Found Item";

  // Reset form each time it opens
  itemForm.reset();
  imagePreview.innerHTML = "";
  base64Image = "";

  formContainer.classList.remove("hidden");
  postsContainer.classList.add("hidden");
  formVisible = true;
}

// 📷 Preview and Convert Image to Base64
function previewImage(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      base64Image = e.target.result;
      imagePreview.innerHTML = `<img src="${base64Image}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
  }
}

// 💾 Submit Form → Save Item to MongoDB
itemForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  if (!currentType) {
    alert("Please choose whether you are reporting a Lost or Found item.");
    return;
  }

  const newItem = {
    person: document.getElementById("personName").value.trim(),
    contact: document.getElementById("contact").value.trim(),
    item: document.getElementById("itemName").value.trim(),
    location: document.getElementById("location").value.trim(),
    desc: document.getElementById("description").value.trim(),
    dateTime: new Date().toLocaleString(),
    img: base64Image || "",
  };

  const apiUrl =
    currentType === "lost"
      ? "http://localhost:5000/api/lost"
      : "http://localhost:5000/api/found";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });

    if (!response.ok) throw new Error("Failed to save item");

    alert(
      `✅ ${currentType === "lost" ? "Lost" : "Found"} item reported successfully!`
    );

    // Reset form and show posts again
    itemForm.reset();
    imagePreview.innerHTML = "";
    formContainer.classList.add("hidden");
    postsContainer.classList.remove("hidden");
    formVisible = false;

    // Reload updated posts
    loadPosts();
  } catch (err) {
    console.error("❌ Error saving item:", err);
    alert("Error saving item. Check backend connection or MongoDB.");
  }
});

// 🧩 Load Items from MongoDB
async function loadPosts(type = "all") {
  try {
    let url = "";

    // Different endpoints for lost/found/all
    if (type === "lost") url = "http://localhost:5000/api/lost";
    else if (type === "found") url = "http://localhost:5000/api/found";
    else url = "http://localhost:5000/api/all";

    const res = await fetch(url);
    const data = await res.json();

    // Adjust to handle response structure
    const posts = data.data || data;
    displayPosts(posts, type);
  } catch (err) {
    console.error("❌ Error loading posts:", err);
  }
}

// 🎨 Display Items
function displayPosts(posts, type = "all") {
  postsContainer.classList.remove("hidden");
  postsContainer.innerHTML = "";

  if (!posts || posts.length === 0) {
    postsContainer.innerHTML = `<p style="text-align:center; color:#666;">No ${
      type === "all" ? "" : type
    } items found.</p>`;
    return;
  }

  posts.forEach((post) => {
    const postEl = document.createElement("div");
    postEl.classList.add("post");

    const color = post.type === "lost" ? "#ff6b6b" : "#1dd1a1"; // red for lost, green for found

    postEl.innerHTML = `
      ${post.img ? `<img src="${post.img}" alt="${post.item}">` : ""}
      <h3 style="color:${color}">${post.item}</h3>
      <p><strong>Type:</strong> ${post.type ? post.type.toUpperCase() : type.toUpperCase()}</p>
      <p><strong>Location:</strong> ${post.location}</p>
      <p><strong>Description:</strong> ${post.desc}</p>
      <p><strong>Reported By:</strong> ${post.person}</p>
      <p><strong>Contact:</strong> ${post.contact}</p>
      <p class="date-time">${post.dateTime}</p>
      ${
        type === "found"
          ? `<button class="done-btn" onclick="markAsDone('${post._id}', '${type}')">✅ Mark as Done</button>`
          : ""
      }
    `;
    postsContainer.appendChild(postEl);
  });
}

// 🗑 Delete Found Item (Mark as Done)
async function markAsDone(id, type) {
  try {
    const endpoint =
      type === "found"
        ? `http://localhost:5000/api/found/${id}`
        : `http://localhost:5000/api/lost/${id}`;

    await fetch(endpoint, { method: "DELETE" });

    alert("✅ Item marked as done and removed from the list.");
    loadPosts(type);
  } catch (err) {
    console.error("❌ Error deleting item:", err);
  }
}

// 🔍 Filter Buttons (Show All / Lost / Found)
function filterPosts(type) {
  loadPosts(type);
  formContainer.classList.add("hidden");
  formVisible = false;
}

// 🧾 Auto-load All Items on Startup
window.onload = () => loadPosts();
// ✅ Mark a Lost Item as Found (delete from DB)
async function markLostAsFound(id) {
  const confirmDelete = confirm("🎉 Have you found this item? It will be removed from lost list.");
  if (!confirmDelete) return;

  try {
    const response = await fetch(`http://localhost:5000/api/lost/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("✅ Great! The item is marked as found and removed from Lost Items.");
      location.reload();
    } else {
      alert("❌ Failed to mark as found.");
    }
  } catch (error) {
    console.error("Error marking lost item as found:", error);
    alert("⚠️ Something went wrong while updating.");
  }
}
function deleteItem(id) {
  if (confirm("Are you sure you want to delete this item?")) {
    fetch(`http://localhost:5000/api/items/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        alert("Item deleted!");
        location.reload();
      });
  }
}
