(function () {
  const authView = document.getElementById("auth-view");
  const appView = document.getElementById("app-view");

  const loginForm = document.getElementById("login-form");
  const loginMessage = document.getElementById("login-message");
  const logoutBtn = document.getElementById("logout-btn");

  const userNameEl = document.getElementById("user-name");
  const userRoleEl = document.getElementById("user-role");

  const navItems = document.querySelectorAll(".nav-item");
  const views = document.querySelectorAll(".content-view");

  const statReaders = document.getElementById("stat-readers");
  const statBooks = document.getElementById("stat-books");
  const statBorrowed = document.getElementById("stat-borrowed");
  const statUnpaidCount = document.getElementById("stat-unpaid-count");
  const statUnpaidTotal = document.getElementById("stat-unpaid-total");
  const statOverdue = document.getElementById("stat-overdue");

  // 读者管理相关元素
  const readersTbody = document.getElementById("readers-tbody");
  const btnAddReader = document.getElementById("btn-add-reader");
  const readerFormCard = document.getElementById("reader-form-card");
  const readerFormTitle = document.getElementById("reader-form-title");
  const readerForm = document.getElementById("reader-form");
  const readerFormMsg = document.getElementById("reader-form-message");
  const cancelReaderEditBtn = document.getElementById("cancel-reader-edit");
  const readerIdInput = document.getElementById("reader-id");
  const readerNoInput = document.getElementById("reader-no");
  const readerNameInput = document.getElementById("reader-name");
  const readerGenderInput = document.getElementById("reader-gender");
  const readerTypeSelect = document.getElementById("reader-type");
  const readerPhoneInput = document.getElementById("reader-phone");
  const readerEmailInput = document.getElementById("reader-email");

  // 其他列表
  const readerTypesTbody = document.getElementById("reader-types-tbody");
  const publishersTbody = document.getElementById("publishers-tbody");
  const authorsTbody = document.getElementById("authors-tbody");
  const booksTbody = document.getElementById("books-tbody");
  const bookCopiesTbody = document.getElementById("book-copies-tbody");

  // 借阅归还罚款
  const borrowForm = document.getElementById("borrow-form");
  const borrowMessage = document.getElementById("borrow-message");
  const borrowReaderNo = document.getElementById("borrow-reader-no");
  const borrowBarcode = document.getElementById("borrow-barcode");

  const returnForm = document.getElementById("return-form");
  const returnMessage = document.getElementById("return-message");
  const returnReaderNo = document.getElementById("return-reader-no");
  const returnBarcode = document.getElementById("return-barcode");
  const returnLostDamaged = document.getElementById("return-lost-damaged");
  const returnExtraFine = document.getElementById("return-extra-fine");

  const fineForm = document.getElementById("fine-form");
  const fineMessage = document.getElementById("fine-message");
  const fineReaderNo = document.getElementById("fine-reader-no");
  const fineAmount = document.getElementById("fine-amount");
  const fineRemark = document.getElementById("fine-remark");

  // 借阅记录
  const borrowRecordSearchForm = document.getElementById(
    "borrow-record-search-form"
  );
  const borrowRecordMessage = document.getElementById(
    "borrow-record-message"
  );
  const borrowRecordKeyword = document.getElementById(
    "borrow-record-keyword"
  );
  const borrowRecordsTbody = document.getElementById("borrow-records-tbody");

  // 归还记录（未归还）
  const returnRecordSearchForm = document.getElementById(
    "return-record-search-form"
  );
  const returnRecordMessage = document.getElementById(
    "return-record-message"
  );
  const returnRecordKeyword = document.getElementById(
    "return-record-keyword"
  );
  const returnRecordsTbody = document.getElementById("return-records-tbody");

  // 未缴费记录
  const unpaidFineSearchForm = document.getElementById(
    "unpaid-fine-search-form"
  );
  const unpaidFineMessage = document.getElementById("unpaid-fine-message");
  const unpaidFineKeyword = document.getElementById("unpaid-fine-keyword");
  const unpaidFineTbody = document.getElementById("unpaid-fine-tbody");
  
  // 罚款历史记录
  const fineHistorySearchForm = document.getElementById(
    "fine-history-search-form"
  );
  const fineHistoryMessage = document.getElementById(
    "fine-history-message"
  );
  const fineHistoryKeyword = document.getElementById(
    "fine-history-keyword"
  );
  const fineHistoryTbody = document.getElementById("fine-history-tbody");

  function showMessage(el, text, isError) {
    el.textContent = text || "";
    el.classList.remove("error", "success");
    if (!text) return;
    el.classList.add(isError ? "error" : "success");
  }

  // 全局浮动提示
  function showToast(text, isError) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = text;
    toast.classList.remove("error");
    if (isError) toast.classList.add("error");
    toast.classList.add("show");
    setTimeout(function () {
      toast.classList.remove("show");
    }, 2500);
  }

  function switchToApp(user) {
    authView.style.display = "none";
    appView.style.display = "flex";
    userNameEl.textContent = user.username || "管理员";
    userRoleEl.textContent = user.role || "ADMIN";
    localStorage.setItem("libsql-user", JSON.stringify(user));
    loadDashboard();
    loadAllListsForFirstTime();
  }

  function switchToLogin() {
    authView.style.display = "flex";
    appView.style.display = "none";
    localStorage.removeItem("libsql-user");
    loginForm.reset();
    showMessage(loginMessage, "", false);
  }

  // 尝试自动登录（本地存储用户信息）
  (function initAuth() {
    const cached = localStorage.getItem("libsql-user");
    if (cached) {
      try {
        const user = JSON.parse(cached);
        switchToApp(user);
      } catch (e) {
        console.warn("Invalid cached user", e);
      }
    }
  })();

  // 顶部时钟
  (function initClock() {
    const clock = document.getElementById("header-clock");
    if (!clock) return;
    function tick() {
      const now = new Date();
      const s =
        now.getFullYear() +
        "-" +
        String(now.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(now.getDate()).padStart(2, "0") +
        " " +
        String(now.getHours()).padStart(2, "0") +
        ":" +
        String(now.getMinutes()).padStart(2, "0");
      clock.textContent = "当前时间：" + s;
    }
    tick();
    setInterval(tick, 60000);
  })();

  // 登录提交
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value;
      showMessage(loginMessage, "正在登录...", false);
      Api.login(username, password)
        .then(function (user) {
          showMessage(loginMessage, "登录成功", false);
          showToast("登录成功，欢迎 " + (user.username || ""), false);
          switchToApp(user);
        })
        .catch(function (err) {
          showMessage(loginMessage, err.message || "登录失败", true);
          showToast(err.message || "登录失败", true);
        });
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      switchToLogin();
    });
  }

  // 侧边导航切换
  navItems.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const viewId = btn.dataset.view;
      navItems.forEach(function (b) {
        b.classList.toggle("active", b === btn);
      });
      views.forEach(function (v) {
        const isActive = v.id === viewId;
        v.style.display = isActive ? "block" : "none";
        v.classList.toggle("active-view", isActive);
        // 根据切换的视图加载相应的默认数据
        if (isActive) {
          if (viewId === "borrow-view") {
            loadRecentBorrowRecords();
          } else if (viewId === "return-view") {
            loadUnreturnedRecords();
          } else if (viewId === "fines-view") {
            loadUnpaidFines();
            loadRecentFinePayments();
          }
        }
      });
    });
  });

  // 仪表盘统计
  function loadDashboard() {
    Promise.all([
      Api.getReaders(),
      Api.getBooks(),
      Api.getBookCopies(),
      Api.getDashboardStats()
    ])
      .then(function (results) {
        const readers = results[0] || [];
        const books = results[1] || [];
        const copies = results[2] || [];
        const stats = results[3] || {};
        
        const borrowedCount = copies.filter(function (c) {
          return c.status === "BORROWED";
        }).length;
        
        statReaders.textContent = readers.length;
        statBooks.textContent = books.reduce(function (sum, b) {
          return sum + (b.totalCopy || 0);
        }, 0);
        statBorrowed.textContent = borrowedCount;
        
        // 显示新的统计数据
        statUnpaidCount.textContent = stats.unpaidCount || 0;
        statUnpaidTotal.textContent = stats.unpaidTotal != null 
          ? stats.unpaidTotal.toFixed(2) + " 元" 
          : "0.00 元";
        statOverdue.textContent = stats.overdueCount || 0;
      })
      .catch(function (err) {
        console.error("loadDashboard error", err);
        statReaders.textContent = "-";
        statBooks.textContent = "-";
        statBorrowed.textContent = "-";
        statUnpaidCount.textContent = "-";
        statUnpaidTotal.textContent = "-";
        statOverdue.textContent = "-";
      });
  }

  // 首次加载各模块数据
  function loadAllListsForFirstTime() {
    loadReaders();
    loadReaderTypes();
    loadPublishers();
    loadAuthors();
    loadBooks();
    loadBookCopies();
    loadUnreturnedRecords();
    loadRecentBorrowRecords();
    loadUnpaidFines();
    loadRecentFinePayments();
  }

  // 读者列表
  function loadReaders() {
    Api.getReaders()
      .then(function (readers) {
        readersTbody.innerHTML = "";
        if (readers.length === 0) {
          const tr = document.createElement("tr");
          tr.innerHTML =
            '<td colspan="7" style="text-align: center; padding: 24px; color: #6c857b; font-size: 15px;">暂无读者数据，点击上方"新增读者"按钮添加</td>';
          readersTbody.appendChild(tr);
          return;
        }
        readers.forEach(function (r) {
          const tr = document.createElement("tr");
          tr.dataset.id = r.id;
          tr.innerHTML =
            "<td>" +
            (r.id || "") +
            "</td>" +
            "<td>" +
            (r.readerNo || "") +
            "</td>" +
            "<td>" +
            (r.name || "") +
            "</td>" +
            "<td>" +
            (r.readerType?.name || "") +
            "</td>" +
            "<td>" +
            (r.borrowedCount || 0) +
            "</td>" +
            "<td>" +
            (r.totalFine != null ? r.totalFine.toFixed(2) : "0.00") +
            "</td>" +
            "<td>" +
            '<button class="btn btn-ghost btn-sm" data-action="edit" data-id="' +
            r.id +
            '">编辑</button>' +
            '<button class="btn btn-ghost btn-sm" data-action="delete" data-id="' +
            r.id +
            '">删除</button>' +
            "</td>";
          readersTbody.appendChild(tr);

          const detailTr = document.createElement("tr");
          detailTr.className = "row-detail";
          detailTr.style.display = "none";
          detailTr.innerHTML = '<td colspan="7" class="row-detail-cell"></td>';
          readersTbody.appendChild(detailTr);
        });
      })
      .catch(function (err) {
        console.error("loadReaders error", err);
      });
  }

  // 读者类别列表 + 下拉
  function loadReaderTypes() {
    Api.getReaderTypes()
      .then(function (types) {
        // 下拉
        if (readerTypeSelect) {
          readerTypeSelect.innerHTML = "";
          types.forEach(function (t) {
            const opt = document.createElement("option");
            opt.value = t.id;
            opt.textContent =
              t.name +
              "（最多 " +
              t.maxBorrowCount +
              " 本，" +
              t.maxBorrowDays +
              " 天）";
            readerTypeSelect.appendChild(opt);
          });
        }
        // 列表
        if (readerTypesTbody) {
          readerTypesTbody.innerHTML = "";
          if (types.length === 0) {
            const tr = document.createElement("tr");
            tr.innerHTML =
              '<td colspan="6" style="text-align: center; padding: 24px; color: #6c857b; font-size: 15px;">暂无读者类别数据，请先添加读者类别</td>';
            readerTypesTbody.appendChild(tr);
          } else {
            types.forEach(function (t) {
              const tr = document.createElement("tr");
              tr.dataset.id = t.id;
              tr.innerHTML =
                "<td>" +
                (t.id || "") +
                "</td>" +
                "<td>" +
                (t.name || "") +
                "</td>" +
                "<td>" +
                (t.maxBorrowCount || 0) +
                "</td>" +
                "<td>" +
                (t.maxBorrowDays || 0) +
                "</td>" +
                "<td>" +
                (t.fineRatePerDay || 0) +
                "</td>" +
                "<td>" +
                '<button class="btn btn-ghost btn-sm" data-action="edit" data-id="' +
                t.id +
                '">编辑</button>' +
                '<button class="btn btn-ghost btn-sm" data-action="delete" data-id="' +
                t.id +
                '">删除</button>' +
                "</td>";
              readerTypesTbody.appendChild(tr);
            });
          }
        }
      })
      .catch(function (err) {
        console.error("loadReaderTypes error", err);
      });
  }

  function loadPublishers() {
    Api.getPublishers()
      .then(function (list) {
        publishersTbody.innerHTML = "";
        if (list.length === 0) {
          const tr = document.createElement("tr");
          tr.innerHTML =
            '<td colspan="5" style="text-align: center; padding: 24px; color: #6c857b; font-size: 15px;">暂无出版社数据，点击上方"新增出版社"按钮添加</td>';
          publishersTbody.appendChild(tr);
        } else {
          list.forEach(function (p) {
            const tr = document.createElement("tr");
            tr.dataset.id = p.id;
            tr.innerHTML =
              "<td>" +
              (p.id || "") +
              "</td>" +
              "<td>" +
              (p.name || "") +
              "</td>" +
              "<td>" +
              (p.phone || "") +
              "</td>" +
              "<td>" +
              (p.contact || "") +
              "</td>" +
              "<td>" +
              '<button class="btn btn-ghost btn-sm" data-action="edit" data-id="' +
              p.id +
              '">编辑</button>' +
              '<button class="btn btn-ghost btn-sm" data-action="delete" data-id="' +
              p.id +
              '">删除</button>' +
              "</td>";
            publishersTbody.appendChild(tr);
          });
        }
      })
      .catch(function (err) {
        console.error("loadPublishers error", err);
      });
  }

  function loadAuthors() {
    Api.getAuthors()
      .then(function (list) {
        authorsTbody.innerHTML = "";
        if (list.length === 0) {
          const tr = document.createElement("tr");
            tr.innerHTML =
              '<td colspan="4" style="text-align: center; padding: 24px; color: #6c857b; font-size: 15px;">暂无作者数据，点击上方"新增作者"按钮添加</td>';
          authorsTbody.appendChild(tr);
        } else {
          list.forEach(function (a) {
            const tr = document.createElement("tr");
            tr.dataset.id = a.id;
            tr.innerHTML =
              "<td>" +
              (a.id || "") +
              "</td>" +
              "<td>" +
              (a.name || "") +
              "</td>" +
              "<td>" +
              (a.country || "") +
              "</td>" +
              "<td>" +
              '<button class="btn btn-ghost btn-sm" data-action="edit" data-id="' +
              a.id +
              '">编辑</button>' +
              '<button class="btn btn-ghost btn-sm" data-action="delete" data-id="' +
              a.id +
              '">删除</button>' +
              "</td>";
            authorsTbody.appendChild(tr);
          });
        }
      })
      .catch(function (err) {
        console.error("loadAuthors error", err);
      });
  }

  function loadBooks() {
    Api.getBooks()
      .then(function (list) {
        booksTbody.innerHTML = "";
        if (list.length === 0) {
          const tr = document.createElement("tr");
          tr.innerHTML =
            '<td colspan="6" style="text-align: center; padding: 24px; color: #6c857b; font-size: 15px;">暂无图书数据，点击上方"新增图书"按钮添加</td>';
          booksTbody.appendChild(tr);
        } else {
          list.forEach(function (b) {
            const tr = document.createElement("tr");
            tr.dataset.id = b.id;
            tr.innerHTML =
              "<td>" +
              (b.id || "") +
              "</td>" +
              "<td>" +
              (b.isbn || "") +
              "</td>" +
              "<td>" +
              (b.title || "") +
              "</td>" +
              "<td>" +
              (b.totalCopy || 0) +
              "</td>" +
              "<td>" +
              (b.availableCopy || 0) +
              "</td>" +
              "<td>" +
              '<button class="btn btn-ghost btn-sm" data-action="edit" data-id="' +
              b.id +
              '">编辑</button>' +
              '<button class="btn btn-ghost btn-sm" data-action="delete" data-id="' +
              b.id +
              '">删除</button>' +
              "</td>";
            booksTbody.appendChild(tr);
          });
        }
      })
      .catch(function (err) {
        console.error("loadBooks error", err);
      });
  }

  function loadBookCopies() {
    Api.getBookCopies()
      .then(function (list) {
        bookCopiesTbody.innerHTML = "";
        if (list.length === 0) {
          const tr = document.createElement("tr");
          tr.innerHTML =
            '<td colspan="6" style="text-align: center; padding: 24px; color: #6c857b; font-size: 15px;">暂无馆藏数据，点击上方"新增馆藏"按钮添加</td>';
          bookCopiesTbody.appendChild(tr);
        } else {
          list.forEach(function (c) {
            const tr = document.createElement("tr");
            tr.dataset.id = c.id;
            tr.innerHTML =
              "<td>" +
              (c.id || "") +
              "</td>" +
              "<td>" +
              (c.barcode || "") +
              "</td>" +
              "<td>" +
              (c.book?.title || "") +
              "</td>" +
              "<td>" +
              (c.location || "") +
              "</td>" +
              "<td>" +
              (c.status || "") +
              "</td>" +
              "<td>" +
              '<button class="btn btn-ghost btn-sm" data-action="edit" data-id="' +
              c.id +
              '">编辑</button>' +
              '<button class="btn btn-ghost btn-sm" data-action="delete" data-id="' +
              c.id +
              '">删除</button>' +
              "</td>";
            bookCopiesTbody.appendChild(tr);
          });
        }
      })
      .catch(function (err) {
        console.error("loadBookCopies error", err);
      });
  }

  function renderBorrowRecords(list) {
    if (!borrowRecordsTbody) return;
    borrowRecordsTbody.innerHTML = "";
    if (!list || list.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML =
        '<td colspan="10" style="text-align: center; padding: 24px; color: #6c857b; font-size: 15px;">暂无借阅记录</td>';
      borrowRecordsTbody.appendChild(tr);
      return;
    }
    list.forEach(function (r) {
      const tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" +
        (r.id || "") +
        "</td>" +
        "<td>" +
        (r.readerNo || "") +
        "</td>" +
        "<td>" +
        (r.readerName || "") +
        "</td>" +
        "<td>" +
        (r.barcode || "") +
        "</td>" +
        "<td>" +
        (r.bookIsbn || "") +
        "</td>" +
        "<td>" +
        (r.bookTitle || "") +
        "</td>" +
        "<td>" +
        (r.borrowDate || "") +
        "</td>" +
        "<td>" +
        (r.dueDate || "") +
        "</td>" +
        "<td>" +
        (r.returnDate || "") +
        "</td>" +
        "<td>" +
        (r.status || "") +
        "</td>";
      borrowRecordsTbody.appendChild(tr);
    });
  }

  // 加载未归还记录
  function loadUnreturnedRecords() {
    if (!returnRecordsTbody) return;
    Api.getAllUnreturnedRecords()
      .then(function (list) {
        renderReturnRecords(list || []);
      })
      .catch(function (err) {
        console.error("loadUnreturnedRecords error", err);
        renderReturnRecords([]);
      });
  }

  // 渲染归还记录列表（未归还）
  function renderReturnRecords(list) {
    if (!returnRecordsTbody) return;
    returnRecordsTbody.innerHTML = "";
    if (!list || list.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML =
        '<td colspan="9" style="text-align: center; padding: 24px; color: #6c857b; font-size: 15px;">暂无未归还记录</td>';
      returnRecordsTbody.appendChild(tr);
      return;
    }
    list.forEach(function (r) {
      const tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" +
        (r.id || "") +
        "</td>" +
        "<td>" +
        (r.readerNo || "") +
        "</td>" +
        "<td>" +
        (r.readerName || "") +
        "</td>" +
        "<td>" +
        (r.barcode || "") +
        "</td>" +
        "<td>" +
        (r.bookIsbn || "") +
        "</td>" +
        "<td>" +
        (r.bookTitle || "") +
        "</td>" +
        "<td>" +
        (r.borrowDate || "") +
        "</td>" +
        "<td>" +
        (r.dueDate || "") +
        "</td>" +
        "<td>" +
        '<button class="btn btn-ghost btn-sm" data-action="return" data-reader-no="' +
        (r.readerNo || "") +
        '" data-barcode="' +
        (r.barcode || "") +
        '">归还</button>' +
        "</td>";
      returnRecordsTbody.appendChild(tr);
    });
  }

  // 借阅记录分页状态
  let currentBorrowRecordsPage = 0;
  const borrowRecordsPageSize = 10; // 默认每页10条

  // 加载最近借阅记录（支持分页）
  function loadRecentBorrowRecords(page, size) {
    if (!borrowRecordsTbody) return;
    page = page !== undefined ? page : currentBorrowRecordsPage;
    size = size || borrowRecordsPageSize;
    
    Api.getRecentBorrowRecords(page, size)
      .then(function (response) {
        // 如果返回的是分页对象
        if (response && response.content) {
          renderBorrowRecords(response.content || []);
          renderBorrowRecordsPagination(response);
          currentBorrowRecordsPage = response.currentPage || page;
        } else {
          // 兼容旧格式（直接返回数组）
          renderBorrowRecords(response || []);
        }
      })
      .catch(function (err) {
        console.error("loadRecentBorrowRecords error", err);
        renderBorrowRecords([]);
      });
  }

  // 渲染借阅记录分页控件
  function renderBorrowRecordsPagination(response) {
    const paginationEl = document.getElementById("borrow-records-pagination");
    if (!paginationEl) return;
    
    const totalPages = response.totalPages || 1;
    const currentPage = response.currentPage || 0;
    const totalElements = response.totalElements || 0;
    const pageSize = response.pageSize || borrowRecordsPageSize;
    
    // 如果只有一页或没有数据，不显示分页
    if (totalPages <= 1) {
      paginationEl.innerHTML = '<span style="color: #6c857b;">共 ' + totalElements + ' 条记录</span>';
      return;
    }
    
    let html = '<span style="color: #6c857b; margin-right: 16px;">共 ' + totalElements + ' 条记录，第 ' + (currentPage + 1) + ' / ' + totalPages + ' 页</span>';
    
    // 每页显示条数选择
    html += '<select id="borrow-records-page-size" style="margin-right: 16px; padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px;">';
    html += '<option value="10"' + (pageSize === 10 ? ' selected' : '') + '>每页10条</option>';
    html += '<option value="50"' + (pageSize === 50 ? ' selected' : '') + '>每页50条</option>';
    html += '</select>';
    
    // 上一页按钮
    html += '<button class="btn btn-ghost btn-sm" id="borrow-records-prev" ' + (currentPage === 0 ? 'disabled' : '') + '>上一页</button>';
    
    // 页码按钮（显示当前页前后各2页）
    const startPage = Math.max(0, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);
    
    if (startPage > 0) {
      html += '<button class="btn btn-ghost btn-sm" data-page="0">1</button>';
      if (startPage > 1) {
        html += '<span style="padding: 0 8px;">...</span>';
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      html += '<button class="btn btn-ghost btn-sm' + (i === currentPage ? ' active' : '') + '" data-page="' + i + '">' + (i + 1) + '</button>';
    }
    
    if (endPage < totalPages - 1) {
      if (endPage < totalPages - 2) {
        html += '<span style="padding: 0 8px;">...</span>';
      }
      html += '<button class="btn btn-ghost btn-sm" data-page="' + (totalPages - 1) + '">' + totalPages + '</button>';
    }
    
    // 下一页按钮
    html += '<button class="btn btn-ghost btn-sm" id="borrow-records-next" ' + (currentPage >= totalPages - 1 ? 'disabled' : '') + '>下一页</button>';
    
    paginationEl.innerHTML = html;
    
    // 绑定事件
    const prevBtn = document.getElementById("borrow-records-prev");
    const nextBtn = document.getElementById("borrow-records-next");
    const pageSizeSelect = document.getElementById("borrow-records-page-size");
    
    if (prevBtn) {
      prevBtn.addEventListener("click", function() {
        if (currentPage > 0) {
          loadRecentBorrowRecords(currentPage - 1, pageSize);
        }
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener("click", function() {
        if (currentPage < totalPages - 1) {
          loadRecentBorrowRecords(currentPage + 1, pageSize);
        }
      });
    }
    
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener("change", function() {
        const newSize = Number.parseInt(this.value, 10);
        loadRecentBorrowRecords(0, newSize); // 切换每页条数时回到第一页
      });
    }
    
    // 绑定页码按钮
    paginationEl.querySelectorAll("button[data-page]").forEach(function(btn) {
      btn.addEventListener("click", function() {
        const page = Number.parseInt(this.dataset.page, 10);
        loadRecentBorrowRecords(page, pageSize);
      });
    });
  }

  // 加载未缴费记录
  function loadUnpaidFines() {
    if (!unpaidFineTbody) return;
    Api.getUnpaidFines()
      .then(function (list) {
        renderUnpaidFines(list || []);
      })
      .catch(function (err) {
        console.error("loadUnpaidFines error", err);
        renderUnpaidFines([]);
      });
  }

  // 渲染未缴费记录列表
  function renderUnpaidFines(list) {
    if (!unpaidFineTbody) return;
    unpaidFineTbody.innerHTML = "";
    if (!list || list.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML =
        '<td colspan="6" style="text-align: center; padding: 24px; color: #6c857b; font-size: 15px;">暂无未缴费记录</td>';
      unpaidFineTbody.appendChild(tr);
      return;
    }
    list.forEach(function (item) {
      const tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" +
        (item.readerNo || "") +
        "</td>" +
        "<td>" +
        (item.readerName || "") +
        "</td>" +
        "<td>" +
        (item.readerTypeName || "-") +
        "</td>" +
        "<td>" +
        (item.phone || "-") +
        "</td>" +
        "<td style='color: #d32f2f; font-weight: 600;'>" +
        (item.totalFine ? item.totalFine.toFixed(2) : "0.00") +
        "</td>" +
        '<td><button class="btn btn-primary btn-small" data-action="pay" data-reader-no="' +
        (item.readerNo || "").replaceAll('"', '&quot;') +
        '" data-amount="' +
        (item.totalFine || 0) +
        '">缴费</button></td>';
      unpaidFineTbody.appendChild(tr);
    });
  }

  // 加载最近罚款记录（默认10条）
  function loadRecentFinePayments() {
    if (!fineHistoryTbody) return;
    Api.getRecentFinePayments(10)
      .then(function (list) {
        renderFinePayments(list || []);
      })
      .catch(function (err) {
        console.error("loadRecentFinePayments error", err);
        renderFinePayments([]);
      });
  }

  // 渲染罚款记录列表
  function renderFinePayments(list) {
    if (!fineHistoryTbody) return;
    fineHistoryTbody.innerHTML = "";
    if (!list || list.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML =
        '<td colspan="6" style="text-align: center; padding: 24px; color: #6c857b; font-size: 15px;">暂无罚款记录</td>';
      fineHistoryTbody.appendChild(tr);
      return;
    }
    list.forEach(function (fp) {
      const tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" +
        (fp.id || "") +
        "</td>" +
        "<td>" +
        (fp.readerNo || "") +
        "</td>" +
        "<td>" +
        (fp.readerName || "") +
        "</td>" +
        "<td>" +
        (fp.amount || 0) +
        "</td>" +
        "<td>" +
        (fp.payDate || "") +
        "</td>" +
        "<td>" +
        (fp.remark || "") +
        "</td>";
      fineHistoryTbody.appendChild(tr);
    });
  }

  // 读者表单展示/隐藏
  if (btnAddReader) {
    btnAddReader.addEventListener("click", function () {
      readerFormTitle.textContent = "新增读者";
      readerIdInput.value = "";
      readerForm.reset();
      showMessage(readerFormMsg, "", false);
      readerFormCard.style.display = "block";
    });
  }

  if (cancelReaderEditBtn) {
    cancelReaderEditBtn.addEventListener("click", function () {
      readerFormCard.style.display = "none";
    });
  }

  // 编辑 / 删除 按钮事件委托 + 行内详情
  if (readersTbody) {
    readersTbody.addEventListener("click", function (e) {
      const target = e.target;
      if (target.dataset && target.dataset.action) {
        const id = target.dataset.id;
        if (target.dataset.action === "edit") {
          onEditReader(id);
        } else if (target.dataset.action === "delete") {
          onDeleteReader(id);
        }
        return;
      }

      // 点击非操作按钮时展开/收起详情
      const tr = target.closest("tr");
      if (!tr || !tr.dataset.id) return;
      const next = tr.nextElementSibling;
      if (!next || !next.classList.contains("row-detail")) return;
      const cell = next.querySelector(".row-detail-cell");
      if (next.style.display === "none") {
        const name = tr.children[2] ? tr.children[2].textContent : "";
        const readerNo = tr.children[1] ? tr.children[1].textContent : "";
        cell.textContent =
          "读者：" +
          name +
          "（证号：" +
          readerNo +
          "），可在后续扩展的“借阅记录”弹窗中查看其全部借阅历史。";
        next.style.display = "table-row";
      } else {
        next.style.display = "none";
      }
    });
  }

  function onEditReader(id) {
    // 先隐藏顶部表单
    readerFormCard.style.display = "none";
    
    // 移除已有的编辑表单行
    const existingFormRow = readersTbody.querySelector("tr.edit-form-row");
    if (existingFormRow) {
      existingFormRow.remove();
    }
    
    Promise.all([Api.getReaders(), Api.getReaderTypes()]).then(function (results) {
      const readers = results[0] || [];
      const readerTypes = results[1] || [];
      const r = readers.find(function (x) {
        return String(x.id) === String(id);
      });
      if (!r) return;
      
      // 找到对应的行
      const targetRow = readersTbody.querySelector('tr[data-id="' + id + '"]');
      if (!targetRow) return;
      
      // 构建读者类别下拉选项
      let readerTypeOptions = '<option value="">未选择</option>';
      readerTypes.forEach(function (t) {
        const selected = (r.readerType && r.readerType.id === t.id) ? ' selected' : '';
        readerTypeOptions += '<option value="' + t.id + '"' + selected + '>' + (t.name || "") + '（最多 ' + (t.maxBorrowCount || 0) + ' 本，' + (t.maxBorrowDays || 0) + ' 天）</option>';
      });
      
      // 创建表单行
      const formRow = document.createElement("tr");
      formRow.className = "edit-form-row";
      formRow.innerHTML = '<td colspan="7" style="padding: 0;"><div class="card form-card" style="margin: 16px; border: none;"><h3>编辑读者</h3><form class="inline-edit-form"><input type="hidden" class="edit-id" value="' + (r.id || "") + '"><div class="grid grid-2"><div class="form-group"><label>证号</label><input class="edit-reader-no" value="' + (r.readerNo || "").replaceAll('"', '&quot;') + '" required></div><div class="form-group"><label>姓名</label><input class="edit-name" value="' + (r.name || "").replaceAll('"', '&quot;') + '" required></div><div class="form-group"><label>性别</label><select class="edit-gender"><option value="">未设置</option><option value="男"' + (r.gender === "男" ? ' selected' : '') + '>男</option><option value="女"' + (r.gender === "女" ? ' selected' : '') + '>女</option></select></div><div class="form-group"><label>读者类别</label><select class="edit-reader-type">' + readerTypeOptions + '</select></div><div class="form-group"><label>电话</label><input class="edit-phone" value="' + (r.phone || "").replaceAll('"', '&quot;') + '"></div><div class="form-group"><label>邮箱</label><input class="edit-email" value="' + (r.email || "").replaceAll('"', '&quot;') + '"></div></div><div class="form-actions"><button type="submit" class="btn btn-primary">保存</button><button type="button" class="btn btn-ghost cancel-inline-edit">取消</button></div><p class="form-message inline-edit-message"></p></form></div></td>';
      
      // 插入到目标行下方（跳过详情行）
      const nextSibling = targetRow.nextElementSibling;
      if (nextSibling && nextSibling.classList.contains("row-detail")) {
        targetRow.parentNode.insertBefore(formRow, nextSibling.nextSibling);
      } else {
        targetRow.parentNode.insertBefore(formRow, targetRow.nextSibling);
      }
      
      // 滚动到表单位置
      formRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
      // 绑定表单提交事件
      const form = formRow.querySelector("form");
      form.addEventListener("submit", function(e) {
        e.preventDefault();
        const editId = formRow.querySelector(".edit-id").value;
        const payload = {
          readerNo: formRow.querySelector(".edit-reader-no").value.trim(),
          name: formRow.querySelector(".edit-name").value.trim(),
          gender: formRow.querySelector(".edit-gender").value,
          phone: formRow.querySelector(".edit-phone").value.trim(),
          email: formRow.querySelector(".edit-email").value.trim(),
          readerType: formRow.querySelector(".edit-reader-type").value
            ? { id: Number(formRow.querySelector(".edit-reader-type").value) }
            : null,
          status: 1,
        };
        const msgEl = formRow.querySelector(".inline-edit-message");
        msgEl.textContent = "正在保存...";
        msgEl.classList.remove("error", "success");
        Api.updateReader(editId, payload)
          .then(function() {
            formRow.remove();
            loadReaders();
            loadDashboard();
            showToast("保存成功", false);
          })
          .catch(function(err) {
            msgEl.textContent = err.message || "保存失败";
            msgEl.classList.add("error");
          });
      });
      
      // 绑定取消事件
      formRow.querySelector(".cancel-inline-edit").addEventListener("click", function() {
        formRow.remove();
      });
    });
  }

  function onDeleteReader(id) {
    if (!confirm("确定要删除该读者吗？")) {
      return;
    }
    Api.deleteReader(id)
      .then(function () {
        loadReaders();
        loadDashboard();
      })
      .catch(function (err) {
        alert(err.message || "删除失败");
      });
  }

  if (readerForm) {
    readerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const payload = {
        readerNo: readerNoInput.value.trim(),
        name: readerNameInput.value.trim(),
        gender: readerGenderInput.value,
        phone: readerPhoneInput.value.trim(),
        email: readerEmailInput.value.trim(),
        readerType: readerTypeSelect.value
          ? { id: Number(readerTypeSelect.value) }
          : null,
        status: 1,
      };
      // 只用于新增
      showMessage(readerFormMsg, "正在保存...", false);
      Api.createReader(payload)
        .then(function () {
          showMessage(readerFormMsg, "保存成功", false);
          readerFormCard.style.display = "none";
          loadReaders();
          loadDashboard();
          showToast("保存成功", false);
        })
        .catch(function (err) {
          showMessage(readerFormMsg, err.message || "保存失败", true);
          showToast(err.message || "保存失败", true);
        });
    });
  }

  // 借阅
  if (borrowForm) {
    borrowForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const readerNo = borrowReaderNo.value.trim();
      const barcode = borrowBarcode.value.trim();
      if (!readerNo || !barcode) {
        showMessage(borrowMessage, "请输入完整信息", true);
        return;
      }
      showMessage(borrowMessage, "正在办理借阅...", false);
      Api.borrow({ readerNo: readerNo, barcode: barcode })
        .then(function (msg) {
          showMessage(
            borrowMessage,
            typeof msg === "string" ? msg : "借阅成功",
            false
          );
          showToast("借阅成功", false);
          borrowForm.reset();
          loadDashboard();
          loadBookCopies();
          loadReaders();
        })
        .catch(function (err) {
          showMessage(borrowMessage, err.message || "借阅失败", true);
          showToast(err.message || "借阅失败", true);
        });
    });
  }

  // 归还
  if (returnForm) {
    returnForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const readerNo = returnReaderNo.value.trim();
      const barcode = returnBarcode.value.trim();
      const lostOrDamaged = !!returnLostDamaged.checked;
      const extraFine = Number.parseFloat(returnExtraFine.value || "0");
      if (!readerNo || !barcode) {
        showMessage(returnMessage, "请输入完整信息", true);
        return;
      }
      showMessage(returnMessage, "正在办理归还...", false);
      Api.returnBook({
        readerNo: readerNo,
        barcode: barcode,
        lostOrDamaged: lostOrDamaged,
        extraFine: Number.isNaN(extraFine) ? 0 : extraFine,
      })
        .then(function (msg) {
          showMessage(
            returnMessage,
            typeof msg === "string" ? msg : "归还成功",
            false
          );
          showToast("归还成功", false);
          returnForm.reset();
          loadDashboard();
          loadBookCopies();
          loadReaders(); // 刷新读者列表，显示更新后的总罚款
          loadUnpaidFines(); // 刷新未缴费记录
          loadUnreturnedRecords(); // 刷新未归还记录列表
        })
        .catch(function (err) {
          showMessage(returnMessage, err.message || "归还失败", true);
          showToast(err.message || "归还失败", true);
        });
    });
  }

  // 归还记录搜索
  if (returnRecordSearchForm) {
    returnRecordSearchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const keyword = returnRecordKeyword.value.trim();
      if (!keyword) {
        showMessage(returnRecordMessage, "请输入搜索关键字", true);
        return;
      }
      showMessage(returnRecordMessage, "正在搜索...", false);
      // 同时按读者和图书搜索未归还记录，合并结果
      Promise.all([
        Api.searchUnreturnedRecordsByReader(keyword),
        Api.searchUnreturnedRecordsByBook(keyword),
      ])
        .then(function (results) {
          const readerList = results[0] || [];
          const bookList = results[1] || [];
          // 合并并去重（根据ID）
          const map = new Map();
          readerList.forEach(function (r) {
            map.set(r.id, r);
          });
          bookList.forEach(function (r) {
            map.set(r.id, r);
          });
          const mergedList = Array.from(map.values());
          showMessage(
            returnRecordMessage,
            "共找到 " + mergedList.length + " 条未归还记录",
            false
          );
          renderReturnRecords(mergedList);
        })
        .catch(function (err) {
          showMessage(
            returnRecordMessage,
            err.message || "搜索失败",
            true
          );
        });
    });
  }

  // 点击归还按钮，自动填充表单
  if (returnRecordsTbody) {
    returnRecordsTbody.addEventListener("click", function (e) {
      const target = e.target;
      if (target.dataset && target.dataset.action === "return") {
        const readerNo = target.dataset.readerNo;
        const barcode = target.dataset.barcode;
        if (readerNo && barcode) {
          returnReaderNo.value = readerNo;
          returnBarcode.value = barcode;
          // 滚动到归还表单
          const returnFormCard = document.querySelector("#return-view .card.form-card");
          if (returnFormCard) {
            returnFormCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      }
    });
  }

  // 罚款
  if (fineForm) {
    fineForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const readerNo = fineReaderNo.value.trim();
      const amount = Number.parseFloat(fineAmount.value || "0");
      const remark = fineRemark.value.trim();
      if (!readerNo || Number.isNaN(amount) || amount <= 0) {
        showMessage(fineMessage, "请输入正确的读者证号和金额", true);
        return;
      }
      showMessage(fineMessage, "正在缴费...", false);
      Api.payFine({
        readerNo: readerNo,
        amount: amount,
        remark: remark,
      })
        .then(function (msg) {
          showMessage(
            fineMessage,
            typeof msg === "string" ? msg : "缴费成功",
            false
          );
          showToast("缴费成功", false);
          fineForm.reset();
          loadReaders();
          loadDashboard();
          loadUnpaidFines(); // 刷新未缴费记录
          loadRecentFinePayments(); // 刷新罚款历史记录
        })
        .catch(function (err) {
          showMessage(fineMessage, err.message || "缴费失败", true);
          showToast(err.message || "缴费失败", true);
        });
    });
  }

  // 未缴费记录搜索
  if (unpaidFineSearchForm) {
    unpaidFineSearchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const keyword = unpaidFineKeyword.value.trim();
      if (!keyword) {
        // 如果没有关键字，加载所有未缴费记录
        loadUnpaidFines();
        return;
      }
      showMessage(unpaidFineMessage, "正在搜索...", false);
      Api.searchUnpaidFines(keyword)
        .then(function (list) {
          showMessage(
            unpaidFineMessage,
            "共找到 " + (list ? list.length : 0) + " 条记录",
            false
          );
          renderUnpaidFines(list || []);
        })
        .catch(function (err) {
          showMessage(
            unpaidFineMessage,
            err.message || "搜索失败",
            true
          );
        });
    });
  }

  // 未缴费记录表格点击事件（快速缴费）
  if (unpaidFineTbody) {
    unpaidFineTbody.addEventListener("click", function (e) {
      const target = e.target;
      if (target.dataset && target.dataset.action === "pay") {
        const readerNo = target.dataset.readerNo;
        const amount = Number.parseFloat(target.dataset.amount) || 0;
        if (readerNo) {
          // 自动填充缴费表单
          const fineReaderNoInput = document.getElementById("fine-reader-no");
          const fineAmountInput = document.getElementById("fine-amount");
          if (fineReaderNoInput) fineReaderNoInput.value = readerNo;
          if (fineAmountInput) fineAmountInput.value = amount.toFixed(2);
          // 滚动到缴费表单
          const fineFormCard = document.querySelector("#fines-view .form-card");
          if (fineFormCard) {
            fineFormCard.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      }
    });
  }

  // 罚款历史记录搜索
  if (fineHistorySearchForm) {
    fineHistorySearchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const keyword = fineHistoryKeyword.value.trim();
      if (!keyword) {
        // 如果没有关键字，加载最近10条
        loadRecentFinePayments();
        return;
      }
      showMessage(fineHistoryMessage, "正在搜索...", false);
      Api.searchFinePayments(keyword)
        .then(function (list) {
          showMessage(
            fineHistoryMessage,
            "共找到 " + (list ? list.length : 0) + " 条记录",
            false
          );
          renderFinePayments(list || []);
        })
        .catch(function (err) {
          showMessage(
            fineHistoryMessage,
            err.message || "搜索失败",
            true
          );
        });
    });
  }

  // 借阅记录搜索
  if (borrowRecordSearchForm) {
    borrowRecordSearchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const keyword = borrowRecordKeyword.value.trim();
      if (!keyword) {
        showMessage(borrowRecordMessage, "请输入搜索关键字", true);
        return;
      }
      showMessage(borrowRecordMessage, "正在搜索...", false);
      // 同时按读者和图书搜索，合并结果
      Promise.all([
        Api.searchBorrowRecordsByReader(keyword),
        Api.searchBorrowRecordsByBook(keyword),
      ])
        .then(function (results) {
          const list1 = results[0] || [];
          const list2 = results[1] || [];
          const map = {};
          list1.concat(list2).forEach(function (r) {
            if (!r || r.id == null) return;
            map[r.id] = r;
          });
          const merged = Object.keys(map)
            .sort(function (a, b) {
              return Number(b) - Number(a);
            })
            .map(function (id) {
              return map[id];
            });
          showMessage(
            borrowRecordMessage,
            "共找到 " + merged.length + " 条记录",
            false
          );
          renderBorrowRecords(merged);
        })
        .catch(function (err) {
          showMessage(
            borrowRecordMessage,
            err.message || "搜索失败",
            true
          );
        });
    });
  }

  // 出版社管理相关元素和事件
  const btnAddPublisher = document.getElementById("btn-add-publisher");
  const publisherFormCard = document.getElementById("publisher-form-card");
  const publisherFormTitle = document.getElementById("publisher-form-title");
  const publisherForm = document.getElementById("publisher-form");
  const publisherFormMsg = document.getElementById("publisher-form-message");
  const cancelPublisherEditBtn = document.getElementById("cancel-publisher-edit");
  const publisherIdInput = document.getElementById("publisher-id");
  const publisherNameInput = document.getElementById("publisher-name");
  const publisherPhoneInput = document.getElementById("publisher-phone");
  const publisherAddressInput = document.getElementById("publisher-address");
  const publisherContactInput = document.getElementById("publisher-contact");
  const publisherRemarkInput = document.getElementById("publisher-remark");

  if (btnAddPublisher) {
    btnAddPublisher.addEventListener("click", function () {
      publisherFormTitle.textContent = "新增出版社";
      publisherIdInput.value = "";
      publisherForm.reset();
      showMessage(publisherFormMsg, "", false);
      publisherFormCard.style.display = "block";
    });
  }

  if (cancelPublisherEditBtn) {
    cancelPublisherEditBtn.addEventListener("click", function () {
      publisherFormCard.style.display = "none";
    });
  }

  if (publishersTbody) {
    publishersTbody.addEventListener("click", function (e) {
      const target = e.target;
      if (target.dataset && target.dataset.action) {
        const id = target.dataset.id;
        if (target.dataset.action === "edit") {
          onEditPublisher(id);
        } else if (target.dataset.action === "delete") {
          onDeletePublisher(id);
        }
      }
    });
  }

  function onEditPublisher(id) {
    // 先隐藏顶部表单
    publisherFormCard.style.display = "none";
    
    // 移除已有的编辑表单行
    const existingFormRow = publishersTbody.querySelector("tr.edit-form-row");
    if (existingFormRow) {
      existingFormRow.remove();
    }
    
    Api.getPublishers().then(function (list) {
      const p = list.find(function (x) {
        return String(x.id) === String(id);
      });
      if (!p) return;
      
        // 找到对应的行
        const targetRow = publishersTbody.querySelector('tr[data-id="' + id + '"]');
        if (!targetRow) return;
      
      // 创建表单行
      const formRow = document.createElement("tr");
      formRow.className = "edit-form-row";
      formRow.innerHTML = '<td colspan="5" style="padding: 0;"><div class="card form-card" style="margin: 16px; border: none;"><h3>编辑出版社</h3><form class="inline-edit-form"><input type="hidden" class="edit-id" value="' + (p.id || "") + '"><div class="grid grid-2"><div class="form-group"><label>名称</label><input class="edit-name" value="' + (p.name || "").replaceAll('"', '&quot;') + '" required></div><div class="form-group"><label>电话</label><input class="edit-phone" value="' + (p.phone || "").replaceAll('"', '&quot;') + '"></div><div class="form-group"><label>地址</label><input class="edit-address" value="' + (p.address || "").replaceAll('"', '&quot;') + '"></div><div class="form-group"><label>联系人</label><input class="edit-contact" value="' + (p.contact || "").replaceAll('"', '&quot;') + '"></div><div class="form-group" style="grid-column: 1 / -1"><label>备注</label><input class="edit-remark" value="' + (p.remark || "").replaceAll('"', '&quot;') + '"></div></div><div class="form-actions"><button type="submit" class="btn btn-primary">保存</button><button type="button" class="btn btn-ghost cancel-inline-edit">取消</button></div><p class="form-message inline-edit-message"></p></form></div></td>';
      
      // 插入到目标行下方
      targetRow.parentNode.insertBefore(formRow, targetRow.nextSibling);
      
      // 滚动到表单位置
      formRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
      // 绑定表单提交事件
      const form = formRow.querySelector("form");
      form.addEventListener("submit", function(e) {
        e.preventDefault();
        const editId = formRow.querySelector(".edit-id").value;
        const payload = {
          name: formRow.querySelector(".edit-name").value.trim(),
          phone: formRow.querySelector(".edit-phone").value.trim(),
          address: formRow.querySelector(".edit-address").value.trim(),
          contact: formRow.querySelector(".edit-contact").value.trim(),
          remark: formRow.querySelector(".edit-remark").value.trim(),
        };
        const msgEl = formRow.querySelector(".inline-edit-message");
        msgEl.textContent = "正在保存...";
        msgEl.classList.remove("error", "success");
        Api.updatePublisher(editId, payload)
          .then(function() {
            formRow.remove();
            loadPublishers();
            showToast("保存成功", false);
          })
          .catch(function(err) {
            msgEl.textContent = err.message || "保存失败";
            msgEl.classList.add("error");
          });
      });
      
      // 绑定取消事件
      formRow.querySelector(".cancel-inline-edit").addEventListener("click", function() {
        formRow.remove();
      });
    });
  }

  function onDeletePublisher(id) {
    if (!confirm("确定要删除该出版社吗？")) {
      return;
    }
    Api.deletePublisher(id)
      .then(function () {
        loadPublishers();
        showToast("删除成功", false);
      })
      .catch(function (err) {
        alert(err.message || "删除失败");
        showToast(err.message || "删除失败", true);
      });
  }

  if (publisherForm) {
    publisherForm.addEventListener("submit", function (e) {
      e.preventDefault();
      // const id = publisherIdInput.value; // 未使用的变量已移除
      const payload = {
        name: publisherNameInput.value.trim(),
        phone: publisherPhoneInput.value.trim(),
        address: publisherAddressInput.value.trim(),
        contact: publisherContactInput.value.trim(),
        remark: publisherRemarkInput.value.trim(),
      };
      // 只用于新增
      showMessage(publisherFormMsg, "正在保存...", false);
      Api.createPublisher(payload)
        .then(function () {
          showMessage(publisherFormMsg, "保存成功", false);
          publisherFormCard.style.display = "none";
          loadPublishers();
          showToast("保存成功", false);
        })
        .catch(function (err) {
          showMessage(publisherFormMsg, err.message || "保存失败", true);
          showToast(err.message || "保存失败", true);
        });
    });
  }

  // 图书管理相关元素和事件
  const btnAddBook = document.getElementById("btn-add-book");
  const bookFormCard = document.getElementById("book-form-card");
  const bookFormTitle = document.getElementById("book-form-title");
  const bookForm = document.getElementById("book-form");
  const bookFormMsg = document.getElementById("book-form-message");
  const cancelBookEditBtn = document.getElementById("cancel-book-edit");
  const bookIdInput = document.getElementById("book-id");
  const bookIsbnInput = document.getElementById("book-isbn");
  const bookTitleInput = document.getElementById("book-title");
  const bookPublisherSelect = document.getElementById("book-publisher");
  const bookAuthorSelect = document.getElementById("book-author");
  const bookPublishYearInput = document.getElementById("book-publish-year");
  const bookCategoryInput = document.getElementById("book-category");
  const bookTotalCopyInput = document.getElementById("book-total-copy");
  const bookAvailableCopyInput = document.getElementById("book-available-copy");

  function loadPublishersForBookSelect() {
    Api.getPublishers().then(function (list) {
      bookPublisherSelect.innerHTML = '<option value="">未选择</option>';
      list.forEach(function (p) {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = p.name || "";
        bookPublisherSelect.appendChild(opt);
      });
    });
  }

  function loadAuthorsForBookSelect() {
    Api.getAuthors().then(function (list) {
      bookAuthorSelect.innerHTML = '<option value="">未选择</option>';
      list.forEach(function (a) {
        const opt = document.createElement("option");
        opt.value = a.id;
        opt.textContent = a.name || "";
        bookAuthorSelect.appendChild(opt);
      });
    });
  }

  if (btnAddBook) {
    btnAddBook.addEventListener("click", function () {
      bookFormTitle.textContent = "新增图书";
      bookIdInput.value = "";
      bookForm.reset();
      loadPublishersForBookSelect();
      loadAuthorsForBookSelect();
      showMessage(bookFormMsg, "", false);
      bookFormCard.style.display = "block";
    });
  }

  if (cancelBookEditBtn) {
    cancelBookEditBtn.addEventListener("click", function () {
      bookFormCard.style.display = "none";
    });
  }

  if (booksTbody) {
    booksTbody.addEventListener("click", function (e) {
      const target = e.target;
      if (target.dataset && target.dataset.action) {
        const id = target.dataset.id;
        if (target.dataset.action === "edit") {
          onEditBook(id);
        } else if (target.dataset.action === "delete") {
          onDeleteBook(id);
        }
      }
    });
  }

  function onEditBook(id) {
    // 先隐藏顶部表单
    bookFormCard.style.display = "none";
    
    // 移除已有的编辑表单行
    const existingFormRow = booksTbody.querySelector("tr.edit-form-row");
    if (existingFormRow) {
      existingFormRow.remove();
    }
    
    Promise.all([Api.getBooks(), Api.getPublishers(), Api.getAuthors()]).then(
      function (results) {
        const books = results[0] || [];
        const publishers = results[1] || [];
        const authors = results[2] || [];
        const b = books.find(function (x) {
          return String(x.id) === String(id);
        });
        if (!b) return;
        
        // 找到对应的行
        const targetRow = booksTbody.querySelector('tr[data-id="' + id + '"]');
        if (!targetRow) return;
        
        // 构建出版社下拉选项
        let publisherOptions = '<option value="">未选择</option>';
        publishers.forEach(function (p) {
          const selected = (b.publisher && b.publisher.id === p.id) ? ' selected' : '';
          publisherOptions += '<option value="' + p.id + '"' + selected + '>' + (p.name || "") + '</option>';
        });
        
        // 构建作者下拉选项
        let authorOptions = '<option value="">未选择</option>';
        authors.forEach(function (a) {
          const selected = (b.author && b.author.id === a.id) ? ' selected' : '';
          authorOptions += '<option value="' + a.id + '"' + selected + '>' + (a.name || "") + '</option>';
        });
        
        // 创建表单行
        const formRow = document.createElement("tr");
        formRow.className = "edit-form-row";
        formRow.innerHTML = '<td colspan="6" style="padding: 0;"><div class="card form-card" style="margin: 16px; border: none;"><h3>编辑图书</h3><form class="inline-edit-form"><input type="hidden" class="edit-id" value="' + (b.id || "") + '"><div class="grid grid-2"><div class="form-group"><label>ISBN</label><input class="edit-isbn" value="' + (b.isbn || "").replaceAll('"', '&quot;') + '" required></div><div class="form-group"><label>书名</label><input class="edit-title" value="' + (b.title || "").replaceAll('"', '&quot;') + '" required></div><div class="form-group"><label>出版社</label><select class="edit-publisher">' + publisherOptions + '</select></div><div class="form-group"><label>作者</label><select class="edit-author">' + authorOptions + '</select></div><div class="form-group"><label>出版年份</label><input type="number" class="edit-publish-year" value="' + (b.publishYear || "") + '"></div><div class="form-group"><label>分类</label><input class="edit-category" value="' + (b.category || "").replaceAll('"', '&quot;') + '"></div><div class="form-group"><label>总册数</label><input type="number" min="0" class="edit-total-copy" value="' + (b.totalCopy || 0) + '"></div><div class="form-group"><label>可借册数</label><input type="number" min="0" class="edit-available-copy" value="' + (b.availableCopy || 0) + '"></div></div><div class="form-actions"><button type="submit" class="btn btn-primary">保存</button><button type="button" class="btn btn-ghost cancel-inline-edit">取消</button></div><p class="form-message inline-edit-message"></p></form></div></td>';
        
        // 插入到目标行下方
        targetRow.parentNode.insertBefore(formRow, targetRow.nextSibling);
        
        // 滚动到表单位置
        formRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // 绑定表单提交事件
        const form = formRow.querySelector("form");
        form.addEventListener("submit", function(e) {
          e.preventDefault();
          const editId = formRow.querySelector(".edit-id").value;
          const payload = {
            isbn: formRow.querySelector(".edit-isbn").value.trim(),
            title: formRow.querySelector(".edit-title").value.trim(),
            publisher: formRow.querySelector(".edit-publisher").value
              ? { id: Number(formRow.querySelector(".edit-publisher").value) }
              : null,
            author: formRow.querySelector(".edit-author").value
              ? { id: Number(formRow.querySelector(".edit-author").value) }
              : null,
            publishYear: formRow.querySelector(".edit-publish-year").value
              ? Number(formRow.querySelector(".edit-publish-year").value)
              : null,
            category: formRow.querySelector(".edit-category").value.trim(),
            totalCopy: formRow.querySelector(".edit-total-copy").value
              ? Number(formRow.querySelector(".edit-total-copy").value)
              : 0,
            availableCopy: formRow.querySelector(".edit-available-copy").value
              ? Number(formRow.querySelector(".edit-available-copy").value)
              : 0,
            status: 1,
          };
          const msgEl = formRow.querySelector(".inline-edit-message");
          msgEl.textContent = "正在保存...";
          msgEl.classList.remove("error", "success");
          Api.updateBook(editId, payload)
            .then(function() {
              formRow.remove();
              loadBooks();
              loadDashboard();
              showToast("保存成功", false);
            })
            .catch(function(err) {
              msgEl.textContent = err.message || "保存失败";
              msgEl.classList.add("error");
            });
        });
        
        // 绑定取消事件
        formRow.querySelector(".cancel-inline-edit").addEventListener("click", function() {
          formRow.remove();
        });
      }
    );
  }

  function onDeleteBook(id) {
    if (!confirm("确定要删除该图书吗？")) {
      return;
    }
    Api.deleteBook(id)
      .then(function () {
        loadBooks();
        loadDashboard();
        showToast("删除成功", false);
      })
      .catch(function (err) {
        alert(err.message || "删除失败");
        showToast(err.message || "删除失败", true);
      });
  }

  if (bookForm) {
    bookForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const payload = {
        isbn: bookIsbnInput.value.trim(),
        title: bookTitleInput.value.trim(),
        publisher: bookPublisherSelect.value
          ? { id: Number(bookPublisherSelect.value) }
          : null,
        author: bookAuthorSelect.value
          ? { id: Number(bookAuthorSelect.value) }
          : null,
        publishYear: bookPublishYearInput.value
          ? Number(bookPublishYearInput.value)
          : null,
        category: bookCategoryInput.value.trim(),
        totalCopy: bookTotalCopyInput.value
          ? Number(bookTotalCopyInput.value)
          : 0,
        availableCopy: bookAvailableCopyInput.value
          ? Number(bookAvailableCopyInput.value)
          : 0,
        status: 1,
      };
      // 只用于新增
      showMessage(bookFormMsg, "正在保存...", false);
      Api.createBook(payload)
        .then(function () {
          showMessage(bookFormMsg, "保存成功", false);
          bookFormCard.style.display = "none";
          loadBooks();
          loadDashboard();
          showToast("保存成功", false);
        })
        .catch(function (err) {
          showMessage(bookFormMsg, err.message || "保存失败", true);
          showToast(err.message || "保存失败", true);
        });
    });
  }

  // 馆藏管理相关元素和事件
  const btnAddBookCopy = document.getElementById("btn-add-book-copy");
  const btnBatchAddBookCopy = document.getElementById("btn-batch-add-book-copy");
  const bookCopyFormCard = document.getElementById("book-copy-form-card");
  const bookCopyBatchFormCard = document.getElementById("book-copy-batch-form-card");
  const bookCopyFormTitle = document.getElementById("book-copy-form-title");
  const bookCopyForm = document.getElementById("book-copy-form");
  const bookCopyBatchForm = document.getElementById("book-copy-batch-form");
  const bookCopyFormMsg = document.getElementById("book-copy-form-message");
  const bookCopyBatchFormMsg = document.getElementById("book-copy-batch-form-message");
  const cancelBookCopyEditBtn = document.getElementById(
    "cancel-book-copy-edit"
  );
  const cancelBatchBookCopyBtn = document.getElementById("cancel-batch-book-copy");
  const bookCopyIdInput = document.getElementById("book-copy-id");
  const bookCopyBarcodeInput = document.getElementById("book-copy-barcode");
  const bookCopyBookSelect = document.getElementById("book-copy-book");
  const bookCopyLocationInput = document.getElementById("book-copy-location");
  const bookCopyStatusSelect = document.getElementById("book-copy-status");
  const batchBookCopyBookSelect = document.getElementById("batch-book-copy-book");
  const batchBookCopyCountInput = document.getElementById("batch-book-copy-count");
  const batchBookCopyBarcodePrefixInput = document.getElementById("batch-book-copy-barcode-prefix");
  const batchBookCopyLocationInput = document.getElementById("batch-book-copy-location");
  const batchBookCopyStatusSelect = document.getElementById("batch-book-copy-status");

  function loadBooksForCopySelect() {
    Api.getBooks().then(function (list) {
      bookCopyBookSelect.innerHTML = '<option value="">请选择</option>';
      list.forEach(function (b) {
        const opt = document.createElement("option");
        opt.value = b.id;
        opt.textContent = (b.isbn || "") + " - " + (b.title || "");
        bookCopyBookSelect.appendChild(opt);
      });
    });
  }

  if (btnAddBookCopy) {
    btnAddBookCopy.addEventListener("click", function () {
      bookCopyBatchFormCard.style.display = "none";
      bookCopyFormTitle.textContent = "新增馆藏";
      bookCopyIdInput.value = "";
      bookCopyForm.reset();
      bookCopyStatusSelect.value = "IN_LIBRARY";
      loadBooksForCopySelect();
      showMessage(bookCopyFormMsg, "", false);
      bookCopyFormCard.style.display = "block";
    });
  }

  if (btnBatchAddBookCopy) {
    btnBatchAddBookCopy.addEventListener("click", function () {
      bookCopyFormCard.style.display = "none";
      bookCopyBatchForm.reset();
      batchBookCopyCountInput.value = "1";
      batchBookCopyStatusSelect.value = "IN_LIBRARY";
      loadBooksForBatchCopySelect();
      showMessage(bookCopyBatchFormMsg, "", false);
      bookCopyBatchFormCard.style.display = "block";
    });
  }

  function loadBooksForBatchCopySelect() {
    Api.getBooks().then(function (list) {
      batchBookCopyBookSelect.innerHTML = '<option value="">请选择</option>';
      list.forEach(function (b) {
        const opt = document.createElement("option");
        opt.value = b.id;
        opt.textContent = (b.isbn || "") + " - " + (b.title || "") + " (总册数: " + (b.totalCopy || 0) + ")";
        batchBookCopyBookSelect.appendChild(opt);
      });
    });
  }

  if (cancelBookCopyEditBtn) {
    cancelBookCopyEditBtn.addEventListener("click", function () {
      bookCopyFormCard.style.display = "none";
    });
  }

  if (cancelBatchBookCopyBtn) {
    cancelBatchBookCopyBtn.addEventListener("click", function () {
      bookCopyBatchFormCard.style.display = "none";
    });
  }

  if (bookCopyBatchForm) {
    bookCopyBatchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const bookId = batchBookCopyBookSelect.value;
      if (!bookId) {
        showMessage(bookCopyBatchFormMsg, "请选择图书", true);
        return;
      }
      const count = Number.parseInt(batchBookCopyCountInput.value, 10);
      if (count <= 0 || count > 100) {
        showMessage(bookCopyBatchFormMsg, "添加数量必须在1-100之间", true);
        return;
      }
      
      const payload = {
        bookId: Number(bookId),
        count: count,
        barcodePrefix: batchBookCopyBarcodePrefixInput.value.trim() || null,
        location: batchBookCopyLocationInput.value.trim() || null,
        status: batchBookCopyStatusSelect.value,
      };
      
      showMessage(bookCopyBatchFormMsg, "正在批量添加...", false);
      Api.createBookCopiesBatch(payload)
        .then(function (result) {
          showMessage(bookCopyBatchFormMsg, "成功添加 " + result.length + " 本馆藏", false);
          bookCopyBatchFormCard.style.display = "none";
          loadBookCopies();
          loadDashboard();
          showToast("批量添加成功，共添加 " + result.length + " 本馆藏", false);
        })
        .catch(function (err) {
          showMessage(bookCopyBatchFormMsg, err.message || "批量添加失败", true);
          showToast(err.message || "批量添加失败", true);
        });
    });
  }

  if (bookCopiesTbody) {
    bookCopiesTbody.addEventListener("click", function (e) {
      const target = e.target;
      if (target.dataset && target.dataset.action) {
        const id = target.dataset.id;
        if (target.dataset.action === "edit") {
          onEditBookCopy(id);
        } else if (target.dataset.action === "delete") {
          onDeleteBookCopy(id);
        }
      }
    });
  }

  function onEditBookCopy(id) {
    // 先隐藏顶部表单
    bookCopyFormCard.style.display = "none";
    
    // 移除已有的编辑表单行
    const existingFormRow = bookCopiesTbody.querySelector("tr.edit-form-row");
    if (existingFormRow) {
      existingFormRow.remove();
    }
    
    Promise.all([Api.getBookCopies(), Api.getBooks()]).then(function (
      results
    ) {
      const copies = results[0] || [];
      const books = results[1] || [];
      const c = copies.find(function (x) {
        return String(x.id) === String(id);
      });
      if (!c) return;
      
        // 找到对应的行
        const targetRow = bookCopiesTbody.querySelector('tr[data-id="' + id + '"]');
        if (!targetRow) return;
      
      // 构建图书下拉选项
      let bookOptions = '<option value="">请选择</option>';
      books.forEach(function (b) {
        const selected = (c.book && c.book.id === b.id) ? ' selected' : '';
        bookOptions += '<option value="' + b.id + '"' + selected + '>' + (b.isbn || "") + ' - ' + (b.title || "") + '</option>';
      });
      
      // 创建表单行
      const formRow = document.createElement("tr");
      formRow.className = "edit-form-row";
      formRow.innerHTML = '<td colspan="6" style="padding: 0;"><div class="card form-card" style="margin: 16px; border: none;"><h3>编辑馆藏</h3><form class="inline-edit-form"><input type="hidden" class="edit-id" value="' + (c.id || "") + '"><div class="grid grid-2"><div class="form-group"><label>条码</label><input class="edit-barcode" value="' + (c.barcode || "").replaceAll('"', '&quot;') + '" required></div><div class="form-group"><label>图书</label><select class="edit-book" required>' + bookOptions + '</select></div><div class="form-group"><label>位置</label><input class="edit-location" value="' + (c.location || "").replaceAll('"', '&quot;') + '"></div><div class="form-group"><label>状态</label><select class="edit-status" required><option value="IN_LIBRARY"' + (c.status === "IN_LIBRARY" ? ' selected' : '') + '>在馆</option><option value="BORROWED"' + (c.status === "BORROWED" ? ' selected' : '') + '>已借出</option><option value="LOST"' + (c.status === "LOST" ? ' selected' : '') + '>丢失</option><option value="DAMAGED"' + (c.status === "DAMAGED" ? ' selected' : '') + '>损坏</option></select></div></div><div class="form-actions"><button type="submit" class="btn btn-primary">保存</button><button type="button" class="btn btn-ghost cancel-inline-edit">取消</button></div><p class="form-message inline-edit-message"></p></form></div></td>';
      
      // 插入到目标行下方
      targetRow.parentNode.insertBefore(formRow, targetRow.nextSibling);
      
      // 滚动到表单位置
      formRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
      // 绑定表单提交事件
      const form = formRow.querySelector("form");
      form.addEventListener("submit", function(e) {
        e.preventDefault();
        const editId = formRow.querySelector(".edit-id").value;
        const payload = {
          barcode: formRow.querySelector(".edit-barcode").value.trim(),
          book: formRow.querySelector(".edit-book").value
            ? { id: Number(formRow.querySelector(".edit-book").value) }
            : null,
          location: formRow.querySelector(".edit-location").value.trim(),
          status: formRow.querySelector(".edit-status").value,
        };
        const msgEl = formRow.querySelector(".inline-edit-message");
        msgEl.textContent = "正在保存...";
        msgEl.classList.remove("error", "success");
        Api.updateBookCopy(editId, payload)
          .then(function() {
            formRow.remove();
            loadBookCopies();
            loadDashboard();
            showToast("保存成功", false);
          })
          .catch(function(err) {
            msgEl.textContent = err.message || "保存失败";
            msgEl.classList.add("error");
          });
      });
      
      // 绑定取消事件
      formRow.querySelector(".cancel-inline-edit").addEventListener("click", function() {
        formRow.remove();
      });
    });
  }

  function onDeleteBookCopy(id) {
    if (!confirm("确定要删除该馆藏吗？")) {
      return;
    }
    Api.deleteBookCopy(id)
      .then(function () {
        loadBookCopies();
        loadDashboard();
        showToast("删除成功", false);
      })
      .catch(function (err) {
        alert(err.message || "删除失败");
        showToast(err.message || "删除失败", true);
      });
  }

  // 读者类别管理相关元素和事件
  const btnAddReaderType = document.getElementById("btn-add-reader-type");
  const readerTypeFormCard = document.getElementById("reader-type-form-card");
  const readerTypeFormTitle = document.getElementById("reader-type-form-title");
  const readerTypeForm = document.getElementById("reader-type-form");
  const readerTypeFormMsg = document.getElementById("reader-type-form-message");
  const cancelReaderTypeEditBtn = document.getElementById("cancel-reader-type-edit");
  const readerTypeIdInput = document.getElementById("reader-type-id");
  const readerTypeNameInput = document.getElementById("reader-type-name");
  const readerTypeMaxBorrowCountInput = document.getElementById("reader-type-max-borrow-count");
  const readerTypeMaxBorrowDaysInput = document.getElementById("reader-type-max-borrow-days");
  const readerTypeFineRateInput = document.getElementById("reader-type-fine-rate");

  if (btnAddReaderType) {
    btnAddReaderType.addEventListener("click", function () {
      readerTypeFormTitle.textContent = "新增读者类别";
      readerTypeIdInput.value = "";
      readerTypeForm.reset();
      showMessage(readerTypeFormMsg, "", false);
      readerTypeFormCard.style.display = "block";
    });
  }

  if (cancelReaderTypeEditBtn) {
    cancelReaderTypeEditBtn.addEventListener("click", function () {
      readerTypeFormCard.style.display = "none";
    });
  }

  if (readerTypesTbody) {
    readerTypesTbody.addEventListener("click", function (e) {
      const target = e.target;
      if (target.dataset && target.dataset.action) {
        const id = target.dataset.id;
        if (target.dataset.action === "edit") {
          onEditReaderType(id);
        } else if (target.dataset.action === "delete") {
          onDeleteReaderType(id);
        }
      }
    });
  }

  function onEditReaderType(id) {
    readerTypeFormCard.style.display = "none";
    
    const existingFormRow = readerTypesTbody.querySelector("tr.edit-form-row");
    if (existingFormRow) {
      existingFormRow.remove();
    }
    
    Api.getReaderTypes().then(function (list) {
      const t = list.find(function (x) {
        return String(x.id) === String(id);
      });
      if (!t) return;
      
      const targetRow = readerTypesTbody.querySelector('tr[data-id="' + id + '"]');
      if (!targetRow) return;
      
      const formRow = document.createElement("tr");
      formRow.className = "edit-form-row";
      formRow.innerHTML = '<td colspan="6" style="padding: 0;"><div class="card form-card" style="margin: 16px; border: none;"><h3>编辑读者类别</h3><form class="inline-edit-form"><input type="hidden" class="edit-id" value="' + (t.id || "") + '"><div class="grid grid-2"><div class="form-group"><label>名称</label><input class="edit-name" value="' + (t.name || "").replaceAll('"', '&quot;') + '" required></div><div class="form-group"><label>最大借书数</label><input class="edit-max-borrow-count" type="number" min="1" value="' + (t.maxBorrowCount || 0) + '" required></div><div class="form-group"><label>最大借阅天数</label><input class="edit-max-borrow-days" type="number" min="1" value="' + (t.maxBorrowDays || 0) + '" required></div><div class="form-group"><label>每日罚款（元）</label><input class="edit-fine-rate" type="number" min="0" step="0.01" value="' + (t.fineRatePerDay || 0) + '" required></div></div><div class="form-actions"><button type="submit" class="btn btn-primary">保存</button><button type="button" class="btn btn-ghost cancel-inline-edit">取消</button></div><p class="form-message inline-edit-message"></p></form></div></td>';
      
      targetRow.parentNode.insertBefore(formRow, targetRow.nextSibling);
      formRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
      const form = formRow.querySelector("form");
      form.addEventListener("submit", function(e) {
        e.preventDefault();
        const editId = formRow.querySelector(".edit-id").value;
        const payload = {
          name: formRow.querySelector(".edit-name").value.trim(),
          maxBorrowCount: Number.parseInt(formRow.querySelector(".edit-max-borrow-count").value, 10),
          maxBorrowDays: Number.parseInt(formRow.querySelector(".edit-max-borrow-days").value, 10),
          fineRatePerDay: Number.parseFloat(formRow.querySelector(".edit-fine-rate").value),
        };
        const msgEl = formRow.querySelector(".inline-edit-message");
        msgEl.textContent = "正在保存...";
        msgEl.classList.remove("error", "success");
        Api.updateReaderType(editId, payload)
          .then(function() {
            formRow.remove();
            loadReaderTypes();
            showToast("保存成功", false);
          })
          .catch(function(err) {
            msgEl.textContent = err.message || "保存失败";
            msgEl.classList.add("error");
          });
      });
      
      formRow.querySelector(".cancel-inline-edit").addEventListener("click", function() {
        formRow.remove();
      });
    });
  }

  function onDeleteReaderType(id) {
    if (!confirm("确定要删除该读者类别吗？删除后，使用该类别的读者将无法正常借阅。")) {
      return;
    }
    Api.deleteReaderType(id)
      .then(function () {
        loadReaderTypes();
        showToast("删除成功", false);
      })
      .catch(function (err) {
        alert(err.message || "删除失败");
        showToast(err.message || "删除失败", true);
      });
  }

  if (readerTypeForm) {
    readerTypeForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const payload = {
        name: readerTypeNameInput.value.trim(),
        maxBorrowCount: Number.parseInt(readerTypeMaxBorrowCountInput.value, 10),
        maxBorrowDays: Number.parseInt(readerTypeMaxBorrowDaysInput.value, 10),
        fineRatePerDay: Number.parseFloat(readerTypeFineRateInput.value),
      };
      showMessage(readerTypeFormMsg, "正在保存...", false);
      Api.createReaderType(payload)
        .then(function () {
          showMessage(readerTypeFormMsg, "保存成功", false);
          readerTypeFormCard.style.display = "none";
          loadReaderTypes();
          showToast("保存成功", false);
        })
        .catch(function (err) {
          showMessage(readerTypeFormMsg, err.message || "保存失败", true);
          showToast(err.message || "保存失败", true);
        });
    });
  }

  // 作者管理相关元素和事件
  const btnAddAuthor = document.getElementById("btn-add-author");
  const authorFormCard = document.getElementById("author-form-card");
  const authorFormTitle = document.getElementById("author-form-title");
  const authorForm = document.getElementById("author-form");
  const authorFormMsg = document.getElementById("author-form-message");
  const cancelAuthorEditBtn = document.getElementById("cancel-author-edit");
  const authorIdInput = document.getElementById("author-id");
  const authorNameInput = document.getElementById("author-name");
  const authorCountryInput = document.getElementById("author-country");
  const authorRemarkInput = document.getElementById("author-remark");

  if (btnAddAuthor) {
    btnAddAuthor.addEventListener("click", function () {
      authorFormTitle.textContent = "新增作者";
      authorIdInput.value = "";
      authorForm.reset();
      showMessage(authorFormMsg, "", false);
      authorFormCard.style.display = "block";
    });
  }

  if (cancelAuthorEditBtn) {
    cancelAuthorEditBtn.addEventListener("click", function () {
      authorFormCard.style.display = "none";
    });
  }

  if (authorsTbody) {
    authorsTbody.addEventListener("click", function (e) {
      const target = e.target;
      if (target.dataset && target.dataset.action) {
        const id = target.dataset.id;
        if (target.dataset.action === "edit") {
          onEditAuthor(id);
        } else if (target.dataset.action === "delete") {
          onDeleteAuthor(id);
        }
      }
    });
  }

  function onEditAuthor(id) {
    authorFormCard.style.display = "none";
    
    const existingFormRow = authorsTbody.querySelector("tr.edit-form-row");
    if (existingFormRow) {
      existingFormRow.remove();
    }
    
    Api.getAuthors().then(function (list) {
      const a = list.find(function (x) {
        return String(x.id) === String(id);
      });
      if (!a) return;
      
      const targetRow = authorsTbody.querySelector('tr[data-id="' + id + '"]');
      if (!targetRow) return;
      
      const formRow = document.createElement("tr");
      formRow.className = "edit-form-row";
      formRow.innerHTML = '<td colspan="4" style="padding: 0;"><div class="card form-card" style="margin: 16px; border: none;"><h3>编辑作者</h3><form class="inline-edit-form"><input type="hidden" class="edit-id" value="' + (a.id || "") + '"><div class="grid grid-2"><div class="form-group"><label>姓名</label><input class="edit-name" value="' + (a.name || "").replaceAll('"', '&quot;') + '" required></div><div class="form-group"><label>国家</label><input class="edit-country" value="' + (a.country || "").replaceAll('"', '&quot;') + '"></div><div class="form-group" style="grid-column: 1 / -1"><label>备注</label><input class="edit-remark" value="' + (a.remark || "").replaceAll('"', '&quot;') + '"></div></div><div class="form-actions"><button type="submit" class="btn btn-primary">保存</button><button type="button" class="btn btn-ghost cancel-inline-edit">取消</button></div><p class="form-message inline-edit-message"></p></form></div></td>';
      
      targetRow.parentNode.insertBefore(formRow, targetRow.nextSibling);
      formRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      
      const form = formRow.querySelector("form");
      form.addEventListener("submit", function(e) {
        e.preventDefault();
        const editId = formRow.querySelector(".edit-id").value;
        const payload = {
          name: formRow.querySelector(".edit-name").value.trim(),
          country: formRow.querySelector(".edit-country").value.trim(),
          remark: formRow.querySelector(".edit-remark").value.trim(),
        };
        const msgEl = formRow.querySelector(".inline-edit-message");
        msgEl.textContent = "正在保存...";
        msgEl.classList.remove("error", "success");
        Api.updateAuthor(editId, payload)
          .then(function() {
            formRow.remove();
            loadAuthors();
            showToast("保存成功", false);
          })
          .catch(function(err) {
            msgEl.textContent = err.message || "保存失败";
            msgEl.classList.add("error");
          });
      });
      
      formRow.querySelector(".cancel-inline-edit").addEventListener("click", function() {
        formRow.remove();
      });
    });
  }

  function onDeleteAuthor(id) {
    if (!confirm("确定要删除该作者吗？")) {
      return;
    }
    Api.deleteAuthor(id)
      .then(function () {
        loadAuthors();
        showToast("删除成功", false);
      })
      .catch(function (err) {
        alert(err.message || "删除失败");
        showToast(err.message || "删除失败", true);
      });
  }

  if (authorForm) {
    authorForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const payload = {
        name: authorNameInput.value.trim(),
        country: authorCountryInput.value.trim(),
        remark: authorRemarkInput.value.trim(),
      };
      showMessage(authorFormMsg, "正在保存...", false);
      Api.createAuthor(payload)
        .then(function () {
          showMessage(authorFormMsg, "保存成功", false);
          authorFormCard.style.display = "none";
          loadAuthors();
          showToast("保存成功", false);
        })
        .catch(function (err) {
          showMessage(authorFormMsg, err.message || "保存失败", true);
          showToast(err.message || "保存失败", true);
        });
    });
  }

  if (bookCopyForm) {
    bookCopyForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const payload = {
        barcode: bookCopyBarcodeInput.value.trim(),
        book: bookCopyBookSelect.value
          ? { id: Number(bookCopyBookSelect.value) }
          : null,
        location: bookCopyLocationInput.value.trim(),
        status: bookCopyStatusSelect.value,
      };
      // 只用于新增
      showMessage(bookCopyFormMsg, "正在保存...", false);
      Api.createBookCopy(payload)
        .then(function () {
          showMessage(bookCopyFormMsg, "保存成功", false);
          bookCopyFormCard.style.display = "none";
          loadBookCopies();
          loadDashboard();
          showToast("保存成功", false);
        })
        .catch(function (err) {
          showMessage(bookCopyFormMsg, err.message || "保存失败", true);
          showToast(err.message || "保存失败", true);
        });
    });
  }
})();
