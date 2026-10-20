import sys
from pathlib import Path

# Makes `import app...` resolve regardless of where pytest is invoked from
# (mirrors the sys.path.insert(0, '.') hack the old backend/testing/ scripts
# used, but rootdir-relative instead of cwd-relative).
sys.path.insert(0, str(Path(__file__).parent))
