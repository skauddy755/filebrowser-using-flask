let currentPath = "";
let selectedPath = "";
let moveTarget = "";
let moveSelectedItem = "";

function openMoveModal(pathToMove) {
  moveSelectedItem = pathToMove;
  moveTarget = "";
  $('#moveModal').modal('show');
  loadMoveFolderList(""); // load root folders
}

function loadMoveFolderList(basePath) {
  fetch(`/browse?path=${basePath}`)
    .then(res => res.json())
    .then(items => {
      const list = document.getElementById("move-folder-list");
      list.innerHTML = "";

      if (basePath !== "") {
        const backBtn = document.createElement("li");
        backBtn.textContent = ".. (back)";
        backBtn.className = "list-group-item folder";
        backBtn.onclick = () => {
          const parts = basePath.split("/");
          parts.pop();
          loadMoveFolderList(parts.join("/"));
        };
        list.appendChild(backBtn);
      }

      items.forEach(item => {
        if (item.is_dir) {
          const li = document.createElement("li");
          li.className = "list-group-item folder";
          li.textContent = item.path;
          li.onclick = () => {
            moveTarget = item.path;
            loadMoveFolderList(item.path); // navigate into folder
          };
          list.appendChild(li);
        }
      });
    });
}

function confirmMove() {
  if (!moveTarget) return alert("Choose a destination folder.");
  const filename = moveSelectedItem.split("/").pop();
  const destination = `${moveTarget}/${filename}`;
  fetch("/move", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ src: moveSelectedItem, dst: destination })
  }).then(() => {
    $('#moveModal').modal('hide');
    loadDirectory(currentPath);
  });
}


function loadDirectory(path = "") {
    currentPath = path;
    fetch(`/browse?path=${path}`)
    .then(res => res.json())
    .then(items => {
        const list = document.getElementById("file-list");
        list.innerHTML = "";
        if (path !== "") {
            const back = document.createElement("li");
            back.textContent = ".. (back)";
            back.className = "list-group-item folder";
            back.onclick = () => {
                const parts = currentPath.split("/");
                parts.pop();
                loadDirectory(parts.join("/"));  
            };
            list.appendChild(back);
        }
        items.forEach(item => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        const label = document.createElement("span");
        label.className = item.is_dir ? "folder" : "file";
        label.textContent = item.name;
        label.onclick = () => {
            if (item.is_dir) {
                loadDirectory(item.path);
            } else {
                window.open(`/download?path=${item.path}`);
            }
        };
        const actions = document.createElement("span");
        actions.className = "actions btn-group btn-group-sm";

        const delBtn = document.createElement("button");
        delBtn.textContent = "🗑";
        delBtn.className = "btn btn-danger";
        delBtn.onclick = () => deleteItem(item.path);

        const renBtn = document.createElement("button");
        renBtn.textContent = "✏️";
        renBtn.className = "btn btn-warning";
        renBtn.onclick = () => {
            selectedPath = item.path;
            document.getElementById("rename-input").value = item.name;
            $('#renameModal').modal('show');
        };

        const moveBtn = document.createElement("button");
        moveBtn.textContent = "📁";
        moveBtn.className = "btn btn-info";
        moveBtn.onclick = () => {
            openMoveModal(item.path);
        };
          

        actions.append(renBtn, moveBtn, delBtn);
        li.append(label, actions);
        list.appendChild(li);
        });
    });
}

function uploadFile() {
    const input = document.getElementById("upload-input");
    const files = input.files;
    if (!files.length) return alert("No files selected.");
  
    const formData = new FormData();
    for (let file of files) {
      // Use webkitRelativePath to preserve folder structure
      formData.append("files[]", file, file.webkitRelativePath);
    }
    formData.append("path", currentPath); // where to drop it under
  
    fetch("/upload", {
      method: "POST",
      body: formData
    }).then(() => {
      alert("Upload complete");
      loadDirectory(currentPath);
    });
}
  

function deleteItem(path) {
    if (!confirm("Are you sure you want to delete this?")) return;
    fetch("/delete", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
    }).then(() => loadDirectory(currentPath));
}

function confirmRename() {
    const newName = document.getElementById("rename-input").value;
    const newPath = currentPath ? `${currentPath}/${newName}` : newName;
    fetch("/rename", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ old: selectedPath, new: newPath })
    }).then(() => {
        $('#renameModal').modal('hide');
        loadDirectory(currentPath);
    });
}

function confirmMove() {
    const moveTo = document.getElementById("move-input").value;
    const filename = selectedPath.split("/").pop();
    const destination = `${moveTo}/${filename}`;
    fetch("/move", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ src: selectedPath, dst: destination })
    }).then(() => {
        $('#moveModal').modal('hide');
        loadDirectory(currentPath);
    });
}

function createFolder() {
    const folderName = document.getElementById("mkdir-input").value;
    if (!folderName) return alert("Enter a folder name");
    const fullPath = currentPath ? `${currentPath}/${folderName}` : folderName;
    fetch("/mkdir", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: fullPath })
    }).then(() => {
        $('#mkdirModal').modal('hide');
        loadDirectory(currentPath);
    });
}

loadDirectory();