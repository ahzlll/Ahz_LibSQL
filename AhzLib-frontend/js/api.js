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
      // 提取错误消息的多种方式
      let message = "请求失败";
      
      if (typeof data === "string") {
        // 如果响应是纯字符串，直接使用
        message = data || `请求失败 (${resp.status})`;
      } else if (data) {
        // 如果是对象，尝试多种可能的字段
        message = data.message || data.error || data.msg || data.errorMessage || 
                  (typeof data === "object" && Object.keys(data).length > 0 
                    ? JSON.stringify(data) 
                    : `请求失败 (${resp.status})`);
      } else {
        // 如果没有响应体，根据状态码提供默认消息
        message = getDefaultErrorMessage(resp.status);
      }
      
      throw new Error(message);
    }
    return data;
  } catch (err) {
    // 如果是网络错误或其他错误
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      console.error("API error: Network error", err);
      throw new Error("网络连接失败，请检查服务器是否运行");
    }
    // 如果错误已经有消息，直接抛出
    if (err.message) {
      console.error("API error:", err.message);
      throw err;
    }
    // 否则提供默认错误消息
    console.error("API error", err);
    throw new Error(err.message || "请求失败，请稍后重试");
  }
}

// 根据HTTP状态码返回默认错误消息
function getDefaultErrorMessage(status) {
  const statusMessages = {
    400: "请求参数错误",
    401: "未授权，请重新登录",
    403: "没有权限执行此操作",
    404: "请求的资源不存在",
    405: "请求方法不允许",
    409: "数据冲突，可能已存在相同记录",
    422: "数据验证失败",
    500: "服务器内部错误，请稍后重试",
    502: "网关错误",
    503: "服务暂时不可用",
    504: "请求超时",
  };
  return statusMessages[status] || `请求失败 (HTTP ${status})`;
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
  createReaderType(readerType) {
    return apiRequest("/api/reader-types", {
      method: "POST",
      body: JSON.stringify(readerType),
    });
  },
  updateReaderType(id, readerType) {
    return apiRequest("/api/reader-types/" + id, {
      method: "PUT",
      body: JSON.stringify(readerType),
    });
  },
  deleteReaderType(id) {
    return apiRequest("/api/reader-types/" + id, { method: "DELETE" });
  },
  getPublishers() {
    return apiRequest("/api/publishers", { method: "GET" });
  },
  createPublisher(publisher) {
    return apiRequest("/api/publishers", {
      method: "POST",
      body: JSON.stringify(publisher),
    });
  },
  updatePublisher(id, publisher) {
    return apiRequest("/api/publishers/" + id, {
      method: "PUT",
      body: JSON.stringify(publisher),
    });
  },
  deletePublisher(id) {
    return apiRequest("/api/publishers/" + id, { method: "DELETE" });
  },
  getAuthors() {
    return apiRequest("/api/authors", { method: "GET" });
  },
  createAuthor(author) {
    return apiRequest("/api/authors", {
      method: "POST",
      body: JSON.stringify(author),
    });
  },
  updateAuthor(id, author) {
    return apiRequest("/api/authors/" + id, {
      method: "PUT",
      body: JSON.stringify(author),
    });
  },
  deleteAuthor(id) {
    return apiRequest("/api/authors/" + id, { method: "DELETE" });
  },
  getBooks() {
    return apiRequest("/api/books", { method: "GET" });
  },
  createBook(book) {
    return apiRequest("/api/books", {
      method: "POST",
      body: JSON.stringify(book),
    });
  },
  updateBook(id, book) {
    return apiRequest("/api/books/" + id, {
      method: "PUT",
      body: JSON.stringify(book),
    });
  },
  deleteBook(id) {
    return apiRequest("/api/books/" + id, { method: "DELETE" });
  },
  getBookCopies() {
    return apiRequest("/api/book-copies", { method: "GET" });
  },
  createBookCopy(copy) {
    return apiRequest("/api/book-copies", {
      method: "POST",
      body: JSON.stringify(copy),
    });
  },
  updateBookCopy(id, copy) {
    return apiRequest("/api/book-copies/" + id, {
      method: "PUT",
      body: JSON.stringify(copy),
    });
  },
  deleteBookCopy(id) {
    return apiRequest("/api/book-copies/" + id, { method: "DELETE" });
  },
  createBookCopiesBatch(data) {
    return apiRequest("/api/book-copies/batch", {
      method: "POST",
      body: JSON.stringify(data),
    });
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
  searchBorrowRecordsByReader(keyword) {
    return apiRequest(
      "/api/borrow-records/search-by-reader?keyword=" +
        encodeURIComponent(keyword),
      { method: "GET" }
    );
  },
  searchBorrowRecordsByBook(keyword) {
    return apiRequest(
      "/api/borrow-records/search-by-book?keyword=" +
        encodeURIComponent(keyword),
      { method: "GET" }
    );
  },
  searchUnreturnedRecordsByReader(keyword) {
    return apiRequest(
      "/api/borrow-records/search-unreturned-by-reader?keyword=" +
        encodeURIComponent(keyword),
      { method: "GET" }
    );
  },
  searchUnreturnedRecordsByBook(keyword) {
    return apiRequest(
      "/api/borrow-records/search-unreturned-by-book?keyword=" +
        encodeURIComponent(keyword),
      { method: "GET" }
    );
  },
  getAllUnreturnedRecords() {
    return apiRequest("/api/borrow-records/unreturned", { method: "GET" });
  },
  getRecentBorrowRecords(page, size) {
    page = page || 0;
    size = size || 10;
    return apiRequest(
      "/api/borrow-records/recent?page=" + page + "&size=" + size,
      { method: "GET" }
    );
  },
  getRecentFinePayments(limit) {
    return apiRequest(
      "/api/fines/recent?limit=" + (limit || 10),
      { method: "GET" }
    );
  },
  searchFinePayments(keyword) {
    return apiRequest(
      "/api/fines/search?keyword=" + encodeURIComponent(keyword),
      { method: "GET" }
    );
  },
  getUnpaidFines() {
    return apiRequest("/api/fines/unpaid", { method: "GET" });
  },
  searchUnpaidFines(keyword) {
    return apiRequest(
      "/api/fines/unpaid/search?keyword=" + encodeURIComponent(keyword),
      { method: "GET" }
    );
  },
  getDashboardStats() {
    return apiRequest("/api/statistics/dashboard", { method: "GET" });
  },
};
