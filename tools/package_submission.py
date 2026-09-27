"""Create the two requested source archives with no credentials or caches."""

from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "delivery"


def pack(filename, paths):
    destination = OUTPUT / filename
    with ZipFile(destination, "w", ZIP_DEFLATED) as archive:
        for item in paths:
            source = ROOT / item
            if source.is_dir():
                files = sorted(source.rglob("*"))
            else:
                files = [source]
            for file in files:
                if not file.is_file() or "node_modules" in file.parts or file.suffix in {".log", ".pyc"}:
                    continue
                archive.write(file, file.relative_to(ROOT))
    return destination


def main():
    OUTPUT.mkdir(exist_ok=True)
    files = [
        pack("USERNAMEA2-clientside.zip", ["clientside"]),
        pack("USERNAMEA2-api.zip", ["api", "package.json", "package-lock.json", "README.md"]),
    ]
    for file in files:
        print(f"{file.name}: {file.stat().st_size} bytes")


if __name__ == "__main__":
    main()
