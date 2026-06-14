from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Inches, Pt


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "docs" / "agreements"
OUTPUT_DIR = ROOT / "generated" / "agreements"


def add_markdown_line(document: Document, line: str) -> None:
    if not line.strip():
        document.add_paragraph()
        return

    if line.startswith("# "):
        paragraph = document.add_heading(line[2:].strip(), level=0)
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
        return

    if line.startswith("## "):
        document.add_heading(line[3:].strip(), level=1)
        return

    if line.startswith("### "):
        document.add_heading(line[4:].strip(), level=2)
        return

    if line.startswith("- "):
        document.add_paragraph(line[2:].strip(), style="List Bullet")
        return

    stripped = line.strip()
    if len(stripped) > 3 and stripped[0].isdigit() and ". " in stripped[:4]:
        document.add_paragraph(stripped.split(". ", 1)[1], style="List Number")
        return

    paragraph = document.add_paragraph()
    paragraph.add_run(stripped.replace("**", ""))


def build_docx(source_path: Path, output_path: Path) -> None:
    document = Document()
    section = document.sections[0]
    section.top_margin = Inches(0.65)
    section.bottom_margin = Inches(0.65)
    section.left_margin = Inches(0.7)
    section.right_margin = Inches(0.7)

    styles = document.styles
    styles["Normal"].font.name = "Arial"
    styles["Normal"].font.size = Pt(10)

    for line in source_path.read_text(encoding="utf-8").splitlines():
        add_markdown_line(document, line)

    document.core_properties.author = "ZimHomes"
    document.core_properties.title = source_path.stem.replace("-", " ").title()
    document.save(output_path)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for source_path in [
        SOURCE_DIR / "residential-lease-agreement.md",
        SOURCE_DIR / "property-management-agreement.md",
    ]:
        output_path = OUTPUT_DIR / f"{source_path.stem}.docx"
        build_docx(source_path, output_path)
        print(output_path)


if __name__ == "__main__":
    main()
