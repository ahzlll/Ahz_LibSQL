const API_BASE = "http://localhost:8080";

async function apiRequest(path, options) {
  const url = API_BASE + path;
  const defaultHeaders = {
    "Content-Type": "application/json",
  };
  const opts = Object.assign({ headers: defaultHeaders }, options || {});
  try {
    const resp = await fetch(url, opts);
    const text = await resp.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      data = text;
    }
    if (!resp.ok) {
      const message =
        typeof data === "string" ? data : (data && data.message) || "请求失败";
      throw new Error(message);
    }
    return data;
  } catch (err) {
    console.error("API error", err);
    throw err;
  }
}

const Api = {
  login(username, password) {
    return apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username: username, password: password }),
    });
  },
  getReaders() {
    return apiRequest("/api/readers", { method: "GET" });
  },
  createReader(reader) {
    return apiRequest("/api/readers", {
      method: "POST",
      body: JSON.stringify(reader),
    });
  },
  updateReader(id, reader) {
    return apiRequest("/api/readers/" + id, {
      method: "PUT",
      body: JSON.stringify(reader),
    });
  },
  deleteReader(id) {
    return apiRequest("/api/readers/" + id, { method: "DELETE" });
  },
  getReaderTypes() {
    return apiRequest("/api/reader-types", { method: "GET" });
  },
  getPublishers() {
    return apiRequest("/api/publishers", { method: "GET" });
  },
  getAuthors() {
    return apiRequest("/api/authors", { method: "GET" });
  },
  getBooks() {
    return apiRequest("/api/books", { method: "GET" });
  },
  getBookCopies() {
    return apiRequest("/api/book-copies", { method: "GET" });
  },
  borrow(data) {
    return apiRequest("/api/borrow", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  returnBook(data) {
    return apiRequest("/api/return", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  payFine(data) {
    return apiRequest("/api/fines/pay", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
