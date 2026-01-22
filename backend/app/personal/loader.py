import os
from typing import List, Optional

class PersonalKBLoader:
    def __init__(self, data_dir: str = "data"):
        # Resolve data_dir relative to the backend root
        # This file is in backend/app/personal/loader.py
        # We want backend/data
        current_file = os.path.abspath(__file__)
        backend_root = os.path.dirname(os.path.dirname(os.path.dirname(current_file)))
        
        if os.path.isabs(data_dir):
            self.data_dir = data_dir
        else:
            self.data_dir = os.path.join(backend_root, data_dir)
            
        print(f"DEBUG source: PersonalKBLoader initialized with data_dir: {self.data_dir}")

    def load_file(self, filename: str) -> Optional[str]:
        filepath = os.path.join(self.data_dir, filename)
        if not os.path.exists(filepath):
            return None
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read()

    def get_all_docs(self) -> List[str]:
        if not os.path.exists(self.data_dir):
            return []
        
        docs = []
        for root, _, files in os.walk(self.data_dir):
            for file in files:
                if file.endswith(".md"):
                    # relative path from data_dir
                    rel_path = os.path.relpath(os.path.join(root, file), self.data_dir)
                    docs.append(rel_path)
        return docs
