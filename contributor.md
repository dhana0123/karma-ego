# Contributing to Karma-Ego

## For Vendors — Get Listed

Karma-Ego is an open initiative where companies find egocentric data vendors.

**How to join:**

1. Contribute minimum 500 hours of egocentric video data
2. Fill our intake form: karma-ego.com/contribute
3. We validate your data
4. Get listed on karma-ego.com
5. Companies find you, download your sample, contact you directly

**What you need:**
- 500hrs minimum egocentric video
- Metadata: task type, country, device, fps, resolution
- De-identified (faces blurred)
- CC-BY-4.0 compatible license

---

## For Developers — Improve the Platform

```bash
git clone https://github.com/karma-ego/karma-ego
cd karma-ego
pip install -e ".[dev]"
```

Areas to contribute:
- CLI improvements
- Validation pipeline
- Metadata schema
- New benchmark tasks
- Documentation

---

## For Researchers — Use and Cite

```python
from datasets import load_dataset
ds = load_dataset("karma-ego/global")
```

Citation:
```
@dataset{karma-ego,
  title={Karma-Ego: Open Egocentric Dataset for Physical AI},
  author={Karma-Ego Community},
  year={2025},
  url={https://huggingface.co/karma-ego}
}
```

---

## Contact

GitHub Issues: github.com/karma-ego/karma-ego/issues
Email: hello@karma-ego.com