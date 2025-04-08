from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import shutil

app = Flask(__name__)

# Base directory for file operations (change this as needed)
BASE_DIRECTORY = os.path.abspath("./user_files")
os.makedirs(BASE_DIRECTORY, exist_ok=True)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/browse")
def browse():
    rel_path = request.args.get("path", "")
    full_path = os.path.join(BASE_DIRECTORY, rel_path)

    if not os.path.exists(full_path):
        return jsonify({"error": "Path does not exist."}), 404

    items = []
    for entry in os.listdir(full_path):
        entry_path = os.path.join(full_path, entry)
        items.append({
            "name": entry,
            "is_dir": os.path.isdir(entry_path),
            "path": os.path.relpath(entry_path, BASE_DIRECTORY)
        })

    return jsonify(items)

@app.route("/upload", methods=["POST"])
def upload():
    path = request.form.get("path", "")
    base_path = os.path.join(BASE_DIRECTORY, path)
    os.makedirs(base_path, exist_ok=True)

    for file_key in request.files:
        file = request.files[file_key]
        rel_file_path = file.filename  # this includes subdirs from webkitRelativePath
        full_file_path = os.path.join(base_path, rel_file_path)
        os.makedirs(os.path.dirname(full_file_path), exist_ok=True)
        file.save(full_file_path)

    return "Uploaded"

@app.route("/delete", methods=["POST"])
def delete():
    rel_path = request.json.get('path')
    full_path = os.path.join(BASE_DIRECTORY, rel_path)
    if os.path.isdir(full_path):
        shutil.rmtree(full_path)
    else:
        os.remove(full_path)
    return "Deleted"

@app.route("/rename", methods=["POST"])
def rename():
    old_path = os.path.join(BASE_DIRECTORY, request.json['old'])
    new_path = os.path.join(BASE_DIRECTORY, request.json['new'])
    os.rename(old_path, new_path)
    return "Renamed"

@app.route("/move", methods=["POST"])
def move():
    src = os.path.join(BASE_DIRECTORY, request.json['src'])
    dst = os.path.join(BASE_DIRECTORY, request.json['dst'])
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.move(src, dst)
    return "Moved"

@app.route("/mkdir", methods=["POST"])
def mkdir():
    path = request.json.get("path")
    dir_path = os.path.join(BASE_DIRECTORY, path)
    os.makedirs(dir_path, exist_ok=True)
    return "Directory created"

@app.route("/download")
def download():
    rel_path = request.args.get("path")
    full_path = os.path.join(BASE_DIRECTORY, rel_path)
    directory = os.path.dirname(full_path)
    filename = os.path.basename(full_path)
    return send_from_directory(directory, filename, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)
