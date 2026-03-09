# Karma-Ego

**Open egocentric dataset for physical AI**

Community-driven, MIT-inspired, free forever.

[![HuggingFace](https://img.shields.io/badge/HuggingFace-karma--ego-yellow)](https://huggingface.co/karma-ego)
[![License](https://img.shields.io/badge/License-CC--BY--4.0-blue)](https://creativecommons.org/licenses/by/4.0/)
[![PyPI](https://img.shields.io/badge/pip-karma--ego-green)](https://pypi.org/project/karma-ego)

---

## Install

```bash
pip install karma-ego
```

## Quick Start

```bash
# Download by task
karmaego download --task cooking --country India

# Download specific vendor
karmaego download --vendor VisionLabs --flat

# Download with technical filters
karmaego download --task cooking --fps 60 --resolution 4K

# Search vendors
karmaego vendors --task cooking --country India

# Metadata only (fast)
karmaego download --metadata-only

# Specific version
karmaego download --task cooking --version v1.0
```

## Python API

```python
from datasets import load_dataset

ds = load_dataset("karma-ego/global", streaming=True)
for sample in ds["train"]:
    print(sample["video_uid"], sample["coarse_task"])
```

---

## Dataset Structure

```
karma-ego/
├── videos/
│   ├── vendor_VisionLabs/
│   │   ├── VL_00001.mp4
│   │   └── VL_00002.mp4
│   └── vendor_StudioAlpha/
│       └── SA_00001.mp4
├── metadata/
│   ├── global_metadata.csv
│   ├── vendor_catalog.csv
│   ├── VisionLabs_metadata.csv
│   └── StudioAlpha_metadata.csv
└── README.md
```

## Metadata Schema

| Column | Description |
|---|---|
| video_uid | Unique video ID |
| vendor | Vendor name |
| country | Collection country |
| device | Camera device |
| fps | Frames per second |
| resolution | Video resolution |
| duration_sec | Duration in seconds |
| coarse_task | Main task category |
| fine_task | Detailed task description |
| split | train / val / test |

---

## Contributing

Vendors: contribute 500hrs of egocentric data to get listed on karma-ego.com

See [CONTRIBUTING.md](CONTRIBUTING.md)

---

## License

Dataset: CC-BY-4.0
Code: MIT