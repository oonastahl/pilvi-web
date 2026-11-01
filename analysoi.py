from pathlib import Path
import re

# 1. Määritellään projektin kansio
ROOT = Path(".")

# 2. Määritellään tiedostopäätteet ja niitä vastaavat kielet
languages = {
    ".py": "Python",
    ".js": "JavaScript",
    ".ts": "TypeScript",
    ".html": "HTML",
    ".css": "CSS",
    ".java": "Java",
    ".php": "PHP",
}

# 3. Etsitään projektista käytetyt kielet
detected_languages = set()

for file in ROOT.rglob("*"):
    if any(part in {".git", "node_modules", ".venv", "__pycache__"} for part in file.parts):
        continue

    if file.is_file() and file.suffix in languages:
        detected_languages.add(languages[file.suffix])

# 4. Määritellään etsittävät suunnittelumallit
patterns = {
    "Singleton": r"getInstance|static\s+\w+\s+instance",
    "Factory Method": r"create[A-Z]\w*|factory",
    "Strategy": r"\w*Strategy\b",
    "Observer": r"notify|subscribe|observer",
    "Decorator": r"\w*Decorator\b|wrap",
}

# 5. Etsitään suunnittelumalleja kooditiedostoista
detected_patterns = set()

code_extensions = {
    ".py", ".js", ".ts", ".java", ".php"
}

for file in ROOT.rglob("*"):
    if any(part in {".git", "node_modules", ".venv", "__pycache__"} for part in file.parts):
        continue

    if not file.is_file() or file.suffix not in code_extensions:
        continue

    # Ei tutkita analyysiskriptiä itseään
    if file.name == "analysoi.py":
        continue

    try:
        content = file.read_text(encoding="utf-8")

        for pattern_name, pattern in patterns.items():
            if re.search(pattern, content, re.IGNORECASE):
                detected_patterns.add(pattern_name)

    except UnicodeDecodeError:
        continue

# 6. Muodostetaan analyysiraportti
report = []

report.append("REPOSITORY ANALYSIS REPORT")
report.append("==========================")

report.append("\nDetected languages:")

if detected_languages:
    for language in sorted(detected_languages):
        report.append(f"- {language}")
else:
    report.append("- No languages detected")

report.append("\nDetected design patterns:")

if detected_patterns:
    for pattern in sorted(detected_patterns):
        report.append(f"- {pattern}")
else:
    report.append("- No design patterns detected")

report.append("\nAnalysis completed.")

# 7. Tallennetaan ja tulostetaan raportti
report_text = "\n".join(report)

Path("analysis_report.txt").write_text(
    report_text,
    encoding="utf-8"
)

print(report_text)
