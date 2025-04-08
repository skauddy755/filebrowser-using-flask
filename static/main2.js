let current_working_directory = [];

function show_current_working_directory(children_info) {
    
    document.getElementById("cwd-label").textContent = ["app_data_root", "db", ...current_working_directory].join('/');
    
    const dirView = document.getElementById("directory-list-view");
    dirView.innerHTML = "";

    if(children_info.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="3" class="lead text-center">Feels lonely here!</td>`;
        dirView.appendChild(tr);
    }

    children_info.map(x => {
        const tr = document.createElement('tr');

        const td0 = document.createElement('td');
        const td1 = document.createElement('td');
        const td2 = document.createElement('td');
        tr.appendChild(td0);
        tr.appendChild(td1);
        tr.appendChild(td2);

        const select = document.createElement('input');
        select.type = "checkbox";
        select.className = "form-check-input";
        select.dataset.basename = x["basename"]
        select.dataset.par_seg = x["par_seg"]
        select.dataset.full_seg = x["full_seg"]
        select.dataset.is_dir = x["is_dir"]
        td0.appendChild(select);

        td1.textContent = x["basename"];

        const renameBtn = document.createElement('btn');
        renameBtn.className = "btn btn-sm btn-outline-warning m-1";
        renameBtn.textContent = "Rename";
        const deleteBtn = document.createElement('btn');
        deleteBtn.className = "btn btn-sm btn-outline-danger m-1";
        deleteBtn.textContent = "Delete";
        td2.appendChild(renameBtn);
        td2.appendChild(deleteBtn);

        if(x["is_dir"]) {
            td1.style.color = "#2389F6";
            td1.style.cursor = "pointer";

            td1.onclick = () => {
                current_working_directory = x["full_seg"];
                load_current_working_directory();
            };
        }

        dirView.appendChild(tr);
    });
}

function load_current_working_directory() {
    const formData = new FormData();
    formData.append("relative_path", JSON.stringify(current_working_directory));
    fetch(`${window.location.origin}/browse`, {method: "POST", body: formData})
        .then(response => response.json())
        .then(data => {
            console.log(data["children_info"]);
            show_current_working_directory(data["children_info"]);
        })
        .catch(error => {
            console.log("Error:", error);
            alert("Some error in loading current working directory!");
        });
}

function go_back() {
    current_working_directory.pop();
    load_current_working_directory();
}

function make_dir() {
    dir_basename = prompt("Enter Folder Name");
    if(!dir_basename) return;
    
    const formData = new FormData();
    formData.append("folder_info", JSON.stringify({"dir_basename": dir_basename, "cwd_seg": current_working_directory}));

    fetch(`${window.location.origin}/make_dir`, {method: "POST", body: formData})
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if(!data["status"]) alert(data["message"])
            load_current_working_directory();
        })
        .catch(error => {
            console.log("Error:", error);
            alert("Some error in creating new directory!");
        });
}

load_current_working_directory();