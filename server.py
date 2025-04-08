from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import shutil
import json

app = Flask(__name__)

# Base directory for file operations (change this as needed)
BASE_DIRECTORY = os.path.abspath("./user_files")
os.makedirs(BASE_DIRECTORY, exist_ok=True)


@app.route("/", methods = ["GET"])
def home():
    return render_template("index2.html")

@app.route("/browse", methods = ["POST"])
def browse():

    cwd_segments = json.loads(request.form.get('relative_path'));
    cwd_full_path = os.path.join(BASE_DIRECTORY, *cwd_segments)
    children = os.listdir(cwd_full_path)

    print(cwd_segments, type(cwd_segments))
    print(children)

    children_info = [
        {
            "basename": x,
            "par_seg": cwd_segments, "full_seg": [*cwd_segments, x],
            "is_dir": os.path.isdir(os.path.join(cwd_full_path, x))
        }
        for x in children
    ]

    return jsonify(children_info = children_info)

@app.route("/make_dir", methods = ["POST"])
def make_dir():

    folder_info = json.loads(request.form.get('folder_info'))
    dir_full_path = os.path.join(BASE_DIRECTORY, *folder_info["cwd_seg"], folder_info["dir_basename"])
    
    if os.path.exists(dir_full_path):
        return jsonify(status = False, message = "Folder with given name already exists")
    
    os.mkdir(dir_full_path)
    return jsonify(status = True, message = "Folder created successfully")

@app.route("/rename", methods = ["POST"])
def rename():

    item_info = json.loads(request.form.get('item_info'))
    item_full_path_old = os.path.join(BASE_DIRECTORY, *item_info["cwd_seg"], item_info["basename"])
    item_full_path_new = os.path.join(BASE_DIRECTORY, *item_info["cwd_seg"], item_info["new_basename"])
    
    if os.path.exists(item_full_path_new):
        return jsonify(status = False, message = "Entity with given name already exists")
    
    os.rename(item_full_path_old, item_full_path_new)
    return jsonify(status = True, message = "Entity renamed successfully")

@app.route("/delete", methods = ["POST"])
def delete():

    item_info = json.loads(request.form.get('item_info'))
    item_full_path = os.path.join(BASE_DIRECTORY, *item_info["cwd_seg"], item_info["basename"])
    
    if not os.path.exists(item_full_path):
        return jsonify(status = False, message = "Entity does not exist")

    if os.path.isfile(item_full_path):
        os.remove(item_full_path)
        return jsonify(status = True, message = "File deleted successfully")

    else:
        shutil.rmtree(item_full_path)
        return jsonify(status = True, message = "Folder recursively deleted successfully")

if __name__ == '__main__':
    app.run(debug=True)