[#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SOSHAI.Helix - Contribution Validator v2.2.0
Merged from: Claude v2.0 (base) + Lusha v2.1 (schema + logging) + ChatGPT (type checks)
Excluded: Jaccard/sklearn (overhead), confidence field (self-reported), Ethics_Check string (symbolic)
"""

import json
import sys
from pathlib import Path
from datetime import datetime

try:
    from jsonschema import validate, ValidationError
    SCHEMA_VALIDATION = True
except ImportError:
    SCHEMA_VALIDATION = False
    print("⚠ jsonschema not installed — schema validation skipped")

SCHEMA_PATH = Path("TEMPLATE_SCHEMA.json")
REQUIRED_FIELDS = {"Detailed", "Summary", "Gap", "Next_Step"}
REQUIRED_METADATA = {"contributor_id", "timestamp", "human_reviewed"}
VALIDATION_LOG_PATH = Path("memory/validation_log.json")

def load_schema():
    if not SCHEMA_PATH.exists():
        return None
    with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

def validate_contribution(file_path, schema):
    print(f"\nValidating: {file_path}")
    errors = []

    # قراءة الملف
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        return False, [f"Invalid JSON: {e}"]
    except Exception as e:
        return False, [f"File error: {e}"]

    # 1. التحقق من التوافق مع TEMPLATE_SCHEMA.json
    if SCHEMA_VALIDATION and schema:
        try:
            validate(instance=data, schema=schema)
        except ValidationError as e:
            errors.append(f"Schema mismatch: {e.message}")

    # 2. الحقول الإلزامية
    missing_fields = REQUIRED_FIELDS - set(data.keys())
    if missing_fields:
        errors.append(f"Missing fields: {missing_fields}")

    # 3. البيانات الوصفية
    meta = data.get("_meta", {})
    if not isinstance(meta, dict):
        errors.append("'_meta' must be an object")
    else:
        missing_meta = REQUIRED_METADATA - set(meta.keys())
        if missing_meta:
            errors.append(f"Missing metadata: {missing_meta}")

        # 4. human_reviewed — boolean صريح (ChatGPT)
        if meta.get("human_reviewed") not in [True, False]:
            errors.append("'human_reviewed' must be explicit boolean")

        # 5. timestamp — تحقق من النوع (ChatGPT)
        ts = meta.get("timestamp", "")
        if not isinstance(ts, str) or not ts.strip():
            errors.append("'timestamp' must be a non-empty string")

        # 6. contributor_id — تحقق من النوع
        cid = meta.get("contributor_id", "")
        if not isinstance(cid, str) or not cid.strip():
            errors.append("'contributor_id' must be a non-empty string")

    # 7. Gap و Next_Step لا يقبلان قيمًا فارغة أو مؤقتة
    placeholders = {"none", "n/a", "لا يوجد", "tbd", "-", ""}
    for field in ["Gap", "Next_Step"]:
        value = str(data.get(field, "")).strip().lower()
        if value in placeholders:
            errors.append(f"'{field}' cannot be empty or placeholder")

    if errors:
        for e in errors:
            print(f"  ✗ {e}")
        return False, errors

    print(f"  ✓ Valid")
    return True, []

def save_log(log_entries):
    VALIDATION_LOG_PATH.parent.mkdir(exist_ok=True)
    existing = []
    if VALIDATION_LOG_PATH.exists():
        try:
            with open(VALIDATION_LOG_PATH, 'r', encoding='utf-8') as f:
                existing = json.load(f)
        except:
            pass
    with open(VALIDATION_LOG_PATH, 'w', encoding='utf-8') as f:
        json.dump(existing + log_entries, f, indent=2, ensure_ascii=False)

def main():
    contributions_dir = Path("contributions/compact")

    if not contributions_dir.exists():
        print("No contributions directory found.")
        sys.exit(0)

    files = list(contributions_dir.glob("*.json"))
    if not files:
        print("No contribution files to validate.")
        sys.exit(0)

    schema = load_schema()
    log_entries = []
    passed = 0

    for f in files:
        is_valid, errors = validate_contribution(f, schema)
        if is_valid:
            passed += 1
        log_entries.append({
            "file": str(f),
            "valid": is_valid,
            "errors": errors,
            "timestamp": datetime.now().isoformat()
        })

    save_log(log_entries)

    failed = len(files) - passed
    print(f"\nResults: {passed} passed, {failed} failed")
    print(f"Log saved to: {VALIDATION_LOG_PATH}")

    if failed > 0:
        print("Validation failed — fix errors before committing.")
        sys.exit(1)
    else:
        print("All contributions valid.")
        sys.exit(0)

if __name__ == "__main__":
    main()]
