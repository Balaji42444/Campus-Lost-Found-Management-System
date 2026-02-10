async function savePost(name, contact, item, location, desc, img, dateTime) {
  const post = {
    person: name,
    contact,
    item,
    location,
    desc,
    img,
    type: currentType,
    dateTime
  };

  await fetch("http://localhost:5000/api/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(post)
  });

  loadPosts();
}
async function loadPosts(type = "all") {
  let url = "http://localhost:5000/api/items";
  if (type !== "all") url += `?type=${type}`;

  const res = await fetch(url);
  const data = await res.json();
  displayPosts(data);
}
async function deletePost(id) {
  await fetch(`http://localhost:5000/api/items/${id}`, { method: "DELETE" });
  loadPosts();
}
function filterPosts(type) {
  loadPosts(type);
}
window.onload = () => loadPosts();
