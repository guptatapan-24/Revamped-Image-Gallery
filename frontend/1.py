import os

# Configuration
EXCLUDE_DIRS = {
    "node_modules", ".git", ".next", "dist", "build", "__pycache__", ".vscode", ".idea", ".turbo"
}
EXCLUDE_FILES = {
    ".DS_Store", "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "tsconfig.json"
}
ROOT = "."  # Current directory

def generate_tree(dir_path, prefix=""):
    entries = sorted(os.listdir(dir_path))
    entries = [e for e in entries if e not in EXCLUDE_FILES and not e.startswith(".")]
    
    for index, entry in enumerate(entries):
        full_path = os.path.join(dir_path, entry)
        connector = "├── " if index < len(entries) - 1 else "└── "
        
        if os.path.isdir(full_path):
            if entry in EXCLUDE_DIRS:
                continue
            print(prefix + connector + entry + "/")
            extension = "│   " if index < len(entries) - 1 else "    "
            generate_tree(full_path, prefix + extension)
        else:
            print(prefix + connector + entry)

if __name__ == "__main__":
    print("Project Structure\n")
    generate_tree(ROOT)
