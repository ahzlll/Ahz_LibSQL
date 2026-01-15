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
  const fineReaderId = document.getElementById("fine-reader-id");
  const fineAmount = document.getElementById("fine-amount");
  const fineRemark = document.getElementById("fine-remark");

  function showMessage(el, text, isError) {
    el.textContent = text || "";
    el.classList.remove("error", "success");
    if (!text) return;
    el.classList.add(isError ? "error" : "success");
  }

  // 全局浮动提示
  function showToast(text, isError) {
    var toast = document.getElementById("toast");
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
    var clock = document.getElementById("header-clock");
    if (!clock) return;
    function tick() {
      var now = new Date();
      var s =
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
      const viewId = btn.getAttribute("data-view");
      navItems.forEach(function (b) {
        b.classList.toggle("active", b === btn);
      });
      views.forEach(function (v) {
        const isActive = v.id === viewId;
        v.style.display = isActive ? "block" : "none";
        v.classList.toggle("active-view", isActive);
      });
    });
  });

  // 仪表盘统计
  function loadDashboard() {
    Promise.all([Api.getReaders(), Api.getBooks(), Api.getBookCopies()])
      .then(function (results) {
        const readers = results[0] || [];
        const books = results[1] || [];
        const copies = results[2] || [];
        const borrowedCount = copies.filter(function (c) {
          return c.status === "BORROWED";
        }).length;
        statReaders.textContent = readers.length;
        statBooks.textContent = books.reduce(function (sum, b) {
          return sum + (b.totalCopy || 0);
        }, 0);
        statBorrowed.textContent = borrowedCount;
      })
      .catch(function () {
        statReaders.textContent = "-";
        statBooks.textContent = "-";
        statBorrowed.textContent = "-";
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
            (r.readerType && r.readerType.name ? r.readerType.name : "") +
            "</td>" +
            "<td>" +
            (r.borrowedCount || 0) +
            "</td>" +
            "<td>" +
            (r.totalFine || 0) +
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
              '<td colspan="5" style="text-align: center; padding: 24px; color: #6c857b; font-size: 15px;">暂无读者类别数据，请先添加读者类别</td>';
            readerTypesTbody.appendChild(tr);
          } else {
            types.forEach(function (t) {
              const tr = document.createElement("tr");
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
            '<td colspan="4" style="text-align: center; padding: 24px; color: #6c857b; font-size: 15px;">暂无出版社数据</td>';
          publishersTbody.appendChild(tr);
        } else {
          list.forEach(function (p) {
            const tr = document.createElement("tr");
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
            '<td colspan="3" style="text-align: center; padding: 24px; color: #6c857b; font-size: 15px;">暂无作者数据</td>';
          authorsTbody.appendChild(tr);
        } else {
          list.forEach(function (a) {
            const tr = document.createElement("tr");
            tr.innerHTML =
              "<td>" +
              (a.id || "") +
              "</td>" +
              "<td>" +
              (a.name || "") +
              "</td>" +
              "<td>" +
              (a.country || "") +
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
            '<td colspan="5" style="text-align: center; padding: 24px; color: #6c857b; font-size: 15px;">暂无图书数据</td>';
          booksTbody.appendChild(tr);
        } else {
          list.forEach(function (b) {
            const tr = document.createElement("tr");
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
            '<td colspan="5" style="text-align: center; padding: 24px; color: #6c857b; font-size: 15px;">暂无馆藏数据</td>';
          bookCopiesTbody.appendChild(tr);
        } else {
          list.forEach(function (c) {
            const tr = document.createElement("tr");
            tr.innerHTML =
              "<td>" +
              (c.id || "") +
              "</td>" +
              "<td>" +
              (c.barcode || "") +
              "</td>" +
              "<td>" +
              (c.book && c.book.title ? c.book.title : "") +
              "</td>" +
              "<td>" +
              (c.location || "") +
              "</td>" +
              "<td>" +
              (c.status || "") +
              "</td>";
            bookCopiesTbody.appendChild(tr);
          });
        }
      })
      .catch(function (err) {
        console.error("loadBookCopies error", err);
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
    Api.getReaders().then(function (list) {
      const r = list.find(function (x) {
        return String(x.id) === String(id);
      });
      if (!r) return;
      readerFormTitle.textContent = "编辑读者";
      readerIdInput.value = r.id || "";
      readerNoInput.value = r.readerNo || "";
      readerNameInput.value = r.name || "";
      readerGenderInput.value = r.gender || "";
      readerPhoneInput.value = r.phone || "";
      readerEmailInput.value = r.email || "";
      if (r.readerType && r.readerType.id) {
        readerTypeSelect.value = r.readerType.id;
      }
      showMessage(readerFormMsg, "", false);
      readerFormCard.style.display = "block";
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
      const id = readerIdInput.value;
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
      const req = id
        ? Api.updateReader(id, payload)
        : Api.createReader(payload);
      showMessage(readerFormMsg, "正在保存...", false);
      req
        .then(function () {
          showMessage(readerFormMsg, "保存成功", false);
          readerFormCard.style.display = "none";
          loadReaders();
          loadDashboard();
        })
        .catch(function (err) {
          showMessage(readerFormMsg, err.message || "保存失败", true);
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
      const extraFine = parseFloat(returnExtraFine.value || "0");
      if (!readerNo || !barcode) {
        showMessage(returnMessage, "请输入完整信息", true);
        return;
      }
      showMessage(returnMessage, "正在办理归还...", false);
      Api.returnBook({
        readerNo: readerNo,
        barcode: barcode,
        lostOrDamaged: lostOrDamaged,
        extraFine: isNaN(extraFine) ? 0 : extraFine,
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
          loadReaders();
        })
        .catch(function (err) {
          showMessage(returnMessage, err.message || "归还失败", true);
          showToast(err.message || "归还失败", true);
        });
    });
  }

  // 罚款
  if (fineForm) {
    fineForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const readerId = parseInt(fineReaderId.value, 10);
      const amount = parseFloat(fineAmount.value || "0");
      const remark = fineRemark.value.trim();
      if (!readerId || isNaN(amount) || amount <= 0) {
        showMessage(fineMessage, "请输入正确的读者ID和金额", true);
        return;
      }
      showMessage(fineMessage, "正在缴费...", false);
      Api.payFine({
        readerId: readerId,
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
        })
        .catch(function (err) {
          showMessage(fineMessage, err.message || "缴费失败", true);
          showToast(err.message || "缴费失败", true);
        });
    });
  }
})();
